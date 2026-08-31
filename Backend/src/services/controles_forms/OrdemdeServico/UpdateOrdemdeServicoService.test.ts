import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../prisma', () => ({
  default: {
    ordemdeServico: {
      update: vi.fn(),
    },
  },
}))

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn(() => Promise.resolve({ secure_url: 'https://cloudinary.com/assinatura.jpg' })),
    },
  },
}))

import prismaClient from '../../../prisma'
import { UpdateOrdemdeServicoService, UpdateOrdemdeServicoController } from './UpdateOrdemdeServicoService'

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
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService()
    await service.execute('os-uuid-123', {
      nameTecnico: 'Carlos Silva',
      diagnostico: 'Placa mãe queimada',
      solucao: 'Substituição da placa',
    })

    expect(prismaClient.ordemdeServico.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'os-uuid-123' },
        data: expect.objectContaining({
          nameTecnico: 'Carlos Silva',
          diagnostico: 'Placa mãe queimada',
          solucao: 'Substituição da placa',
        }),
      })
    )
  })

  it('deve conectar técnico quando tecnico_id é informado', async () => {
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService()
    await service.execute('os-uuid-123', { tecnico_id: 'tecnico-uuid-456' })

    expect(prismaClient.ordemdeServico.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tecnico: { connect: { id: 'tecnico-uuid-456' } },
        }),
      })
    )
  })

  it('deve conectar status quando statusOrdemdeServico_id é informado', async () => {
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService()
    await service.execute('os-uuid-123', { statusOrdemdeServico_id: 'status-uuid-789' })

    expect(prismaClient.ordemdeServico.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusOrdemdeServico: { connect: { id: 'status-uuid-789' } },
        }),
      })
    )
  })

  it('deve converter startedAt e endedAt para Date', async () => {
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService()
    await service.execute('os-uuid-123', {
      startedAt: '2026-05-30T08:00:00.000Z',
      endedAt: '2026-05-30T10:30:00.000Z',
      duracao: 150,
    })

    const chamada = vi.mocked(prismaClient.ordemdeServico.update).mock.calls[0][0]
    expect(chamada.data.startedAt).toBeInstanceOf(Date)
    expect(chamada.data.endedAt).toBeInstanceOf(Date)
    expect(chamada.data.duracao).toBe(150)
  })

  it('deve fazer upload da assinatura base64 para o Cloudinary', async () => {
    const { v2: cloudinary } = await import('cloudinary')
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService()
    await service.execute('os-uuid-123', { assinatura: 'data:image/png;base64,iVBORw0KGgoAAAANS=' })

    expect(cloudinary.uploader.upload).toHaveBeenCalled()
    expect(prismaClient.ordemdeServico.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bannerassinatura: 'https://cloudinary.com/assinatura.jpg',
        }),
      })
    )
  })

  it('deve criar atividades quando atividades_ids é um JSON válido', async () => {
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService()
    await service.execute('os-uuid-123', {
      atividades_ids: JSON.stringify(['ativ-uuid-1', 'ativ-uuid-2']),
    })

    expect(prismaClient.ordemdeServico.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          atividades: {
            create: [
              { atividadePadrao: { connect: { id: 'ativ-uuid-1' } } },
              { atividadePadrao: { connect: { id: 'ativ-uuid-2' } } },
            ],
          },
        }),
      })
    )
  })

  it('lança ValidationError quando atividades_ids não é um JSON válido', async () => {
    const service = new UpdateOrdemdeServicoService()

    await expect(
      service.execute('os-uuid-123', { atividades_ids: '{invalido' })
    ).rejects.toThrow('atividades_ids precisa ser um JSON válido.')
    expect(prismaClient.ordemdeServico.update).not.toHaveBeenCalled()
  })

  it('não deve chamar o banco com campos extras quando nenhum campo é enviado', async () => {
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const service = new UpdateOrdemdeServicoService()
    await service.execute('os-uuid-123', {})

    expect(prismaClient.ordemdeServico.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: {} })
    )
  })

  it('propaga o erro do banco sem tratar (fica pro errorHandler global)', async () => {
    const erroDoBanco = new Error('Registro não encontrado no banco')
    vi.mocked(prismaClient.ordemdeServico.update).mockRejectedValue(erroDoBanco)

    const service = new UpdateOrdemdeServicoService()

    await expect(service.execute('os-uuid-123', { diagnostico: 'Teste' })).rejects.toThrow(erroDoBanco)
  })
})

describe('UpdateOrdemdeServicoController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devolve a ordem atualizada envolta na mensagem de sucesso', async () => {
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const controller = new UpdateOrdemdeServicoController()
    const res = makeRes()

    await controller.handle(makeReq({ body: { diagnostico: 'Placa queimada' } }), res)

    expect(res.json).toHaveBeenCalledWith({
      message: 'Ordem de Serviço updated com sucesso.',
      ordem: ordemAtualizadaFalsa,
    })
  })
})
