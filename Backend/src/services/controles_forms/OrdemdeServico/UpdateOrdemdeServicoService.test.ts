import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn(() => Promise.resolve({ secure_url: 'https://cloudinary.com/assinatura.jpg' })),
    },
  },
}))

import { UpdateOrdemdeServicoService, UpdateOrdemdeServicoController } from './UpdateOrdemdeServicoService'
import { OrdemdeServicoRepository } from '../../../repositories/OrdemdeServicoRepository'

// Repository fake em vez de mockar o módulo do Prisma: o Service não sabe
// que existe um banco por trás, só sabe que tem algo com um método update().
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

function makeReq(overrides: { params?: any; body?: any; files?: any } = {}) {
  return {
    params: overrides.params ?? { id: 'os-uuid-123' },
    body: overrides.body ?? {},
    files: overrides.files ?? null,
  } as any
}

const ordemAtualizadaFalsa = {
  id: 'os-uuid-123',
  numeroOS: 45231,
  nameTecnico: 'Carlos Silva',
  diagnostico: 'Placa mãe queimada',
  solucao: 'Substituição da placa',
  atividades: [],
  statusOrdemdeServico: { name: 'Concluída' },
}

describe('UpdateOrdemdeServicoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Validação de "id obrigatório" e de erro do banco viraram responsabilidade
  // do middleware `validate()` (idParamSchema) e do errorHandler global,
  // respectivamente — cobertos em validate.test.ts e errorHandler.test.ts.

  it('deve atualizar campos de texto (diagnóstico, solução, técnico)', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService(repository)
    await service.execute('os-uuid-123', {
      nameTecnico: 'Carlos Silva',
      diagnostico: 'Placa mãe queimada',
      solucao: 'Substituição da placa',
    })

    expect(repository.update).toHaveBeenCalledWith(
      'os-uuid-123',
      expect.objectContaining({
        nameTecnico: 'Carlos Silva',
        diagnostico: 'Placa mãe queimada',
        solucao: 'Substituição da placa',
      })
    )
  })

  it('deve conectar técnico quando tecnico_id é informado', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService(repository)
    await service.execute('os-uuid-123', { tecnico_id: 'tecnico-uuid-456' })

    expect(repository.update).toHaveBeenCalledWith(
      'os-uuid-123',
      expect.objectContaining({ tecnico: { connect: { id: 'tecnico-uuid-456' } } })
    )
  })

  it('deve conectar status quando statusOrdemdeServico_id é informado', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService(repository)
    await service.execute('os-uuid-123', { statusOrdemdeServico_id: 'status-uuid-789' })

    expect(repository.update).toHaveBeenCalledWith(
      'os-uuid-123',
      expect.objectContaining({ statusOrdemdeServico: { connect: { id: 'status-uuid-789' } } })
    )
  })

  it('deve converter startedAt e endedAt para Date', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService(repository)
    await service.execute('os-uuid-123', {
      startedAt: '2026-05-30T08:00:00.000Z',
      endedAt: '2026-05-30T10:30:00.000Z',
      duracao: 150,
    })

    const [, dataEnviada] = vi.mocked(repository.update).mock.calls[0]
    expect((dataEnviada as any).startedAt).toBeInstanceOf(Date)
    expect((dataEnviada as any).endedAt).toBeInstanceOf(Date)
    expect((dataEnviada as any).duracao).toBe(150)
  })

  it('deve fazer upload da assinatura base64 para o Cloudinary', async () => {
    const { v2: cloudinary } = await import('cloudinary')
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService(repository)
    await service.execute('os-uuid-123', { assinatura: 'data:image/png;base64,iVBORw0KGgoAAAANS=' })

    expect(cloudinary.uploader.upload).toHaveBeenCalled()
    expect(repository.update).toHaveBeenCalledWith(
      'os-uuid-123',
      expect.objectContaining({ bannerassinatura: 'https://cloudinary.com/assinatura.jpg' })
    )
  })

  it('deve criar atividades quando atividades_ids é um JSON válido', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService(repository)
    await service.execute('os-uuid-123', {
      atividades_ids: JSON.stringify(['ativ-uuid-1', 'ativ-uuid-2']),
    })

    expect(repository.update).toHaveBeenCalledWith(
      'os-uuid-123',
      expect.objectContaining({
        atividades: {
          create: [
            { atividadePadrao: { connect: { id: 'ativ-uuid-1' } } },
            { atividadePadrao: { connect: { id: 'ativ-uuid-2' } } },
          ],
        },
      })
    )
  })

  it('lança ValidationError quando atividades_ids não é um JSON válido', async () => {
    const repository = makeFakeRepository()
    const service = new UpdateOrdemdeServicoService(repository)

    await expect(
      service.execute('os-uuid-123', { atividades_ids: '{invalido' })
    ).rejects.toThrow('atividades_ids precisa ser um JSON válido.')
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('não deve chamar o banco com campos extras quando nenhum campo é enviado', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService(repository)
    await service.execute('os-uuid-123', {})

    expect(repository.update).toHaveBeenCalledWith('os-uuid-123', {})
  })

  it('propaga o erro do banco sem tratar (fica pro errorHandler global)', async () => {
    const repository = makeFakeRepository()
    const erroDoBanco = new Error('Registro não encontrado no banco')
    vi.mocked(repository.update).mockRejectedValue(erroDoBanco)

    const service = new UpdateOrdemdeServicoService(repository)

    await expect(service.execute('os-uuid-123', { diagnostico: 'Teste' })).rejects.toThrow(erroDoBanco)
  })
})

describe('UpdateOrdemdeServicoController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devolve a ordem atualizada envolta na mensagem de sucesso', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService(repository)
    const controller = new UpdateOrdemdeServicoController(service)
    const res = makeRes()

    await controller.handle(makeReq({ body: { diagnostico: 'Placa queimada' } }), res)

    expect(res.json).toHaveBeenCalledWith({
      message: 'Ordem de Serviço updated com sucesso.',
      ordem: ordemAtualizadaFalsa,
    })
  })
})
