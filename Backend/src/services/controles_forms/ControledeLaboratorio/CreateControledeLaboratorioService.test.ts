import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateControledeLaboratorioService } from './CreateControledeLaboratorioService'
import { LaboratorioRepository } from '../../../repositories/LaboratorioRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as LaboratorioRepository
}

const payload = {
  nomedoEquipamento: 'Impressora HP',
  defeito: 'Não imprime',
  marca: 'HP',
  osDeAbertura: 'OS-001',
  osDeDevolucao: 'OS-002',
  data_de_Chegada: new Date('2026-09-01'),
  data_de_Finalizacao: new Date('2026-09-05'),
  statusControledeLaboratorio_id: 'status-1',
}

describe('CreateControledeLaboratorioService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cria o registro conectando statusControledeLaboratorio (obrigatório)', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new CreateControledeLaboratorioService(repository)
    await service.execute(payload)

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ statusControledeLaboratorio: { connect: { id: 'status-1' } } })
    )
  })

  it('não conecta cliente/equipamento/instituicaoUnidade quando não informados (os 3 são opcionais aqui)', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new CreateControledeLaboratorioService(repository)
    await service.execute(payload)

    const dataEnviada = vi.mocked(repository.create).mock.calls[0][0] as any
    expect(dataEnviada.cliente).toBeUndefined()
    expect(dataEnviada.equipamento).toBeUndefined()
    expect(dataEnviada.instituicaoUnidade).toBeUndefined()
  })
})
