import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    tarefa: { create: vi.fn(), delete: vi.fn() },
    statusOrdemdeServico: { create: vi.fn(), delete: vi.fn() },
  },
}))

import prismaClient from '../prisma'
import { LookupCategoriaRepository } from './LookupCategoriaRepository'

describe('LookupCategoriaRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create delega pro delegate certo, escolhido pelo nome do model passado no construtor', async () => {
    vi.mocked(prismaClient.tarefa.create).mockResolvedValue({ id: 'tarefa-1' } as any)
    const repository = new LookupCategoriaRepository('tarefa')

    await repository.create('Instalação')

    expect(prismaClient.tarefa.create).toHaveBeenCalledWith({
      data: { name: 'Instalação' },
      select: { id: true, name: true },
    })
    expect(prismaClient.statusOrdemdeServico.create).not.toHaveBeenCalled()
  })

  it('cada instância aponta só pro model que recebeu, não vaza entre módulos', async () => {
    vi.mocked(prismaClient.statusOrdemdeServico.create).mockResolvedValue({ id: 'status-1' } as any)
    const repository = new LookupCategoriaRepository('statusOrdemdeServico')

    await repository.create('Aberta')

    expect(prismaClient.statusOrdemdeServico.create).toHaveBeenCalledOnce()
    expect(prismaClient.tarefa.create).not.toHaveBeenCalled()
  })

  it('delete delega pro delegate certo, filtrando por id', async () => {
    vi.mocked(prismaClient.statusOrdemdeServico.delete).mockResolvedValue({ id: 'status-1' } as any)
    const repository = new LookupCategoriaRepository('statusOrdemdeServico')

    await repository.delete('status-1')

    expect(prismaClient.statusOrdemdeServico.delete).toHaveBeenCalledWith({ where: { id: 'status-1' } })
  })
})
