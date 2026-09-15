import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateControledeMaquinasPendentesOroService } from './UpdateControledeMaquinasPendentesOroService'
import { MaquinasPendentesOroRepository } from '../../../repositories/MaquinasPendentesOroRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as MaquinasPendentesOroRepository
}

describe('UpdateControledeMaquinasPendentesOroService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('atualiza só os campos informados', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new UpdateControledeMaquinasPendentesOroService(repository)
    await service.execute('reg-1', { osRetirada: 'OS-2' })

    expect(repository.update).toHaveBeenCalledWith(
      'reg-1',
      expect.objectContaining({ osRetirada: 'OS-2', equipamento: undefined })
    )
  })
})
