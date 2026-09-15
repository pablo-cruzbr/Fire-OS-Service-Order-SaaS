import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeleteControledeLaudoTecnicoService } from './DeleteControledeLaudoTenicoService'
import { LaudoTecnicoRepository } from '../../../repositories/LaudoTecnicoRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as LaudoTecnicoRepository
}

describe('DeleteControledeLaudoTecnicoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deleta pelo id e devolve mensagem de sucesso', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.delete).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new DeleteControledeLaudoTecnicoService(repository)
    const resultado = await service.execute('reg-1')

    expect(repository.delete).toHaveBeenCalledWith('reg-1')
    expect(resultado.message).toBe('Controle de Laudo técnico deletado com sucesso.')
  })
})
