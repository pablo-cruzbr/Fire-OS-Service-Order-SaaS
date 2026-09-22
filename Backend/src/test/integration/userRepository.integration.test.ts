import { describe, it, expect, beforeEach } from 'vitest'
import { UserRepository } from '../../repositories/UserRepository'
import { limparBanco } from './helpers'

// Integração de verdade: bate num Postgres real (subido pelo globalSetup via
// TestContainers), não num mock do Prisma — prova que o contrato com o banco
// está certo (ex.: a constraint @unique de email do schema.prisma), coisa que
// o teste unitário com repository fake não prova.
describe('UserRepository (integração, Postgres real)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  it('cria e busca um usuário de verdade no banco', async () => {
    const repository = new UserRepository()

    await repository.create({ name: 'João', email: 'joao@teste.com', password: 'hash-fake' })
    const encontrado = await repository.findByEmail('joao@teste.com')

    expect(encontrado?.name).toBe('João')
    expect(encontrado?.email).toBe('joao@teste.com')
  })

  it('a constraint @unique de email no schema.prisma rejeita e-mail duplicado de verdade', async () => {
    const repository = new UserRepository()

    await repository.create({ name: 'João', email: 'joao@teste.com', password: 'hash-fake' })

    await expect(
      repository.create({ name: 'Outro João', email: 'joao@teste.com', password: 'hash-fake' })
    ).rejects.toThrow()
  })

  it('findByEmail devolve null quando o e-mail não existe (não lança erro)', async () => {
    const repository = new UserRepository()

    const encontrado = await repository.findByEmail('ninguem@teste.com')

    expect(encontrado).toBeNull()
  })
})
