import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    controledeEstabilizadores: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import prismaClient from '../prisma'
import { EstabilizadoresRepository } from './EstabilizadoresRepository'

describe('EstabilizadoresRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create delega pro prismaClient.controledeEstabilizadores.create', async () => {
    vi.mocked(prismaClient.controledeEstabilizadores.create).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new EstabilizadoresRepository()

    await repository.create({ idChamado: 'CH-1' } as any)

    expect(prismaClient.controledeEstabilizadores.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { idChamado: 'CH-1' } })
    )
  })

  it('update delega pro prismaClient.controledeEstabilizadores.update com where correto', async () => {
    vi.mocked(prismaClient.controledeEstabilizadores.update).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new EstabilizadoresRepository()

    await repository.update('reg-1', { problema: 'Novo' } as any)

    expect(prismaClient.controledeEstabilizadores.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'reg-1' }, data: { problema: 'Novo' } })
    )
  })
})
