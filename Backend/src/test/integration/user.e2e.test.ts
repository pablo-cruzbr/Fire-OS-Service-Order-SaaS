import { describe, it, expect, beforeEach } from 'vitest'
import { hash, compare } from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'

// E2E de verdade, mesmo padrão dos outros arquivos deste diretório. Foco
// aqui: PATCH /user/update/:id só tem `can(['ADMIN'])` como barreira (RBAC
// simples, não ownership por dono como em OrdemdeServico) — é a rota do
// achado mais grave do rollout (15/09): sem essa checagem, qualquer usuário
// autenticado trocava senha/email de QUALQUER outro usuário, sequestro de
// conta. Esses testes provam o fix passando pelo Express real, não só a
// existência do middleware no código.
async function criarUsuarioELogar(params: { role: 'ADMIN' | 'TECNICO' | 'USER'; email: string }) {
  const passwordHash = await hash('senha123', 8)
  const user = await prismaClient.user.create({
    data: { name: 'Usuário Teste', email: params.email, password: passwordHash, role: params.role },
  })

  const loginResponse = await supertest(app)
    .post('/session')
    .send({ email: params.email, password: 'senha123' })

  return { user, token: loginResponse.body.token as string }
}

describe('user (E2E) — cadastro público + update restrito a ADMIN', () => {
  beforeEach(async () => {
    await prismaClient.user.deleteMany()
  })

  it('POST /users cadastra um usuário novo sem precisar de token (cadastro público)', async () => {
    const response = await supertest(app).post('/users').send({
      name: 'Novo Usuário',
      email: 'novo@teste.com',
      password: 'senha123',
    })

    expect(response.status).toBe(200)
    expect(response.body.user.email).toBe('novo@teste.com')

    const naBase = await prismaClient.user.findUnique({ where: { email: 'novo@teste.com' } })
    expect(naBase).not.toBeNull()
    expect(naBase?.password).not.toBe('senha123')
  })

  it('POST /users devolve 409 quando o email já existe (constraint @unique, via Service)', async () => {
    await prismaClient.user.create({
      data: { name: 'Já existe', email: 'duplicado@teste.com', password: 'hash-fake' },
    })

    const response = await supertest(app).post('/users').send({
      name: 'Outra pessoa',
      email: 'duplicado@teste.com',
      password: 'senha123',
    })

    expect(response.status).toBe(409)
  })

  it('POST /users devolve 422 quando a senha é curta demais — Zod barra antes do Service', async () => {
    const response = await supertest(app).post('/users').send({
      name: 'Senha Curta',
      email: 'curta@teste.com',
      password: '123',
    })

    expect(response.status).toBe(422)
  })

  it('PATCH /user/update/:id sem token devolve 401', async () => {
    const response = await supertest(app)
      .patch(`/user/update/${randomUUID()}`)
      .send({ name: 'Tentativa' })

    expect(response.status).toBe(401)
  })

  it('ADMIN consegue atualizar a conta de outro usuário, senha inclusive', async () => {
    const alvo = await prismaClient.user.create({
      data: { name: 'Alvo', email: 'alvo@teste.com', password: await hash('senha-antiga', 8), role: 'USER' },
    })
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin@teste.com' })

    const response = await supertest(app)
      .patch(`/user/update/${alvo.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alvo Renomeado', password: 'senha-nova-123' })

    expect(response.status).toBe(200)

    const naBase = await prismaClient.user.findUnique({ where: { id: alvo.id } })
    expect(naBase?.name).toBe('Alvo Renomeado')
    expect(await compare('senha-nova-123', naBase!.password)).toBe(true)
  })

  it('usuário comum (não-ADMIN) autenticado toma 403 ao tentar atualizar a conta de OUTRO usuário — regressão do sequestro de conta', async () => {
    const alvo = await prismaClient.user.create({
      data: { name: 'Alvo', email: 'alvo2@teste.com', password: await hash('senha-antiga', 8), role: 'USER' },
    })
    const { token } = await criarUsuarioELogar({ role: 'TECNICO', email: 'tecnico@teste.com' })

    const response = await supertest(app)
      .patch(`/user/update/${alvo.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'senha-roubada-123' })

    expect(response.status).toBe(403)

    const naBase = await prismaClient.user.findUnique({ where: { id: alvo.id } })
    expect(await compare('senha-antiga', naBase!.password)).toBe(true)
  })
})
