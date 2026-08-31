import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../prisma', () => ({
  default: {
    user: {
      findFirst: vi.fn(),
    },
    ordemdeServico: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('../../../redis', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

import prismaClient from '../../../prisma'
import redisClient from '../../../redis'
import { ListOrdemdeServicoService } from './ListOrdemdeServicoService'

const usuarioAdmin = { role: 'ADMIN', tecnico_id: null }

describe('ListOrdemdeServicoService — cache dos totais', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prismaClient.user.findFirst).mockResolvedValue(usuarioAdmin as any)
    vi.mocked(prismaClient.ordemdeServico.findMany).mockResolvedValue([])
    vi.mocked(prismaClient.ordemdeServico.count).mockResolvedValue(0)
  })

  it('quando não há cache (miss), calcula os 8 counts no banco e salva no Redis', async () => {
    vi.mocked(redisClient.get).mockResolvedValue(null)

    const service = new ListOrdemdeServicoService()
    await service.execute({ user_id: 'user-1' })

    expect(prismaClient.ordemdeServico.count).toHaveBeenCalledTimes(8)
    expect(redisClient.set).toHaveBeenCalledWith(
      expect.stringContaining('os:totais:'),
      expect.any(String),
      'EX',
      30
    )
  })

  it('quando há cache (hit), não bate no banco pra contar de novo', async () => {
    const totaisEmCache = {
      total: 42,
      totalAberta: 10,
      totalEmDeslocamento: 5,
      totalEmAndamento: 7,
      totalConcluida: 15,
      totalPausada: 5,
      totalTicket: 20,
      totalOrdemdeServico: 22,
    }
    vi.mocked(redisClient.get).mockResolvedValue(JSON.stringify(totaisEmCache))

    const service = new ListOrdemdeServicoService()
    const resultado = await service.execute({ user_id: 'user-1' })

    expect(prismaClient.ordemdeServico.count).not.toHaveBeenCalled()
    expect(resultado.total).toBe(42)
    expect(resultado.totalAberta).toBe(10)
  })

  it('segue funcionando (fallback) mesmo se o Redis estiver fora do ar', async () => {
    vi.mocked(redisClient.get).mockRejectedValue(new Error('ECONNREFUSED'))
    vi.mocked(redisClient.set).mockRejectedValue(new Error('ECONNREFUSED'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const service = new ListOrdemdeServicoService()
    const resultado = await service.execute({ user_id: 'user-1' })

    expect(prismaClient.ordemdeServico.count).toHaveBeenCalledTimes(8)
    expect(resultado.total).toBe(0)
  })
})
