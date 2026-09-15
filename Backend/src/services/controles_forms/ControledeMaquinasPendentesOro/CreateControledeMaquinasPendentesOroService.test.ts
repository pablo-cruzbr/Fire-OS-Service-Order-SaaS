import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateControledeMaquinasPendentesOroService } from './CreateControledeMaquinasPendentesOroService'
import { MaquinasPendentesOroRepository } from '../../../repositories/MaquinasPendentesOroRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as MaquinasPendentesOroRepository
}

const payload = {
  datadaInstalacao: new Date('2026-09-01'),
  osInstalacao: 'OS-INST-001',
  osRetirada: 'OS-RET-001',
  equipamento_id: 'equip-1',
  instituicaoUnidade_id: 'instituicao-1',
  statusMaquinasPendentesOro_id: 'status-1',
}

describe('CreateControledeMaquinasPendentesOroService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cria o registro conectando os 3 relacionamentos (todos obrigatórios nesse módulo)', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new CreateControledeMaquinasPendentesOroService(repository)
    await service.execute(payload)

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        equipamento: { connect: { id: 'equip-1' } },
        instituicaoUnidade: { connect: { id: 'instituicao-1' } },
        statusMaquinasPendentesOro: { connect: { id: 'status-1' } },
      })
    )
  })
})
