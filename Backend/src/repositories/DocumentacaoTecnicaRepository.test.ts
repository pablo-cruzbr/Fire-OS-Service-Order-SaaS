import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    documentacaoTecnica: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import prismaClient from '../prisma'
import { DocumentacaoTecnicaRepository } from './DocumentacaoTecnicaRepository'

describe('DocumentacaoTecnicaRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create delega pro prismaClient.documentacaoTecnica.create com o include padrão', async () => {
    vi.mocked(prismaClient.documentacaoTecnica.create).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new DocumentacaoTecnicaRepository()

    await repository.create({ titulo: 'Manual' } as any)

    expect(prismaClient.documentacaoTecnica.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { titulo: 'Manual' },
        include: expect.objectContaining({ tecnico: expect.anything(), cliente: expect.anything() }),
      })
    )
  })

  it('update delega pro prismaClient.documentacaoTecnica.update com where correto', async () => {
    vi.mocked(prismaClient.documentacaoTecnica.update).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new DocumentacaoTecnicaRepository()

    await repository.update('reg-1', { titulo: 'Novo título' } as any)

    expect(prismaClient.documentacaoTecnica.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'reg-1' }, data: { titulo: 'Novo título' } })
    )
  })

  it('delete delega pro prismaClient.documentacaoTecnica.delete', async () => {
    vi.mocked(prismaClient.documentacaoTecnica.delete).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new DocumentacaoTecnicaRepository()

    await repository.delete('reg-1')

    expect(prismaClient.documentacaoTecnica.delete).toHaveBeenCalledWith({ where: { id: 'reg-1' } })
  })
})
