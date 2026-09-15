import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    controleDeLaboratorio: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import prismaClient from '../prisma'
import { LaboratorioRepository } from './LaboratorioRepository'

describe('LaboratorioRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create delega pro prismaClient.controleDeLaboratorio.create', async () => {
    vi.mocked(prismaClient.controleDeLaboratorio.create).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new LaboratorioRepository()

    await repository.create({ nomedoEquipamento: 'Impressora' } as any)

    expect(prismaClient.controleDeLaboratorio.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { nomedoEquipamento: 'Impressora' } })
    )
  })

  it('update delega pro prismaClient.controleDeLaboratorio.update com where correto', async () => {
    vi.mocked(prismaClient.controleDeLaboratorio.update).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new LaboratorioRepository()

    await repository.update('reg-1', { defeito: 'Novo defeito' } as any)

    expect(prismaClient.controleDeLaboratorio.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'reg-1' }, data: { defeito: 'Novo defeito' } })
    )
  })

  it('delete delega pro prismaClient.controleDeLaboratorio.delete', async () => {
    vi.mocked(prismaClient.controleDeLaboratorio.delete).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new LaboratorioRepository()

    await repository.delete('reg-1')

    expect(prismaClient.controleDeLaboratorio.delete).toHaveBeenCalledWith({ where: { id: 'reg-1' } })
  })
})
