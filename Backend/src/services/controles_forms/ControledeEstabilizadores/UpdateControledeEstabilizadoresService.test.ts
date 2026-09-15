import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateControledeEstabilizadoresService } from './UpdateControledeEstabilizadoresService'
import { EstabilizadoresRepository } from '../../../repositories/EstabilizadoresRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() } as unknown as EstabilizadoresRepository
}

describe('UpdateControledeEstabilizadoresService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('atualiza só os campos informados', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new UpdateControledeEstabilizadoresService(repository)
    await service.execute('reg-1', { problema: 'Novo problema' })

    expect(repository.update).toHaveBeenCalledWith(
      'reg-1',
      expect.objectContaining({ problema: 'Novo problema', estabilizadores: undefined })
    )
  })

  it('normaliza a data pra ISO só quando informada', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new UpdateControledeEstabilizadoresService(repository)
    await service.execute('reg-1', { datadeChegada: '2026-09-10' })

    const dataEnviada = vi.mocked(repository.update).mock.calls[0][1] as any
    expect(dataEnviada.datadeChegada).toBe(new Date('2026-09-10').toISOString())
    expect(dataEnviada.datadeRetirada).toBeUndefined()
  })
})
