import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeleteControledeMaquinasPendentesOroService } from './DeleteControledeMaquinasPendentesOroService'
import { MaquinasPendentesOroRepository } from '../../../repositories/MaquinasPendentesOroRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as MaquinasPendentesOroRepository
}

describe('DeleteControledeMaquinasPendentesOroService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deleta pelo id e devolve mensagem de sucesso', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.delete).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new DeleteControledeMaquinasPendentesOroService(repository)
    const resultado = await service.execute('reg-1')

    expect(repository.delete).toHaveBeenCalledWith('reg-1')
    expect(resultado.message).toBe('Controle de Máquina Pendente Oro deletado com sucesso.')
  })
})
