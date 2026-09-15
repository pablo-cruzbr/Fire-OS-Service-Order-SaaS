import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeleteControledeAssistenciaTecnicaService } from './DeleteControledeAssistenciaTecnicaService'
import { AssistenciaTecnicaRepository } from '../../../repositories/AssistenciaTecnicaRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as AssistenciaTecnicaRepository
}

describe('DeleteControledeAssistenciaTecnicaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deleta pelo id e devolve mensagem de sucesso', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.delete).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new DeleteControledeAssistenciaTecnicaService(repository)
    const resultado = await service.execute('reg-1')

    expect(repository.delete).toHaveBeenCalledWith('reg-1')
    expect(resultado.message).toBe('Controle de assistência técnica deletado com sucesso.')
  })
})
