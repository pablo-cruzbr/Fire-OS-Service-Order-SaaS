import { describe, it, expect, beforeEach } from 'vitest'
import { hash } from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'

// E2E de verdade, mesmo padrão do auth.e2e.test.ts: sobe o Express inteiro
// (validate() do Zod, authorizeOrdemdeServico/CASL, o Controller, o Service,
// o errorHandler) e bate nele via HTTP com supertest. Foco aqui é a
// ownership de OrdemdeServico — a mesma peça (authorizeOwnership + CASL) que
// protege o gap de "sequestro de conta" achado em user/update — nunca tinha
// sido provada passando pelo Express real, só em unitário com ability mockada.
async function criarUsuarioELogar(params: {
  role: 'ADMIN' | 'TECNICO' | 'USER'
  tecnico_id?: string | null
  email: string
}) {
  const passwordHash = await hash('senha123', 8)
  const user = await prismaClient.user.create({
    data: {
      name: 'Usuário Teste',
      email: params.email,
      password: passwordHash,
      role: params.role,
      tecnico_id: params.tecnico_id ?? null,
    },
  })

  const loginResponse = await supertest(app)
    .post('/session')
    .send({ email: params.email, password: 'senha123' })

  return { user, token: loginResponse.body.token as string }
}

describe('OrdemdeServico (E2E) — ciclo via HTTP + ownership CASL', () => {
  beforeEach(async () => {
    // Ordem importa: filhos antes dos pais, senão a FK derruba o deleteMany.
    await prismaClient.ordemdeServico.deleteMany()
    await prismaClient.user.deleteMany()
    await prismaClient.tecnico.deleteMany()
    await prismaClient.tipodeChamado.deleteMany()
    await prismaClient.statusOrdemdeServico.deleteMany()
  })

  it('cria uma OS via HTTP (Zod -> Controller -> Service -> Repository -> Postgres real)', async () => {
    const tipodeChamado = await prismaClient.tipodeChamado.create({ data: { name: 'Manutenção' } })
    const status = await prismaClient.statusOrdemdeServico.create({ data: { name: 'Aberto' } })
    const { user, token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin@teste.com' })

    const response = await supertest(app)
      .post('/ordemdeservico')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Impressora não liga',
        descricaodoProblemaouSolicitacao: 'Não liga de jeito nenhum',
        patrimoniodoequipamento: 'PAT-001',
        tipodeChamado_id: tipodeChamado.id,
        statusOrdemdeServico_id: status.id,
        user_id: user.id,
      })

    expect(response.status).toBe(200)
    expect(response.body.id).toBeDefined()
    expect(response.body.numeroOS).toBeDefined()

    const naBase = await prismaClient.ordemdeServico.findUnique({ where: { id: response.body.id } })
    expect(naBase?.name).toBe('Impressora não liga')
  })

  it('devolve 422 quando falta tipodeChamado_id — o Zod barra antes de chegar no Service', async () => {
    const { user, token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin2@teste.com' })

    const response = await supertest(app)
      .post('/ordemdeservico')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Sem tipo de chamado',
        descricaodoProblemaouSolicitacao: 'teste',
        patrimoniodoequipamento: 'PAT-002',
        user_id: user.id,
      })

    expect(response.status).toBe(422)
  })

  it('devolve 401 sem token', async () => {
    const response = await supertest(app).post('/ordemdeservico').send({})
    expect(response.status).toBe(401)
  })

  it('técnico dono consegue atualizar a própria OS', async () => {
    const tipodeChamado = await prismaClient.tipodeChamado.create({ data: { name: 'Manutenção' } })
    const status = await prismaClient.statusOrdemdeServico.create({ data: { name: 'Aberto' } })
    const tecnico = await prismaClient.tecnico.create({ data: { name: 'Técnico Dono' } })
    const { user, token } = await criarUsuarioELogar({
      role: 'TECNICO',
      tecnico_id: tecnico.id,
      email: 'tecnico-dono@teste.com',
    })

    const ordem = await prismaClient.ordemdeServico.create({
      data: {
        name: 'OS do dono',
        tipodeChamado: { connect: { id: tipodeChamado.id } },
        statusOrdemdeServico: { connect: { id: status.id } },
        user: { connect: { id: user.id } },
        tecnico: { connect: { id: tecnico.id } },
      },
    })

    const response = await supertest(app)
      .patch(`/ordemdeservico/update/${ordem.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ diagnostico: 'Fonte queimada' })

    expect(response.status).toBe(200)

    const naBase = await prismaClient.ordemdeServico.findUnique({ where: { id: ordem.id } })
    expect(naBase?.diagnostico).toBe('Fonte queimada')
  })

  it('técnico que NÃO é dono recebe 403 ao tentar atualizar a OS de outro técnico (CASL, ponta a ponta)', async () => {
    const tipodeChamado = await prismaClient.tipodeChamado.create({ data: { name: 'Manutenção' } })
    const status = await prismaClient.statusOrdemdeServico.create({ data: { name: 'Aberto' } })
    const tecnicoDono = await prismaClient.tecnico.create({ data: { name: 'Técnico Dono' } })
    const tecnicoOutro = await prismaClient.tecnico.create({ data: { name: 'Técnico Outro' } })

    const dono = await criarUsuarioELogar({ role: 'TECNICO', tecnico_id: tecnicoDono.id, email: 'dono@teste.com' })
    const outro = await criarUsuarioELogar({ role: 'TECNICO', tecnico_id: tecnicoOutro.id, email: 'outro@teste.com' })

    const ordem = await prismaClient.ordemdeServico.create({
      data: {
        name: 'OS do dono',
        tipodeChamado: { connect: { id: tipodeChamado.id } },
        statusOrdemdeServico: { connect: { id: status.id } },
        user: { connect: { id: dono.user.id } },
        tecnico: { connect: { id: tecnicoDono.id } },
      },
    })

    const response = await supertest(app)
      .patch(`/ordemdeservico/update/${ordem.id}`)
      .set('Authorization', `Bearer ${outro.token}`)
      .send({ diagnostico: 'Tentando mexer no chamado alheio' })

    expect(response.status).toBe(403)

    const naBase = await prismaClient.ordemdeServico.findUnique({ where: { id: ordem.id } })
    expect(naBase?.diagnostico).toBeNull()
  })

  it('devolve 404 ao tentar atualizar uma OS que não existe', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin3@teste.com' })

    const response = await supertest(app)
      .patch(`/ordemdeservico/update/${randomUUID()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ diagnostico: 'Qualquer coisa' })

    expect(response.status).toBe(404)
  })
})
