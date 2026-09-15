import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import prismaClient from '../prisma'
import { UserRepository } from './UserRepository'

describe('UserRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('findByEmail delega pro prismaClient.user.findFirst filtrando por email', async () => {
    vi.mocked(prismaClient.user.findFirst).mockResolvedValue({ id: 'user-1' } as any)
    const repository = new UserRepository()

    await repository.findByEmail('joao@allti.com')

    expect(prismaClient.user.findFirst).toHaveBeenCalledWith({ where: { email: 'joao@allti.com' } })
  })

  it('create delega pro prismaClient.user.create com o select padrão', async () => {
    vi.mocked(prismaClient.user.create).mockResolvedValue({ id: 'user-1' } as any)
    const repository = new UserRepository()

    await repository.create({ name: 'João', email: 'joao@allti.com', password: 'hash' } as any)

    expect(prismaClient.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: 'João', email: 'joao@allti.com', password: 'hash' },
        select: expect.objectContaining({ id: true, name: true, email: true }),
      })
    )
  })

  it('update delega pro prismaClient.user.update com where e select corretos', async () => {
    vi.mocked(prismaClient.user.update).mockResolvedValue({ id: 'user-1' } as any)
    const repository = new UserRepository()

    await repository.update('user-1', { name: 'Novo nome' } as any)

    expect(prismaClient.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: { name: 'Novo nome' },
      })
    )
  })
})
