import { describe, it, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'
import { criarUsuarioELogar, limparBanco } from './helpers'

// Regressão do rollout de 22/09 que fechou o backlog de List/Detail deixado
// pra trás em quase todo módulo: os 13 lookups (só List nunca tinha sido
// generalizado, mesmo Create/Delete já sendo genéricos), os List dos 8
// módulos de controles_forms (4 deles tinham um bug real de `execute()`
// chamado 2x + um campo `result` morto no JSON), InstituicaoUnidade
// (Create/List/Remove nunca tinham sido tocados, só Update), user
// List/Detail, e o filtro status_id/tipoOS_id do /listordemdeservico
// principal, que existia no Service mas nunca era passado pelo Controller.
describe('Backlog do rollout de 22/09 (E2E)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  it('GET /liststatusreparo (lookup generalizado) devolve o que foi criado via POST /statusreparo', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-backlog1@teste.com' })

    await supertest(app)
      .post('/statusreparo')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Aguardando peça' })

    const response = await supertest(app)
      .get('/liststatusreparo')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.some((item: { name: string }) => item.name === 'Aguardando peça')).toBe(true)
  })

  it('GET /listcontroledelaboratorio devolve a resposta sem o campo "result" morto (achado corrigido)', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-backlog2@teste.com' })
    const status = await prismaClient.statusControledeLaboratorio.create({ data: { name: 'AGUARDANDO CONSERTO' } })

    await prismaClient.controleDeLaboratorio.create({
      data: {
        nomedoEquipamento: 'Monitor',
        marca: 'LG',
        defeito: 'Tela quebrada',
        osDeAbertura: 'OS-900',
        osDeDevolucao: 'OS-901',
        data_de_Chegada: new Date(),
        data_de_Finalizacao: new Date(),
        statusControledeLaboratorio: { connect: { id: status.id } },
      },
    })

    const response = await supertest(app)
      .get('/listcontroledelaboratorio')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).not.toHaveProperty('result')
    expect(response.body.controles).toHaveLength(1)
    expect(response.body.totalAguardandoConserto).toBe(1)
  })

  it('InstituicaoUnidade: ciclo completo criar → listar → apagar via HTTP', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-backlog3@teste.com' })
    const tipo = await prismaClient.tipodeInstituicaoUnidade.create({ data: { name: 'Hospital' } })

    const createResponse = await supertest(app)
      .post('/categoryintituicao')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Unidade Backlog', endereco: 'Rua Backlog, 1', tipodeInstituicaoUnidade_id: tipo.id })

    expect(createResponse.status).toBe(200)
    const instituicaoId = createResponse.body.id

    const listResponse = await supertest(app)
      .get('/listinstuicao')
      .set('Authorization', `Bearer ${token}`)

    expect(listResponse.status).toBe(200)
    expect(listResponse.body.instituicoes.some((i: { id: string }) => i.id === instituicaoId)).toBe(true)

    const deleteResponse = await supertest(app)
      .delete('/deleteinstituicao')
      .query({ instituicao_id: instituicaoId })
      .set('Authorization', `Bearer ${token}`)

    expect(deleteResponse.status).toBe(200)

    const naBase = await prismaClient.instituicaoUnidade.findUnique({ where: { id: instituicaoId } })
    expect(naBase).toBeNull()
  })

  it('GET /listusers (ADMIN) devolve os usuários cadastrados', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-backlog4@teste.com' })

    const response = await supertest(app)
      .get('/listusers')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.users.some((u: { email: string }) => u.email === 'admin-backlog4@teste.com')).toBe(true)
  })

  it('GET /users/detail devolve os dados do próprio usuário autenticado', async () => {
    const { token, user } = await criarUsuarioELogar({ role: 'TECNICO', email: 'tecnico-backlog@teste.com' })

    const response = await supertest(app)
      .get('/users/detail')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(user.id)
  })

  it('GET /listordemdeservico filtra por status_id, achado que nunca era conectado no Controller', async () => {
    const { token, user } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-backlog5@teste.com' })
    const tipodeChamado = await prismaClient.tipodeChamado.create({ data: { name: 'Manutenção' } })
    const statusA = await prismaClient.statusOrdemdeServico.create({ data: { name: 'Aberto' } })
    const statusB = await prismaClient.statusOrdemdeServico.create({ data: { name: 'Fechado' } })

    await prismaClient.ordemdeServico.create({
      data: {
        name: 'OS aberta',
        tipodeChamado: { connect: { id: tipodeChamado.id } },
        statusOrdemdeServico: { connect: { id: statusA.id } },
        user: { connect: { id: user.id } },
      },
    })
    await prismaClient.ordemdeServico.create({
      data: {
        name: 'OS fechada',
        tipodeChamado: { connect: { id: tipodeChamado.id } },
        statusOrdemdeServico: { connect: { id: statusB.id } },
        user: { connect: { id: user.id } },
      },
    })

    const response = await supertest(app)
      .get('/listordemdeservico')
      .query({ status_id: statusA.id })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.controles).toHaveLength(1)
    expect(response.body.controles[0].name).toBe('OS aberta')
  })

  it('POST /ai/chat devolve 422 quando falta question', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-backlog6@teste.com' })

    const response = await supertest(app)
      .post('/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(response.status).toBe(422)
  })

  it('GET /users/detail devolve 401 sem token', async () => {
    const response = await supertest(app).get('/users/detail')
    expect(response.status).toBe(401)
  })

  it('DELETE /deleteinstituicao devolve 422 quando instituicao_id não é um uuid', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-backlog7@teste.com' })

    const response = await supertest(app)
      .delete('/deleteinstituicao')
      .query({ instituicao_id: 'não-é-um-uuid' })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(422)
  })
})
