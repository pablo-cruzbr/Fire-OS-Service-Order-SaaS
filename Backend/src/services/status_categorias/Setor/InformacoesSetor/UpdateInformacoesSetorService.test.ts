import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../../prisma', () => ({
  default: {
    cliente: { findUnique: vi.fn() },
    instituicaoUnidade: { findUnique: vi.fn() },
  },
}))

import prismaClient from '../../../../prisma'
import { UpdateInformacoesSetorService } from './UpdateInformacoesSetorService'
import { InformacoesSetorRepository } from '../../../../repositories/InformacoesSetorRepository'

function makeFakeRepository() {
  return { create: vi.fn(), update: vi.fn() } as unknown as InformacoesSetorRepository
}

describe('UpdateInformacoesSetorService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não mexe em cliente_id/instituicaoUnidade_id quando os campos não vêm no payload', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'info-1' } as any)

    const service = new UpdateInformacoesSetorService(repository)
    await service.execute('info-1', { ramal: '5678' })

    expect(repository.update).toHaveBeenCalledWith(
      'info-1',
      expect.not.objectContaining({ cliente_id: expect.anything() })
    )
    expect(prismaClient.cliente.findUnique).not.toHaveBeenCalled()
  })

  it('limpa cliente_id quando o payload manda clienteId null de propósito', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'info-1' } as any)

    const service = new UpdateInformacoesSetorService(repository)
    await service.execute('info-1', { clienteId: null })

    expect(repository.update).toHaveBeenCalledWith('info-1', expect.objectContaining({ cliente_id: null }))
    expect(prismaClient.cliente.findUnique).not.toHaveBeenCalled()
  })

  it('resolve instituicaoUnidadeId quando ele vem preenchido no payload', async () => {
    const repository = makeFakeRepository()
    vi.mocked(prismaClient.instituicaoUnidade.findUnique).mockResolvedValue({ id: 'inst-1' } as any)
    vi.mocked(repository.update).mockResolvedValue({ id: 'info-1' } as any)

    const service = new UpdateInformacoesSetorService(repository)
    await service.execute('info-1', { instituicaoUnidadeId: 'inst-1' })

    expect(repository.update).toHaveBeenCalledWith(
      'info-1',
      expect.objectContaining({ instituicaoUnidade_id: 'inst-1' })
    )
  })
})
