import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    controleDeLaudoTecnico: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import prismaClient from '../prisma'
import { LaudoTecnicoRepository } from './LaudoTecnicoRepository'

describe('LaudoTecnicoRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create delega pro prismaClient.controleDeLaudoTecnico.create com o include padrão', async () => {
    vi.mocked(prismaClient.controleDeLaudoTecnico.create).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new LaudoTecnicoRepository()

    await repository.create({ osLab: 'OS-1' } as any)

    expect(prismaClient.controleDeLaudoTecnico.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { osLab: 'OS-1' },
        include: expect.objectContaining({ equipamento: expect.anything(), tecnico: expect.anything() }),
      })
    )
  })

  it('update delega pro prismaClient.controleDeLaudoTecnico.update com where correto', async () => {
    vi.mocked(prismaClient.controleDeLaudoTecnico.update).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new LaudoTecnicoRepository()

    await repository.update('reg-1', { osLab: 'OS-2' } as any)

    expect(prismaClient.controleDeLaudoTecnico.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'reg-1' }, data: { osLab: 'OS-2' } })
    )
  })

  it('delete delega pro prismaClient.controleDeLaudoTecnico.delete', async () => {
    vi.mocked(prismaClient.controleDeLaudoTecnico.delete).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new LaudoTecnicoRepository()

    await repository.delete('reg-1')

    expect(prismaClient.controleDeLaudoTecnico.delete).toHaveBeenCalledWith({ where: { id: 'reg-1' } })
  })
})
