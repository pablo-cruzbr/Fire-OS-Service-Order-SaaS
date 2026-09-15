import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateControledeLaudoTecnicoService } from './CreateControledeLaudoTécnicoService'
import { LaudoTecnicoRepository } from '../../../repositories/LaudoTecnicoRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as LaudoTecnicoRepository
}

const payload = {
  descricaodoProblema: 'Tela quebrada',
  mesAno: new Date('2026-09-01'),
  osLab: 'OS-LAB-001',
  instituicaoUnidade_id: 'instituicao-1',
  equipamento_id: 'equip-1',
  tecnico_id: 'tecnico-1',
}

describe('CreateControledeLaudoTecnicoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cria o registro conectando todos os relacionamentos (todos obrigatórios nesse módulo)', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new CreateControledeLaudoTecnicoService(repository)
    await service.execute(payload)

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        descricaodoProblema: 'Tela quebrada',
        instituicaoUnidade: { connect: { id: 'instituicao-1' } },
        equipamento: { connect: { id: 'equip-1' } },
        tecnico: { connect: { id: 'tecnico-1' } },
      })
    )
  })
})
