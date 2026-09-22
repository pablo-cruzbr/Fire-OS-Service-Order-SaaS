import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TecnicoRepository } from '../../../repositories/TecnicoRepository'
import { ListTecnicoService } from './ListTecnicoService'
import { CreateTecnicoService } from './CreateTecnicoService'
import { RemoveTecnicoService } from './RemoveTecnicoService'

vi.mock('../../../redis', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}))

import redisClient from '../../../redis'

function makeFakeRepository(overrides: Partial<TecnicoRepository> = {}): TecnicoRepository {
  return {
    findAll: vi.fn().mockResolvedValue([{ id: '1', name: 'João', created_at: new Date() }]),
    count: vi.fn().mockResolvedValue(1),
    create: vi.fn().mockResolvedValue({ id: '1', name: 'Novo' }),
    delete: vi.fn().mockResolvedValue({ id: '1', name: 'Removido' }),
    ...overrides,
  } as unknown as TecnicoRepository
}

describe('ListTecnicoService — cache da lista de técnicos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('quando não há cache (miss), busca no banco e salva no Redis com TTL de 60s', async () => {
    vi.mocked(redisClient.get).mockResolvedValue(null)
    const repository = makeFakeRepository()

    const service = new ListTecnicoService(repository)
    const resultado = await service.execute()

    expect(repository.findAll).toHaveBeenCalledTimes(1)
    expect(repository.count).toHaveBeenCalledTimes(1)
    expect(redisClient.set).toHaveBeenCalledWith(
      'tecnicos:list',
      expect.any(String),
      'EX',
      60
    )
    expect(resultado.total).toBe(1)
  })

  it('quando há cache (hit), não bate no banco de novo', async () => {
    const emCache = { controles: [{ id: '1', name: 'João' }], total: 1 }
    vi.mocked(redisClient.get).mockResolvedValue(JSON.stringify(emCache))
    const repository = makeFakeRepository()

    const service = new ListTecnicoService(repository)
    const resultado = await service.execute()

    expect(repository.findAll).not.toHaveBeenCalled()
    expect(repository.count).not.toHaveBeenCalled()
    expect(resultado.total).toBe(1)
  })

  it('segue funcionando (fallback) mesmo se o Redis estiver fora do ar', async () => {
    vi.mocked(redisClient.get).mockRejectedValue(new Error('ECONNREFUSED'))
    vi.mocked(redisClient.set).mockRejectedValue(new Error('ECONNREFUSED'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const repository = makeFakeRepository()

    const service = new ListTecnicoService(repository)
    const resultado = await service.execute()

    expect(repository.findAll).toHaveBeenCalledTimes(1)
    expect(resultado.total).toBe(1)
  })
})

describe('CreateTecnicoService / RemoveTecnicoService — invalidação do cache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invalida o cache da lista ao criar um técnico', async () => {
    const repository = makeFakeRepository()
    const service = new CreateTecnicoService(repository)

    await service.execute({ name: 'Novo' })

    expect(redisClient.del).toHaveBeenCalledWith('tecnicos:list')
  })

  it('invalida o cache da lista ao remover um técnico', async () => {
    const repository = makeFakeRepository()
    const service = new RemoveTecnicoService(repository)

    await service.execute('1')

    expect(redisClient.del).toHaveBeenCalledWith('tecnicos:list')
  })

  it('criar técnico segue funcionando mesmo se o Redis estiver fora do ar', async () => {
    const repository = makeFakeRepository()
    vi.mocked(redisClient.del).mockRejectedValue(new Error('ECONNREFUSED'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const service = new CreateTecnicoService(repository)
    const resultado = await service.execute({ name: 'Novo' })

    expect(resultado.id).toBe('1')
  })
})
