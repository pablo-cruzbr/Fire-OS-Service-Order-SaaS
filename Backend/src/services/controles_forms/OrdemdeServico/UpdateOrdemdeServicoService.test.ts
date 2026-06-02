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
import { UpdateOrdemdeServicoService } from './UpdateOrdemdeServicoService'

// Helpers para criar req/res mock
function makeRes() {
  const res: any = {}
  res.status = vi.fn(() => res)
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

  it('deve retornar 400 quando o ID da OS não é informado', async () => {
    const req = makeReq({ params: { id: undefined } })
    const res = makeRes()

    const service = new UpdateOrdemdeServicoService()
    await service.handle(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'ID da ordem é obrigatório.' })
    expect(prismaClient.ordemdeServico.update).not.toHaveBeenCalled()
  })

  it('deve atualizar campos de texto (diagnóstico, solução, técnico)', async () => {
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const req = makeReq({
      body: {
        nameTecnico: 'Carlos Silva',
        diagnostico: 'Placa mãe queimada',
        solucao: 'Substituição da placa',
      },
    })
    const res = makeRes()

    const service = new UpdateOrdemdeServicoService()
    await service.handle(req, res)

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
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Ordem de Serviço updated com sucesso.' })
    )
  })

  it('deve conectar técnico quando tecnico_id é informado', async () => {
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const req = makeReq({ body: { tecnico_id: 'tecnico-uuid-456' } })
    const res = makeRes()

    const service = new UpdateOrdemdeServicoService()
    await service.handle(req, res)

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

    const req = makeReq({ body: { statusOrdemdeServico_id: 'status-uuid-789' } })
    const res = makeRes()

    const service = new UpdateOrdemdeServicoService()
    await service.handle(req, res)

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

    const req = makeReq({
      body: {
        startedAt: '2026-05-30T08:00:00.000Z',
        endedAt: '2026-05-30T10:30:00.000Z',
        duracao: 150,
      },
    })
    const res = makeRes()

    const service = new UpdateOrdemdeServicoService()
    await service.handle(req, res)

    const chamada = vi.mocked(prismaClient.ordemdeServico.update).mock.calls[0][0]
    expect(chamada.data.startedAt).toBeInstanceOf(Date)
    expect(chamada.data.endedAt).toBeInstanceOf(Date)
    expect(chamada.data.duracao).toBe(150)
  })

  it('deve fazer upload da assinatura base64 para o Cloudinary', async () => {
    const { v2: cloudinary } = await import('cloudinary')
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const req = makeReq({
      body: { assinatura: 'data:image/png;base64,iVBORw0KGgoAAAANS=' },
    })
    const res = makeRes()

    const service = new UpdateOrdemdeServicoService()
    await service.handle(req, res)

    expect(cloudinary.uploader.upload).toHaveBeenCalled()
    expect(prismaClient.ordemdeServico.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bannerassinatura: 'https://cloudinary.com/assinatura.jpg',
        }),
      })
    )
  })

  it('deve criar atividades quando atividades_ids é informado', async () => {
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const req = makeReq({
      body: { atividades_ids: JSON.stringify(['ativ-uuid-1', 'ativ-uuid-2']) },
    })
    const res = makeRes()

    const service = new UpdateOrdemdeServicoService()
    await service.handle(req, res)

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

  it('deve retornar 400 quando o banco lança um erro', async () => {
    vi.mocked(prismaClient.ordemdeServico.update).mockRejectedValue(
      new Error('Registro não encontrado no banco')
    )

    const req = makeReq({ body: { diagnostico: 'Teste' } })
    const res = makeRes()

    const service = new UpdateOrdemdeServicoService()
    await service.handle(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Registro não encontrado no banco' })
  })

  it('não deve chamar o banco quando nenhum campo é enviado', async () => {
    vi.mocked(prismaClient.ordemdeServico.update).mockResolvedValue(ordemAtualizadaFalsa as any)

    const req = makeReq({ body: {} })
    const res = makeRes()

    const service = new UpdateOrdemdeServicoService()
    await service.handle(req, res)

    expect(prismaClient.ordemdeServico.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {},
      })
    )
  })
})
