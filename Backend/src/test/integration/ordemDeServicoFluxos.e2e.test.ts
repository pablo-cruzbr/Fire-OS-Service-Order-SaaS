import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'
import { criarUsuarioELogar, limparBanco } from './helpers'

// Fluxos de OrdemdeServico que ficaram fora de ordemDeServico.e2e.test.ts
// (criação + ownership): listagem e o ciclo de controle de tempo
// (iniciar/pausar/retomar/concluir). Esse módulo de tempo ainda não passou
// pelo rollout de Zod/Repository (item 1 do checklist) — é old-style
// (try/catch manual, sem Zod), então aqui a prova é sobre o comportamento
// real da máquina de estados, não sobre validação de payload.
describe('OrdemdeServico — listagem e controle de tempo (E2E)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  it('GET /listordemdeservico devolve as ordens criadas', async () => {
    const tipodeChamado = await prismaClient.tipodeChamado.create({ data: { name: 'Manutenção' } })
    const status = await prismaClient.statusOrdemdeServico.create({ data: { name: 'Aberto' } })
    const { user, token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-list@teste.com' })

    await prismaClient.ordemdeServico.create({
      data: {
        name: 'OS para listar',
        tipodeChamado: { connect: { id: tipodeChamado.id } },
        statusOrdemdeServico: { connect: { id: status.id } },
        user: { connect: { id: user.id } },
      },
    })

    const response = await supertest(app)
      .get('/listordemdeservico')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
  })

  it('ciclo completo: iniciar -> pausar -> retomar -> concluir', async () => {
    const tipodeChamado = await prismaClient.tipodeChamado.create({ data: { name: 'Manutenção' } })
    const statusAberto = await prismaClient.statusOrdemdeServico.create({ data: { name: 'Aberto' } })
    await prismaClient.statusOrdemdeServico.create({ data: { name: 'EM ANDAMENTO' } })
    await prismaClient.statusOrdemdeServico.create({ data: { name: 'PAUSADA' } })
    await prismaClient.statusOrdemdeServico.create({ data: { name: 'CONCLUIDA' } })
    const { user, token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-tempo@teste.com' })

    const ordem = await prismaClient.ordemdeServico.create({
      data: {
        name: 'OS com controle de tempo',
        tipodeChamado: { connect: { id: tipodeChamado.id } },
        statusOrdemdeServico: { connect: { id: statusAberto.id } },
        user: { connect: { id: user.id } },
      },
    })

    const iniciarResponse = await supertest(app)
      .patch(`/ordemdeservico/iniciar/${ordem.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(iniciarResponse.status).toBe(200)
    expect(iniciarResponse.body.statusOrdemdeServico.name).toBe('EM ANDAMENTO')

    const pausarResponse = await supertest(app)
      .patch(`/ordemdeservico/pausar/${ordem.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(pausarResponse.status).toBe(200)
    expect(pausarResponse.body.statusOrdemdeServico.name).toBe('PAUSADA')

    const retomarResponse = await supertest(app)
      .patch(`/ordemdeservico/retomar/${ordem.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(retomarResponse.status).toBe(200)
    expect(retomarResponse.body.statusOrdemdeServico.name).toBe('EM ANDAMENTO')

    const concluirResponse = await supertest(app)
      .patch(`/ordemdeservico/concluir/${ordem.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(concluirResponse.status).toBe(200)
    expect(concluirResponse.body.statusOrdemdeServico.name).toBe('CONCLUIDA')

    const tempoResponse = await supertest(app)
      .get(`/ordemdeservico/tempo/${ordem.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(tempoResponse.status).toBe(200)
    expect(tempoResponse.body.startedAt).not.toBeNull()
  })

  it('iniciar devolve 404 quando a ordem não existe', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-tempo2@teste.com' })

    const response = await supertest(app)
      .patch(`/ordemdeservico/iniciar/${randomUUID()}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
  })

  it('pausar devolve 400 quando a OS não está EM ANDAMENTO', async () => {
    const tipodeChamado = await prismaClient.tipodeChamado.create({ data: { name: 'Manutenção' } })
    const statusAberto = await prismaClient.statusOrdemdeServico.create({ data: { name: 'Aberto' } })
    const { user, token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-tempo3@teste.com' })

    const ordem = await prismaClient.ordemdeServico.create({
      data: {
        name: 'OS recém-criada, nunca iniciada',
        tipodeChamado: { connect: { id: tipodeChamado.id } },
        statusOrdemdeServico: { connect: { id: statusAberto.id } },
        user: { connect: { id: user.id } },
      },
    })

    const response = await supertest(app)
      .patch(`/ordemdeservico/pausar/${ordem.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
  })
})
