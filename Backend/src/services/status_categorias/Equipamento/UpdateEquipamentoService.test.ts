import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateEquipamentoService } from './UpdateEquipamentoService'
import { EquipamentoRepository } from '../../../repositories/EquipamentoRepository'

function makeFakeRepository() {
  return {
    findByPatrimonio: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as EquipamentoRepository
}

describe('UpdateEquipamentoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('atualiza sem checar patrimonio quando ele não foi alterado no payload', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'eq-1' } as any)

    const service = new UpdateEquipamentoService(repository)
    await service.execute('eq-1', { name: 'Notebook novo' })

    expect(repository.findByPatrimonio).not.toHaveBeenCalled()
    expect(repository.update).toHaveBeenCalledWith('eq-1', expect.objectContaining({ name: 'Notebook novo' }))
  })

  it('permite manter o mesmo patrimonio do próprio equipamento (não é conflito consigo mesmo)', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.findByPatrimonio).mockResolvedValue({ id: 'eq-1', patrimonio: 'PAT-001' } as any)
    vi.mocked(repository.update).mockResolvedValue({ id: 'eq-1' } as any)

    const service = new UpdateEquipamentoService(repository)
    await service.execute('eq-1', { patrimonio: 'PAT-001' })

    expect(repository.update).toHaveBeenCalledOnce()
  })

  it('lança ConflictError quando o novo patrimonio já pertence a outro equipamento', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.findByPatrimonio).mockResolvedValue({ id: 'eq-outro', patrimonio: 'PAT-002' } as any)

    const service = new UpdateEquipamentoService(repository)

    await expect(service.execute('eq-1', { patrimonio: 'PAT-002' })).rejects.toThrow(
      'Este número de patrimônio já está em uso por outro equipamento!'
    )
    expect(repository.update).not.toHaveBeenCalled()
  })
})
