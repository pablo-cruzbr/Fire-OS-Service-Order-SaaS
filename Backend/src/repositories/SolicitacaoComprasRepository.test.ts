import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    solicitacaoDeCompras: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import prismaClient from '../prisma'
import { SolicitacaoComprasRepository } from './SolicitacaoComprasRepository'

describe('SolicitacaoComprasRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create delega pro prismaClient.solicitacaoDeCompras.create', async () => {
    vi.mocked(prismaClient.solicitacaoDeCompras.create).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new SolicitacaoComprasRepository()

    await repository.create({ itemSolicitado: 'Mouse' } as any)

    expect(prismaClient.solicitacaoDeCompras.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { itemSolicitado: 'Mouse' } })
    )
  })

  it('update delega pro prismaClient.solicitacaoDeCompras.update com where correto', async () => {
    vi.mocked(prismaClient.solicitacaoDeCompras.update).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new SolicitacaoComprasRepository()

    await repository.update('reg-1', { preco: 100 } as any)

    expect(prismaClient.solicitacaoDeCompras.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'reg-1' }, data: { preco: 100 } })
    )
  })

  it('delete delega pro prismaClient.solicitacaoDeCompras.delete', async () => {
    vi.mocked(prismaClient.solicitacaoDeCompras.delete).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new SolicitacaoComprasRepository()

    await repository.delete('reg-1')

    expect(prismaClient.solicitacaoDeCompras.delete).toHaveBeenCalledWith({ where: { id: 'reg-1' } })
  })
})
