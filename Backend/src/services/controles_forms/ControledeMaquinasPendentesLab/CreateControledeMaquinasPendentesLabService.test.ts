import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateControledeMaquinasPendentesLabService } from './CreateControledeMaquinasPendentesLabService'
import { MaquinasPendentesLabRepository } from '../../../repositories/MaquinasPendentesLabRepository'

function makeFakeRepository() {
  return { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } as unknown as MaquinasPendentesLabRepository
}

const payload = {
  numeroDeSerie: 'SN-001',
  ssd: '256GB',
  idDaOs: 'OS-001',
  obs: '',
  equipamento_id: 'equip-1',
  statusMaquinasPendentesLab_id: 'status-1',
}

describe('CreateControledeMaquinasPendentesLabService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cria o registro conectando equipamento e status (obrigatórios)', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'reg-1' } as any)

    const service = new CreateControledeMaquinasPendentesLabService(repository)
    await service.execute(payload)

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        equipamento: { connect: { id: 'equip-1' } },
        statusMaquinasPendentesLab: { connect: { id: 'status-1' } },
      })
    )
  })
})
