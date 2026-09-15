import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateSolicitacaodeComprasService } from './UpdateSolicitacaodeComprasService'
import { SolicitacaoComprasRepository } from '../../../repositories/SolicitacaoComprasRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as SolicitacaoComprasRepository
}

describe('UpdateSolicitacaodeComprasService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('atualiza só os campos informados', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new UpdateSolicitacaodeComprasService(repository)
    await service.execute('reg-1', { preco: 120 })

    expect(repository.update).toHaveBeenCalledWith(
      'reg-1',
      expect.objectContaining({ preco: 120, statusCompras: undefined })
    )
  })
})
