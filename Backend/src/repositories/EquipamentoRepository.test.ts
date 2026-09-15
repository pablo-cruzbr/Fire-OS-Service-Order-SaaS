import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    equipamento: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import prismaClient from '../prisma'
import { EquipamentoRepository } from './EquipamentoRepository'

describe('EquipamentoRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('findByPatrimonio delega pro prismaClient.equipamento.findFirst filtrando por patrimonio', async () => {
    vi.mocked(prismaClient.equipamento.findFirst).mockResolvedValue({ id: 'eq-1' } as any)
    const repository = new EquipamentoRepository()

    await repository.findByPatrimonio('PAT-001')

    expect(prismaClient.equipamento.findFirst).toHaveBeenCalledWith({ where: { patrimonio: 'PAT-001' } })
  })

  it('create delega pro prismaClient.equipamento.create com o select padrão', async () => {
    vi.mocked(prismaClient.equipamento.create).mockResolvedValue({ id: 'eq-1' } as any)
    const repository = new EquipamentoRepository()

    await repository.create({ name: 'Notebook', patrimonio: 'PAT-001' } as any)

    expect(prismaClient.equipamento.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: 'Notebook', patrimonio: 'PAT-001' },
        select: expect.objectContaining({ id: true, name: true, patrimonio: true }),
      })
    )
  })

  it('update delega pro prismaClient.equipamento.update com where e select corretos', async () => {
    vi.mocked(prismaClient.equipamento.update).mockResolvedValue({ id: 'eq-1' } as any)
    const repository = new EquipamentoRepository()

    await repository.update('eq-1', { name: 'Notebook novo' } as any)

    expect(prismaClient.equipamento.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'eq-1' },
        data: { name: 'Notebook novo' },
      })
    )
  })

  it('delete delega pro prismaClient.equipamento.delete filtrando por id', async () => {
    vi.mocked(prismaClient.equipamento.delete).mockResolvedValue({ id: 'eq-1' } as any)
    const repository = new EquipamentoRepository()

    await repository.delete('eq-1')

    expect(prismaClient.equipamento.delete).toHaveBeenCalledWith({ where: { id: 'eq-1' } })
  })
})
