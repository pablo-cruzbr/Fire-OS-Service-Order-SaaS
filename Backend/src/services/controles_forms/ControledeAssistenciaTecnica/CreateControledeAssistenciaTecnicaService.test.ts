import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateControledeAssistenciaTecnicaService } from './CreateControledeAssistenciaTecnicaService'
import { AssistenciaTecnicaRepository } from '../../../repositories/AssistenciaTecnicaRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as AssistenciaTecnicaRepository
}

const payload = {
  name: 'Notebook Dell',
  mesAno: new Date('2026-09-01'),
  idChamado: 'CH-001',
  assistencia: 'Assistência autorizada',
  observacoes: '',
  osDaAssistencia: 'OS-001',
  dataDeRetirada: new Date('2026-09-05'),
  equipamento_id: 'equip-1',
  statusReparo_id: 'status-1',
  tecnico_id: 'tecnico-1',
}

describe('CreateControledeAssistenciaTecnicaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cria o registro conectando os relacionamentos obrigatórios', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new CreateControledeAssistenciaTecnicaService(repository)
    await service.execute(payload)

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Notebook Dell',
        equipamento: { connect: { id: 'equip-1' } },
        statusReparo: { connect: { id: 'status-1' } },
        tecnico: { connect: { id: 'tecnico-1' } },
      })
    )
  })

  it('não conecta cliente/instituicaoUnidade quando não informados', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new CreateControledeAssistenciaTecnicaService(repository)
    await service.execute(payload)

    const dataEnviada = vi.mocked(repository.create).mock.calls[0][0]
    expect(dataEnviada.cliente).toBeUndefined()
    expect(dataEnviada.instituicaoUnidade).toBeUndefined()
  })

  it('conecta cliente e instituicaoUnidade quando informados', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new CreateControledeAssistenciaTecnicaService(repository)
    await service.execute({ ...payload, cliente_id: 'cliente-1', instituicaoUnidade_id: 'instituicao-1' })

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cliente: { connect: { id: 'cliente-1' } },
        instituicaoUnidade: { connect: { id: 'instituicao-1' } },
      })
    )
  })
})
