import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'

vi.mock('../prisma', () => ({
  default: {
    ordemdeServico: {
      findUnique: vi.fn(),
    },
  },
}))

import prismaclient from '../prisma'
import { authorizeOrdemdeServico } from './authorizeOrdemdeServico'

function fakeRes() {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  return res as Response
}

describe('authorizeOrdemdeServico middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 404 quando a ordem de serviço não existe', async () => {
    vi.mocked(prismaclient.ordemdeServico.findUnique).mockResolvedValue(null)
    const req = { params: { id: 'inexistente' }, user_role: 'ADMIN' } as unknown as Request
    const res = fakeRes()
    const next = vi.fn()

    await authorizeOrdemdeServico('update')(req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(next).not.toHaveBeenCalled()
  })

  it('bloqueia com 403 quando um TECNICO tenta editar a OS de outro técnico', async () => {
    vi.mocked(prismaclient.ordemdeServico.findUnique).mockResolvedValue({
      id: 'os-1',
      tecnico_id: 'tecnico-999',
    } as any)

    const req = {
      params: { id: 'os-1' },
      user_role: 'TECNICO',
      user_tecnico_id: 'tecnico-1',
    } as unknown as Request
    const res = fakeRes()
    const next = vi.fn()

    await authorizeOrdemdeServico('update')(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('deixa passar quando o TECNICO edita a própria OS', async () => {
    vi.mocked(prismaclient.ordemdeServico.findUnique).mockResolvedValue({
      id: 'os-1',
      tecnico_id: 'tecnico-1',
    } as any)

    const req = {
      params: { id: 'os-1' },
      user_role: 'TECNICO',
      user_tecnico_id: 'tecnico-1',
    } as unknown as Request
    const res = fakeRes()
    const next = vi.fn()

    await authorizeOrdemdeServico('update')(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('deixa o ADMIN editar a OS de qualquer técnico', async () => {
    vi.mocked(prismaclient.ordemdeServico.findUnique).mockResolvedValue({
      id: 'os-1',
      tecnico_id: 'tecnico-999',
    } as any)

    const req = {
      params: { id: 'os-1' },
      user_role: 'ADMIN',
    } as unknown as Request
    const res = fakeRes()
    const next = vi.fn()

    await authorizeOrdemdeServico('update')(req, res, next)

    expect(next).toHaveBeenCalledOnce()
  })
})
