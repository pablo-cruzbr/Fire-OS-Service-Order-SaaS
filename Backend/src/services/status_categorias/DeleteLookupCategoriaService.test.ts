import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeleteLookupCategoriaService } from './DeleteLookupCategoriaService'
import { LookupCategoriaRepository } from '../../repositories/LookupCategoriaRepository'

function makeFakeRepository() {
  return { create: vi.fn(), delete: vi.fn() } as unknown as LookupCategoriaRepository
}

describe('DeleteLookupCategoriaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deleta pelo id', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.delete).mockResolvedValue({ id: 'cat-1' } as any)

    const service = new DeleteLookupCategoriaService(repository)
    await service.execute('cat-1')

    expect(repository.delete).toHaveBeenCalledWith('cat-1')
  })
})
