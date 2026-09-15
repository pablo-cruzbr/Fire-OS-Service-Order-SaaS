import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateControledeLaudoTecnicoService } from './UpdateControledeLaudoTecnicoService'
import { LaudoTecnicoRepository } from '../../../repositories/LaudoTecnicoRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as LaudoTecnicoRepository
}

describe('UpdateControledeLaudoTecnicoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('atualiza só os campos informados', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new UpdateControledeLaudoTecnicoService(repository)
    await service.execute('reg-1', { osLab: 'OS-LAB-002' })

    expect(repository.update).toHaveBeenCalledWith(
      'reg-1',
      expect.objectContaining({ osLab: 'OS-LAB-002', tecnico: undefined })
    )
  })

  it('devolve mensagem de sucesso junto com o registro atualizado', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new UpdateControledeLaudoTecnicoService(repository)
    const resultado = await service.execute('reg-1', {})

    expect(resultado.message).toBe('Controle de Laudo Técnico atualizado com sucesso.')
  })
})
