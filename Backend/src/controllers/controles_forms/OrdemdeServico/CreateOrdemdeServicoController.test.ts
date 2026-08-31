import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Prisma } from '@prisma/client'

vi.mock('../../../prisma', () => ({
  default: {
    ordemdeServico: {
      create: vi.fn(),
    },
  },
}))

import prismaClient from '../../../prisma'
import { CreateOrdemServicoController } from './CreateOrdemdeServicoController'

function makeRes() {
  const res: any = {}
  res.json = vi.fn(() => res)
  return res
}

function makeReq(body: unknown) {
  return { body } as any
}

const dadosValidos = {
  name: 'Computador sem ligar',
  descricaodoProblemaouSolicitacao: 'Máquina não liga após queda de energia',
  patrimoniodoequipamento: 'PAT-001',
  tipodeChamado_id: 'tipo-uuid-123',
  user_id: 'user-uuid-123',
}

const ordemCriadaFalsa = { id: 'os-uuid-789', numeroOS: 45231 }

function p2002NumeroOS() {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '5.0.0',
    meta: { target: ['numeroOS'] },
  })
}

describe('CreateOrdemServicoController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cria a ordem de serviço na primeira tentativa quando não há colisão', async () => {
    vi.mocked(prismaClient.ordemdeServico.create).mockResolvedValueOnce(ordemCriadaFalsa as any)

    const controller = new CreateOrdemServicoController()
    const res = makeRes()

    await controller.handle(makeReq(dadosValidos), res)

    expect(prismaClient.ordemdeServico.create).toHaveBeenCalledOnce()
    expect(res.json).toHaveBeenCalledWith(ordemCriadaFalsa)
  })

  it('gera outro numeroOS e tenta de novo quando colide com um já existente', async () => {
    vi.mocked(prismaClient.ordemdeServico.create)
      .mockRejectedValueOnce(p2002NumeroOS())
      .mockResolvedValueOnce(ordemCriadaFalsa as any)

    const controller = new CreateOrdemServicoController()
    const res = makeRes()

    await controller.handle(makeReq(dadosValidos), res)

    expect(prismaClient.ordemdeServico.create).toHaveBeenCalledTimes(2)
    expect(res.json).toHaveBeenCalledWith(ordemCriadaFalsa)
  })

  it('propaga o erro sem tentar de novo quando a falha não é colisão de numeroOS', async () => {
    const outroErro = new Error('conexão com o banco caiu')
    vi.mocked(prismaClient.ordemdeServico.create).mockRejectedValueOnce(outroErro)

    const controller = new CreateOrdemServicoController()
    const res = makeRes()

    await expect(controller.handle(makeReq(dadosValidos), res)).rejects.toThrow(outroErro)
    expect(prismaClient.ordemdeServico.create).toHaveBeenCalledOnce()
  })
})
