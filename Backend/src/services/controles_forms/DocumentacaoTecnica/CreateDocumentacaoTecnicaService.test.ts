import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateDocumentacaoTecnicaService } from './CreateDocumentacaoTecnicaService'
import { DocumentacaoTecnicaRepository } from '../../../repositories/DocumentacaoTecnicaRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as DocumentacaoTecnicaRepository
}

const payload = {
  titulo: 'Manual do equipamento X',
  descricao: 'Descrição completa',
  tecnico_id: 'tecnico-1',
}

describe('CreateDocumentacaoTecnicaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cria o registro conectando tecnico_id (obrigatório)', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new CreateDocumentacaoTecnicaService(repository)
    await service.execute(payload)

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ titulo: 'Manual do equipamento X', tecnico: { connect: { id: 'tecnico-1' } } })
    )
  })

  it('não conecta cliente/instituicaoUnidade quando não informados', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new CreateDocumentacaoTecnicaService(repository)
    await service.execute(payload)

    const dataEnviada = vi.mocked(repository.create).mock.calls[0][0]
    expect(dataEnviada.cliente).toBeUndefined()
    expect(dataEnviada.instituicaoUnidade).toBeUndefined()
  })
})
