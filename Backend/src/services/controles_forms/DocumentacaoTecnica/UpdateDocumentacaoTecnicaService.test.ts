import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateDocumentacaoTecnicaService } from './UpdateDocumentacaoTecnicaService'
import { DocumentacaoTecnicaRepository } from '../../../repositories/DocumentacaoTecnicaRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as DocumentacaoTecnicaRepository
}

describe('UpdateDocumentacaoTecnicaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('atualiza só os campos informados', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new UpdateDocumentacaoTecnicaService(repository)
    await service.execute('reg-1', { titulo: 'Novo título' })

    expect(repository.update).toHaveBeenCalledWith(
      'reg-1',
      expect.objectContaining({ titulo: 'Novo título', tecnico: undefined })
    )
  })

  it('devolve mensagem de sucesso junto com o registro atualizado', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new UpdateDocumentacaoTecnicaService(repository)
    const resultado = await service.execute('reg-1', {})

    expect(resultado.message).toBe('Controle de Documentação Técnica Atualizado com sucesso.')
  })
})
