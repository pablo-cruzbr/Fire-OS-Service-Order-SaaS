import { describe, it, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'
import redisClient from '../../redis'
import { criarUsuarioELogar, limparBanco } from './helpers'

// Prova, contra um Redis real (TestContainers, ver globalSetup.ts), o que os
// testes unitários de ListTecnicoService/ListOrdemdeServicoService só provam
// com `vi.mock('../../redis')`: que o cache-aside (get -> miss -> set) e a
// invalidação (del no Create/Remove) realmente conversam com o Redis, não só
// com uma função fake que devolve o que o teste mandou.
describe('Cache-aside com Redis real (E2E)', () => {
  beforeEach(async () => {
    await limparBanco()
    await redisClient.flushall()
  })

  it('GET /listtecnico: primeira chamada é miss (grava no Redis), segunda é hit (não recalcula)', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-cache-tecnico@teste.com' })

    await prismaClient.tecnico.create({ data: { name: 'Técnico Um' } })

    const cacheKeyAntes = await redisClient.get('tecnicos:list')
    expect(cacheKeyAntes).toBeNull()

    const primeiraResposta = await supertest(app)
      .get('/listtecnico')
      .set('Authorization', `Bearer ${token}`)
    expect(primeiraResposta.status).toBe(200)
    expect(primeiraResposta.body.total).toBe(1)

    const cacheKeyDepois = await redisClient.get('tecnicos:list')
    expect(cacheKeyDepois).not.toBeNull()
    expect(JSON.parse(cacheKeyDepois as string).total).toBe(1)

    // Cria um segundo técnico direto no banco, sem passar pela API — se o
    // endpoint estiver mesmo lendo do cache, essa criação não deve aparecer
    // na resposta seguinte (TTL de 60s ainda não expirou).
    await prismaClient.tecnico.create({ data: { name: 'Técnico Dois' } })

    const segundaResposta = await supertest(app)
      .get('/listtecnico')
      .set('Authorization', `Bearer ${token}`)
    expect(segundaResposta.status).toBe(200)
    expect(segundaResposta.body.total).toBe(1)
  })

  it('POST /tecnico invalida o cache: a próxima listagem já reflete o novo técnico', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-cache-invalidate@teste.com' })

    await supertest(app).get('/listtecnico').set('Authorization', `Bearer ${token}`)
    expect(await redisClient.get('tecnicos:list')).not.toBeNull()

    const criarResposta = await supertest(app)
      .post('/tecnico')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Técnico Recém-criado' })
    expect(criarResposta.status).toBe(200)

    expect(await redisClient.get('tecnicos:list')).toBeNull()

    const resposta = await supertest(app).get('/listtecnico').set('Authorization', `Bearer ${token}`)
    expect(resposta.body.total).toBe(1)
    expect(resposta.body.controles[0].name).toBe('Técnico Recém-criado')
  })

  it('DELETE /removertecnico invalida o cache: a próxima listagem já reflete a remoção', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-cache-remove@teste.com' })
    const tecnico = await prismaClient.tecnico.create({ data: { name: 'Técnico a remover' } })

    await supertest(app).get('/listtecnico').set('Authorization', `Bearer ${token}`)
    expect(await redisClient.get('tecnicos:list')).not.toBeNull()

    const removerResposta = await supertest(app)
      .delete(`/removertecnico/${tecnico.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(removerResposta.status).toBe(200)

    expect(await redisClient.get('tecnicos:list')).toBeNull()

    const resposta = await supertest(app).get('/listtecnico').set('Authorization', `Bearer ${token}`)
    expect(resposta.body.total).toBe(0)
  })

  it('GET /listordemdeservico: totais ficam em cache por whereCondition, lista principal continua sempre fresca', async () => {
    const tipodeChamado = await prismaClient.tipodeChamado.create({ data: { name: 'Manutenção' } })
    const status = await prismaClient.statusOrdemdeServico.create({ data: { name: 'Aberto' } })
    const { user, token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-cache-os@teste.com' })

    await prismaClient.ordemdeServico.create({
      data: {
        name: 'OS cache 1',
        tipodeChamado: { connect: { id: tipodeChamado.id } },
        statusOrdemdeServico: { connect: { id: status.id } },
        user: { connect: { id: user.id } },
      },
    })

    const primeiraResposta = await supertest(app)
      .get('/listordemdeservico')
      .set('Authorization', `Bearer ${token}`)
    expect(primeiraResposta.status).toBe(200)
    expect(primeiraResposta.body.total).toBe(1)
    expect(primeiraResposta.body.controles).toHaveLength(1)

    await prismaClient.ordemdeServico.create({
      data: {
        name: 'OS cache 2',
        tipodeChamado: { connect: { id: tipodeChamado.id } },
        statusOrdemdeServico: { connect: { id: status.id } },
        user: { connect: { id: user.id } },
      },
    })

    const segundaResposta = await supertest(app)
      .get('/listordemdeservico')
      .set('Authorization', `Bearer ${token}`)
    expect(segundaResposta.status).toBe(200)
    // A lista (`controles`) não é cacheada — sempre bate direto no banco.
    expect(segundaResposta.body.controles).toHaveLength(2)
    // Já `total` vem de `getTotais`, que é cache-aside: com o cache ainda
    // quente (TTL de 30s), reflete a contagem de quando foi calculado.
    expect(segundaResposta.body.total).toBe(1)
  })
})
