import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    controleDeAssistenciaTecnica: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import prismaClient from '../prisma'
import { AssistenciaTecnicaRepository } from './AssistenciaTecnicaRepository'

describe('AssistenciaTecnicaRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create delega pro prismaClient.controleDeAssistenciaTecnica.create com o include padrão', async () => {
    vi.mocked(prismaClient.controleDeAssistenciaTecnica.create).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new AssistenciaTecnicaRepository()

    await repository.create({ name: 'Teste' } as any)

    expect(prismaClient.controleDeAssistenciaTecnica.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: 'Teste' },
        include: expect.objectContaining({ equipamento: expect.anything(), tecnico: expect.anything() }),
      })
    )
  })

  it('update delega pro prismaClient.controleDeAssistenciaTecnica.update com where correto', async () => {
    vi.mocked(prismaClient.controleDeAssistenciaTecnica.update).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new AssistenciaTecnicaRepository()

    await repository.update('reg-1', { observacoes: 'Nova' } as any)

    expect(prismaClient.controleDeAssistenciaTecnica.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'reg-1' }, data: { observacoes: 'Nova' } })
    )
  })

  it('delete delega pro prismaClient.controleDeAssistenciaTecnica.delete', async () => {
    vi.mocked(prismaClient.controleDeAssistenciaTecnica.delete).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new AssistenciaTecnicaRepository()

    await repository.delete('reg-1')

    expect(prismaClient.controleDeAssistenciaTecnica.delete).toHaveBeenCalledWith({ where: { id: 'reg-1' } })
  })
})
