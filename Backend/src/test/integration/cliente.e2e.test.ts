import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'
import { criarUsuarioELogar, limparBanco } from './helpers'

// Cliente é o módulo onde o rollout de 22/09 achou 2 rotas que o Frontend já
// chamava e nunca funcionaram: PATCH /cliente/:id (editar) nunca existiu, e
// DELETE /deletecliente/:id não tinha :id na rota (Express nunca casava).
// Os testes abaixo são a regressão direta desses 2 achados, não só o
// caminho feliz de criação.
describe('Cliente (E2E) — CRUD via HTTP', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  it('cria via HTTP', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-cliente@teste.com' })

    const response = await supertest(app)
      .post('/categorycliente')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente Teste', cnpj: '12345678000190', endereco: 'Rua A, 1', telefone: '11999999999' })

    expect(response.status).toBe(200)
    expect(response.body.id).toBeDefined()
  })

  it('devolve 422 quando falta cnpj', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-cliente2@teste.com' })

    const response = await supertest(app)
      .post('/categorycliente')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente Teste' })

    expect(response.status).toBe(422)
  })

  it('PATCH /cliente/:id atualiza via HTTP — regressão do achado de 22/09 (rota nunca existiu)', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-cliente3@teste.com' })
    const cliente = await prismaClient.cliente.create({
      data: { name: 'Cliente Original', cnpj: '11111111000191', endereco: 'Rua B, 2' },
    })

    const response = await supertest(app)
      .patch(`/cliente/${cliente.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente Renomeado', cnpj: '11111111000191', endereco: 'Rua B, 2' })

    expect(response.status).toBe(200)

    const naBase = await prismaClient.cliente.findUnique({ where: { id: cliente.id } })
    expect(naBase?.name).toBe('Cliente Renomeado')
  })

  it('PATCH /cliente/:id devolve 404 pra id inexistente', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-cliente4@teste.com' })

    const response = await supertest(app)
      .patch(`/cliente/${randomUUID()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Qualquer', cnpj: '00000000000000' })

    expect(response.status).toBe(404)
  })

  it('DELETE /deletecliente/:id apaga via HTTP — regressão do achado de 22/09 (rota sem :id)', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-cliente5@teste.com' })
    const cliente = await prismaClient.cliente.create({
      data: { name: 'Cliente Pra Apagar', cnpj: '22222222000192' },
    })

    const response = await supertest(app)
      .delete(`/deletecliente/${cliente.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)

    const naBase = await prismaClient.cliente.findUnique({ where: { id: cliente.id } })
    expect(naBase).toBeNull()
  })

  it('DELETE /deletecliente/:id toma 403 se não for ADMIN', async () => {
    const { token } = await criarUsuarioELogar({ role: 'TECNICO', email: 'tecnico-cliente@teste.com' })
    const cliente = await prismaClient.cliente.create({
      data: { name: 'Cliente Protegido', cnpj: '33333333000193' },
    })

    const response = await supertest(app)
      .delete(`/deletecliente/${cliente.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
  })
})
