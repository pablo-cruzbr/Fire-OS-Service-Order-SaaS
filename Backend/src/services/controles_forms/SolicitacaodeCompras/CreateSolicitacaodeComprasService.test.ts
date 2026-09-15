import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateSolicitacaodeComprasService } from './CreateSolicitacaodeComprasService'
import { SolicitacaoComprasRepository } from '../../../repositories/SolicitacaoComprasRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as SolicitacaoComprasRepository
}

const payload = {
  itemSolicitado: 'Mouse sem fio',
  solicitante: 'João',
  motivoDaSolicitacao: 'Mouse quebrado',
  preco: 89.9,
  linkDeCompra: 'https://loja.com/mouse',
  statusCompras_id: 'status-1',
}

describe('CreateSolicitacaodeComprasService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cria o registro conectando statusCompras (única FK do módulo, obrigatória)', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new CreateSolicitacaodeComprasService(repository)
    await service.execute(payload)

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ itemSolicitado: 'Mouse sem fio', statusCompras: { connect: { id: 'status-1' } } })
    )
  })
})
