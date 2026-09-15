import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RemoveEquipamentoService } from './RemoveEquipamentoService'
import { EquipamentoRepository } from '../../../repositories/EquipamentoRepository'

function makeFakeRepository() {
  return {
    findByPatrimonio: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as EquipamentoRepository
}

describe('RemoveEquipamentoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deleta pelo id', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.delete).mockResolvedValue({ id: 'eq-1' } as any)

    const service = new RemoveEquipamentoService(repository)
    await service.execute('eq-1')

    expect(repository.delete).toHaveBeenCalledWith('eq-1')
  })
})
