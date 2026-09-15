import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateAssistenciaTecnicaService } from './UpdateAssistenciaTecnicaService'
import { AssistenciaTecnicaRepository } from '../../../repositories/AssistenciaTecnicaRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as AssistenciaTecnicaRepository
}

describe('UpdateAssistenciaTecnicaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('atualiza só os campos informados, sem tentar reconectar relações ausentes', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new UpdateAssistenciaTecnicaService(repository)
    await service.execute('reg-1', { observacoes: 'Peça trocada' })

    expect(repository.update).toHaveBeenCalledWith(
      'reg-1',
      expect.objectContaining({ observacoes: 'Peça trocada', tecnico: undefined, cliente: undefined })
    )
  })

  it('conecta tecnico_id quando informado', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new UpdateAssistenciaTecnicaService(repository)
    await service.execute('reg-1', { tecnico_id: 'tecnico-2' })

    expect(repository.update).toHaveBeenCalledWith(
      'reg-1',
      expect.objectContaining({ tecnico: { connect: { id: 'tecnico-2' } } })
    )
  })

  it('devolve a mensagem de sucesso junto com o registro atualizado', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1', name: 'Atualizado' } as any)

    const service = new UpdateAssistenciaTecnicaService(repository)
    const resultado = await service.execute('reg-1', {})

    expect(resultado.message).toBe('Controle de Assistencia Técnica Atualizado com sucesso.')
    expect(resultado.controle).toEqual({ id: 'reg-1', name: 'Atualizado' })
  })
})
