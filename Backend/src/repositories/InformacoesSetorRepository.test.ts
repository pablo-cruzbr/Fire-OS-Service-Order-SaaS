import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    informacoesSetor: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import prismaClient from '../prisma'
import { InformacoesSetorRepository } from './InformacoesSetorRepository'

describe('InformacoesSetorRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create delega pro prismaClient.informacoesSetor.create com o select padrão', async () => {
    vi.mocked(prismaClient.informacoesSetor.create).mockResolvedValue({ id: 'info-1' } as any)
    const repository = new InformacoesSetorRepository()

    await repository.create({ setorId: 'setor-1' } as any)

    expect(prismaClient.informacoesSetor.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { setorId: 'setor-1' },
        select: expect.objectContaining({ id: true, usuario: true }),
      })
    )
  })

  it('update delega pro prismaClient.informacoesSetor.update com where e select corretos', async () => {
    vi.mocked(prismaClient.informacoesSetor.update).mockResolvedValue({ id: 'info-1' } as any)
    const repository = new InformacoesSetorRepository()

    await repository.update('info-1', { ramal: '5678' } as any)

    expect(prismaClient.informacoesSetor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'info-1' },
        data: { ramal: '5678' },
      })
    )
  })
})
