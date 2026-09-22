import { describe, it, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'
import { criarUsuarioELogar, limparBanco } from './helpers'

// As 13 tabelas de "lookup" de status_categorias (statusCompras, tipodeChamado,
// statusReparo, etc.) compartilham 1 schema + 1 Repository genérico + 1
// Service genérico (ver GUIA-ZOD-REPOSITORY.md, "Oitavo passo") — testar 3
// endpoints diferentes prova que o padrão genérico funciona de ponta a ponta
// via HTTP pra modelos diferentes, sem precisar de 13 arquivos quase
// idênticos (mesmo raciocínio já usado nos testes unitários desse grupo).
describe('status_categorias — lookup genérico (E2E)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  it('cria em 3 modelos diferentes via HTTP, cada um com sua própria rota', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-lookup@teste.com' })

    const statusCompras = await supertest(app)
      .post('/statuscompras')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Aguardando entrega' })
    expect(statusCompras.status).toBe(200)
    expect(statusCompras.body.name).toBe('Aguardando entrega')

    const tipodeChamado = await supertest(app)
      .post('/tipodechamado')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Manutenção preventiva' })
    expect(tipodeChamado.status).toBe(200)
    expect(tipodeChamado.body.name).toBe('Manutenção preventiva')

    const statusReparo = await supertest(app)
      .post('/statusreparo')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Reparo finalizado' })
    expect(statusReparo.status).toBe(200)
    expect(statusReparo.body.name).toBe('Reparo finalizado')

    const naBase = await prismaClient.statusCompras.findUnique({ where: { id: statusCompras.body.id } })
    expect(naBase).not.toBeNull()
  })

  it('devolve 422 quando falta name', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-lookup2@teste.com' })

    const response = await supertest(app)
      .post('/statuscompras')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(response.status).toBe(422)
  })

  it('devolve 401 sem token', async () => {
    const response = await supertest(app).post('/statuscompras').send({ name: 'Qualquer coisa' })
    expect(response.status).toBe(401)
  })

  it('lista o que foi criado (GET /liststatuscompras)', async () => {
    await prismaClient.statusCompras.create({ data: { name: 'Compra finalizada' } })
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-lookup3@teste.com' })

    const response = await supertest(app)
      .get('/liststatuscompras')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.some((item: { name: string }) => item.name === 'Compra finalizada')).toBe(true)
  })

  // Único lookup com rota de Delete hoje — id via query string
  // (?statusOrdem_id=), não via :id no path, contrato que o Frontend já usa.
  it('remove statusOrdemdeServico via query string', async () => {
    const status = await prismaClient.statusOrdemdeServico.create({ data: { name: 'Cancelado' } })
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-lookup4@teste.com' })

    const response = await supertest(app)
      .delete('/removestatusordemdeservico')
      .query({ statusOrdem_id: status.id })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)

    const naBase = await prismaClient.statusOrdemdeServico.findUnique({ where: { id: status.id } })
    expect(naBase).toBeNull()
  })
})
