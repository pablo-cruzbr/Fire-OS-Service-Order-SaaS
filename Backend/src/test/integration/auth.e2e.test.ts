import { describe, it, expect, beforeEach } from 'vitest'
import { hash } from 'bcryptjs'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'

// E2E de verdade: sobe o Express inteiro (rotas, validate() do Zod, o
// Controller, o Service, o errorHandler global) e bate nele via HTTP com
// supertest — não chama a classe do Service direto. Prova o contrato de
// ponta a ponta: um payload malformado é rejeitado pelo Zod ANTES de chegar
// no Service, e um erro de negócio (senha errada) sai formatado pelo
// errorHandler, exatamente como sairia pra um cliente de verdade.
describe('POST /session (E2E)', () => {
  beforeEach(async () => {
    await prismaClient.user.deleteMany()
  })

  it('devolve 200 e um token quando email e senha estão corretos', async () => {
    const passwordHash = await hash('senha123', 8)
    await prismaClient.user.create({
      data: { name: 'Maria Técnica', email: 'maria@teste.com', password: passwordHash },
    })

    const response = await supertest(app)
      .post('/session')
      .send({ email: 'maria@teste.com', password: 'senha123' })

    expect(response.status).toBe(200)
    expect(response.body.token).toBeDefined()
    expect(response.body.email).toBe('maria@teste.com')
  })

  it('devolve 401 quando a senha está errada (não 500, não vaza detalhe do erro)', async () => {
    const passwordHash = await hash('senha123', 8)
    await prismaClient.user.create({
      data: { name: 'Maria Técnica', email: 'maria@teste.com', password: passwordHash },
    })

    const response = await supertest(app)
      .post('/session')
      .send({ email: 'maria@teste.com', password: 'senha-errada' })

    expect(response.status).toBe(401)
  })

  it('devolve 401 quando o e-mail não existe', async () => {
    const response = await supertest(app)
      .post('/session')
      .send({ email: 'ninguem@teste.com', password: 'qualquer' })

    expect(response.status).toBe(401)
  })

  it('devolve 422 quando falta o email — o Zod barra antes de chegar no Service', async () => {
    const response = await supertest(app)
      .post('/session')
      .send({ password: 'qualquer' })

    expect(response.status).toBe(422)
  })
})
