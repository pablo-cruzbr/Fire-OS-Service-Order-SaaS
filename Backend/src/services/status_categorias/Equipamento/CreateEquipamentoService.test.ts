import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateEquipamentoService } from './CreateEquipamentoService'
import { EquipamentoRepository } from '../../../repositories/EquipamentoRepository'

function makeFakeRepository() {
  return {
    findByPatrimonio: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as EquipamentoRepository
}

describe('CreateEquipamentoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cria equipamento quando o patrimonio não existe ainda', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.findByPatrimonio).mockResolvedValue(null)
    vi.mocked(repository.create).mockResolvedValue({ id: 'eq-1' } as any)

    const service = new CreateEquipamentoService(repository)
    await service.execute({ name: 'Notebook Dell', patrimonio: 'PAT-001' })

    expect(repository.create).toHaveBeenCalledOnce()
  })

  it('lança ConflictError quando o patrimonio já existe', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.findByPatrimonio).mockResolvedValue({ id: 'eq-existente' } as any)

    const service = new CreateEquipamentoService(repository)

    await expect(
      service.execute({ name: 'Notebook Dell', patrimonio: 'PAT-001' })
    ).rejects.toThrow('Esse patrimônio já existe!')
    expect(repository.create).not.toHaveBeenCalled()
  })
})
