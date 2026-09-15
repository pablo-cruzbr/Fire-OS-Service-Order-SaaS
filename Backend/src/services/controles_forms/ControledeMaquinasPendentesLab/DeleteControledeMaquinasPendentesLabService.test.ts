import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeleteControledeMaquinasPendentesLabService } from './DeleteControledeMaquinasPendentesLabService'
import { MaquinasPendentesLabRepository } from '../../../repositories/MaquinasPendentesLabRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as MaquinasPendentesLabRepository
}

describe('DeleteControledeMaquinasPendentesLabService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deleta pelo id e devolve mensagem de sucesso (mensagem certa, não a de LaudoTecnico copiada)', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.delete).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new DeleteControledeMaquinasPendentesLabService(repository)
    const resultado = await service.execute('reg-1')

    expect(repository.delete).toHaveBeenCalledWith('reg-1')
    expect(resultado.message).toBe('Controle de Máquinas Pendentes no Laboratório deletado com sucesso.')
  })
})
