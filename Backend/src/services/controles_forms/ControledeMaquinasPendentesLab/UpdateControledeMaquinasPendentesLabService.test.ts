import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateControledeMaquinasPendentesLabService } from './UpdateControledeMaquinasPendentesLabService'
import { MaquinasPendentesLabRepository } from '../../../repositories/MaquinasPendentesLabRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as MaquinasPendentesLabRepository
}

describe('UpdateControledeMaquinasPendentesLabService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('atualiza só os campos informados', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new UpdateControledeMaquinasPendentesLabService(repository)
    await service.execute('reg-1', { ssd: '512GB' })

    expect(repository.update).toHaveBeenCalledWith(
      'reg-1',
      expect.objectContaining({ ssd: '512GB', equipamento: undefined })
    )
  })
})
