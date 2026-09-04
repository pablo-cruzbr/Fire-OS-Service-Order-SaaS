import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../prisma', () => ({
  default: {
    tecnico: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('../../../redis', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}))

import prismaClient from '../../../prisma'
import redisClient from '../../../redis'
import { ListTecnicoService } from './ListTecnicoService'
import { CreateTecnicoService } from './CreateTecnicoService'
import { RemoveTecnicoService } from './RemoveTecnicoService'

describe('ListTecnicoService — cache da lista de técnicos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prismaClient.tecnico.findMany).mockResolvedValue([{ id: '1', name: 'João', created_at: new Date() }] as any)
    vi.mocked(prismaClient.tecnico.count).mockResolvedValue(1)
  })

  it('quando não há cache (miss), busca no banco e salva no Redis com TTL de 60s', async () => {
    vi.mocked(redisClient.get).mockResolvedValue(null)

    const service = new ListTecnicoService()
    const resultado = await service.execute()

    expect(prismaClient.tecnico.findMany).toHaveBeenCalledTimes(1)
    expect(prismaClient.tecnico.count).toHaveBeenCalledTimes(1)
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

    const service = new ListTecnicoService()
    const resultado = await service.execute()

    expect(prismaClient.tecnico.findMany).not.toHaveBeenCalled()
    expect(prismaClient.tecnico.count).not.toHaveBeenCalled()
    expect(resultado.total).toBe(1)
  })

  it('segue funcionando (fallback) mesmo se o Redis estiver fora do ar', async () => {
    vi.mocked(redisClient.get).mockRejectedValue(new Error('ECONNREFUSED'))
    vi.mocked(redisClient.set).mockRejectedValue(new Error('ECONNREFUSED'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const service = new ListTecnicoService()
    const resultado = await service.execute()

    expect(prismaClient.tecnico.findMany).toHaveBeenCalledTimes(1)
    expect(resultado.total).toBe(1)
  })
})

describe('CreateTecnicoService / RemoveTecnicoService — invalidação do cache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invalida o cache da lista ao criar um técnico', async () => {
    vi.mocked(prismaClient.tecnico.create).mockResolvedValue({ id: '1', name: 'Novo' } as any)

    const service = new CreateTecnicoService()
    await service.execute('Novo')

    expect(redisClient.del).toHaveBeenCalledWith('tecnicos:list')
  })

  it('invalida o cache da lista ao remover um técnico', async () => {
    vi.mocked(prismaClient.tecnico.delete).mockResolvedValue({ id: '1', name: 'Removido' } as any)

    const service = new RemoveTecnicoService()
    await service.execute({ tecnico_id: '1' })

    expect(redisClient.del).toHaveBeenCalledWith('tecnicos:list')
  })

  it('criar técnico segue funcionando mesmo se o Redis estiver fora do ar', async () => {
    vi.mocked(prismaClient.tecnico.create).mockResolvedValue({ id: '1', name: 'Novo' } as any)
    vi.mocked(redisClient.del).mockRejectedValue(new Error('ECONNREFUSED'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const service = new CreateTecnicoService()
    const resultado = await service.execute('Novo')

    expect(resultado.id).toBe('1')
  })
})
