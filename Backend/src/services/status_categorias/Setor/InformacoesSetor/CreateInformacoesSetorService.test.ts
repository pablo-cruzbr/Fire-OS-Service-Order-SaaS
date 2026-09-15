import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../../prisma', () => ({
  default: {
    cliente: { findUnique: vi.fn() },
    instituicaoUnidade: { findUnique: vi.fn() },
  },
}))

import prismaClient from '../../../../prisma'
import { CreateInformacoesSetorService } from './CreateInformacoesSetorService'
import { InformacoesSetorRepository } from '../../../../repositories/InformacoesSetorRepository'

function makeFakeRepository() {
  return { create: vi.fn(), update: vi.fn() } as unknown as InformacoesSetorRepository
}

describe('CreateInformacoesSetorService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cria sem cliente/instituição quando nenhum dos dois foi informado', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValue({ id: 'info-1' } as any)

    const service = new CreateInformacoesSetorService(repository)
    await service.execute({ setorId: 'setor-1', usuario: 'João', andar: '3', ramal: '1234' })

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ setorId: 'setor-1', cliente_id: null, instituicaoUnidade_id: null })
    )
    expect(prismaClient.cliente.findUnique).not.toHaveBeenCalled()
  })

  it('resolve clienteId/instituicaoUnidadeId quando eles existem', async () => {
    const repository = makeFakeRepository()
    vi.mocked(prismaClient.cliente.findUnique).mockResolvedValue({ id: 'cliente-1' } as any)
    vi.mocked(prismaClient.instituicaoUnidade.findUnique).mockResolvedValue({ id: 'inst-1' } as any)
    vi.mocked(repository.create).mockResolvedValue({ id: 'info-1' } as any)

    const service = new CreateInformacoesSetorService(repository)
    await service.execute({ setorId: 'setor-1', clienteId: 'cliente-1', instituicaoUnidadeId: 'inst-1' })

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ cliente_id: 'cliente-1', instituicaoUnidade_id: 'inst-1' })
    )
  })

  it('cai pra null quando clienteId informado não existe mais (não trava o cadastro)', async () => {
    const repository = makeFakeRepository()
    vi.mocked(prismaClient.cliente.findUnique).mockResolvedValue(null)
    vi.mocked(repository.create).mockResolvedValue({ id: 'info-1' } as any)

    const service = new CreateInformacoesSetorService(repository)
    await service.execute({ setorId: 'setor-1', clienteId: 'cliente-inexistente' })

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ cliente_id: null }))
  })
})
