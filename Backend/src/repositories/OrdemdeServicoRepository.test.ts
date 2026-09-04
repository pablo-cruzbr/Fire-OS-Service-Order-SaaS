import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    ordemdeServico: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import prismaClient from '../prisma'
import { OrdemdeServicoRepository } from './OrdemdeServicoRepository'

describe('OrdemdeServicoRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create delega pro prismaClient.ordemdeServico.create com o include padrão', async () => {
    vi.mocked(prismaClient.ordemdeServico.create).mockResolvedValue({ id: 'os-1' } as any)
    const repository = new OrdemdeServicoRepository()

    await repository.create({ name: 'Teste' } as any)

    expect(prismaClient.ordemdeServico.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: 'Teste' },
        include: expect.objectContaining({ cliente: true, tecnico: true }),
      })
    )
  })

  it('update delega pro prismaClient.ordemdeServico.update com where e include corretos', async () => {
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue({ id: 'os-1' } as any)
    const repository = new OrdemdeServicoRepository()

    await repository.update('os-1', { diagnostico: 'Teste' } as any)

    expect(prismaClient.ordemdeServico.update).toHaveBeenCalledWith({
      where: { id: 'os-1' },
      data: { diagnostico: 'Teste' },
      include: { atividades: true, statusOrdemdeServico: true },
    })
  })
})
