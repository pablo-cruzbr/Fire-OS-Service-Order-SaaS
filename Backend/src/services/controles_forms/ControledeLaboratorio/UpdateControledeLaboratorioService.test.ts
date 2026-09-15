import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateControledeLaboratorioService } from './UpdateControledeLaboratorioService'
import { LaboratorioRepository } from '../../../repositories/LaboratorioRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as LaboratorioRepository
}

describe('UpdateControledeLaboratorioService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('atualiza só os campos informados', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new UpdateControledeLaboratorioService(repository)
    await service.execute('reg-1', { defeito: 'Novo defeito' })

    expect(repository.update).toHaveBeenCalledWith(
      'reg-1',
      expect.objectContaining({ defeito: 'Novo defeito', equipamento: undefined })
    )
  })

  it('devolve mensagem de sucesso junto com o registro atualizado', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new UpdateControledeLaboratorioService(repository)
    const resultado = await service.execute('reg-1', {})

    expect(resultado.message).toBe('Controle de Laboratório atualizado com sucesso.')
  })
})
