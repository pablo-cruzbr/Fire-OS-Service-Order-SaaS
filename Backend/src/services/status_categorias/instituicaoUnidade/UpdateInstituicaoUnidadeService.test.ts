import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateInstituicaoUnidadeService } from './UpdateInstituicaoUnidadeService'
import { InstituicaoUnidadeRepository } from '../../../repositories/InstituicaoUnidadeRepository'

function makeFakeRepository() {
  return { update: vi.fn() } as unknown as InstituicaoUnidadeRepository
}

describe('UpdateInstituicaoUnidadeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('atualiza conectando o tipo pelo id informado', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'inst-1' } as any)

    const service = new UpdateInstituicaoUnidadeService(repository)
    await service.execute('inst-1', {
      name: 'Secretaria Municipal',
      endereco: 'Rua 1, 100',
      tipodeInstituicaoUnidade_id: 'tipo-1',
    })

    expect(repository.update).toHaveBeenCalledWith(
      'inst-1',
      expect.objectContaining({
        name: 'Secretaria Municipal',
        endereco: 'Rua 1, 100',
        tipodeinstituicaoUnidade: { connect: { id: 'tipo-1' } },
      })
    )
  })
})
