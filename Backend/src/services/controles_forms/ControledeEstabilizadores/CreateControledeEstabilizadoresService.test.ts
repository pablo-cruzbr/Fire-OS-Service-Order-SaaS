import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateControledeEstabilizadoresService } from './CreateControledeEstabilizadoresService'
import { EstabilizadoresRepository } from '../../../repositories/EstabilizadoresRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() } as unknown as EstabilizadoresRepository
}

const payload = {
  idChamado: 'CH-001',
  problema: 'Não liga',
  observacoes: '',
  osdaAssistencia: 'OS-001',
  datadeChegada: '2026-09-01',
  datadeRetirada: '2026-09-05',
  estabilizadores_id: 'estab-1',
  statusEstabilizadores_id: 'status-1',
}

describe('CreateControledeEstabilizadoresService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cria o registro conectando os relacionamentos obrigatórios e normalizando as datas pra ISO', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new CreateControledeEstabilizadoresService(repository)
    await service.execute(payload)

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        estabilizadores: { connect: { id: 'estab-1' } },
        statusEstabilizadores: { connect: { id: 'status-1' } },
      })
    )
    const dataEnviada = vi.mocked(repository.create).mock.calls[0][0] as any
    expect(dataEnviada.datadeChegada).toBe(new Date('2026-09-01').toISOString())
  })

  it('não conecta instituicaoUnidade quando não informada', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new CreateControledeEstabilizadoresService(repository)
    await service.execute(payload)

    const dataEnviada = vi.mocked(repository.create).mock.calls[0][0] as any
    expect(dataEnviada.instituicaoUnidade).toBeUndefined()
  })
})
