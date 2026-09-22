import { describe, it, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'
import { criarUsuarioELogar, limparBanco } from './helpers'

// Achado real no rollout de 22/09: o Create gravava em prismaClient.equipamento
// (tabela errada) enquanto o List sempre leu de prismaClient.estabilizadores —
// um estabilizador criado pelo formulário nunca aparecia na própria listagem.
// Além disso, o Frontend de registrar manutenção chama /list/estabilizadores
// (plural), rota que nunca existiu (só a singular) — Promise.all falhava
// silenciosamente e derrubava as 3 listas do formulário de uma vez. Os 2
// testes abaixo são a regressão de cada achado.
describe('EquipamentoEstabilizador (E2E)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  it('um estabilizador criado via POST aparece em GET /list/estabilizador (mesma tabela)', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-estab-equip@teste.com' })

    const createResponse = await supertest(app)
      .post('/equipamento/esbilizadores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Estabilizador SMS 1000VA', patrimonio: 'EST-500' })

    expect(createResponse.status).toBe(200)
    expect(createResponse.body.id).toBeDefined()

    const naBase = await prismaClient.estabilizadores.findUnique({ where: { id: createResponse.body.id } })
    expect(naBase).not.toBeNull()

    const listResponse = await supertest(app)
      .get('/list/estabilizador')
      .set('Authorization', `Bearer ${token}`)

    expect(listResponse.status).toBe(200)
    expect(listResponse.body.some((item: { id: string }) => item.id === createResponse.body.id)).toBe(true)
  })

  it('a mesma lista também responde em GET /list/estabilizadores (plural, chamado pelo formulário de manutenção)', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-estab-equip2@teste.com' })

    await supertest(app)
      .post('/equipamento/esbilizadores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Estabilizador SMS 2000VA', patrimonio: 'EST-501' })

    const listResponse = await supertest(app)
      .get('/list/estabilizadores')
      .set('Authorization', `Bearer ${token}`)

    expect(listResponse.status).toBe(200)
    expect(listResponse.body.some((item: { patrimonio: string }) => item.patrimonio === 'EST-501')).toBe(true)
  })

  it('devolve 422 quando falta patrimonio', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-estab-equip3@teste.com' })

    const response = await supertest(app)
      .post('/equipamento/esbilizadores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Estabilizador sem patrimônio' })

    expect(response.status).toBe(422)
  })
})
