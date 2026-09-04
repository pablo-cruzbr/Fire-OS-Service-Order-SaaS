import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Prisma } from '@prisma/client'
import { CreateOrdemServicoController, CreateOrdemServicoService } from './CreateOrdemdeServicoController'
import { OrdemdeServicoRepository } from '../../../repositories/OrdemdeServicoRepository'

// Sem mockar o módulo do Prisma: o Service recebe um repository fake,
// então o teste não sabe (nem precisa saber) que existe um banco por trás.
function makeFakeRepository() {
  return {
    create: vi.fn(),
    update: vi.fn(),
  } as unknown as OrdemdeServicoRepository
}

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
    const repository = makeFakeRepository()
    vi.mocked(repository.create).mockResolvedValueOnce(ordemCriadaFalsa as any)

    const controller = new CreateOrdemServicoController(new CreateOrdemServicoService(repository))
    const res = makeRes()

    await controller.handle(makeReq(dadosValidos), res)

    expect(repository.create).toHaveBeenCalledOnce()
    expect(res.json).toHaveBeenCalledWith(ordemCriadaFalsa)
  })

  it('gera outro numeroOS e tenta de novo quando colide com um já existente', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.create)
      .mockRejectedValueOnce(p2002NumeroOS())
      .mockResolvedValueOnce(ordemCriadaFalsa as any)

    const controller = new CreateOrdemServicoController(new CreateOrdemServicoService(repository))
    const res = makeRes()

    await controller.handle(makeReq(dadosValidos), res)

    expect(repository.create).toHaveBeenCalledTimes(2)
    expect(res.json).toHaveBeenCalledWith(ordemCriadaFalsa)
  })

  it('propaga o erro sem tentar de novo quando a falha não é colisão de numeroOS', async () => {
    const repository = makeFakeRepository()
    const outroErro = new Error('conexão com o banco caiu')
    vi.mocked(repository.create).mockRejectedValueOnce(outroErro)

    const controller = new CreateOrdemServicoController(new CreateOrdemServicoService(repository))
    const res = makeRes()

    await expect(controller.handle(makeReq(dadosValidos), res)).rejects.toThrow(outroErro)
    expect(repository.create).toHaveBeenCalledOnce()
  })
})
