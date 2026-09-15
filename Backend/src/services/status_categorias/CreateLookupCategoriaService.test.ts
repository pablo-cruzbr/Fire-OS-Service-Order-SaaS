import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateLookupCategoriaService } from './CreateLookupCategoriaService'
import { LookupCategoriaRepository } from '../../repositories/LookupCategoriaRepository'

function makeFakeRepository() {
  return { create: vi.fn(), delete: vi.fn() } as unknown as LookupCategoriaRepository
}

describe('CreateLookupCategoriaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('repassa o name pro repository e devolve o resultado', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'cat-1', name: 'Aberta' } as any)

    const service = new CreateLookupCategoriaService(repository)
    const resultado = await service.execute({ name: 'Aberta' })

    expect(repository.create).toHaveBeenCalledWith('Aberta')
    expect(resultado).toEqual({ id: 'cat-1', name: 'Aberta' })
  })
})
