import { describe, it, expect, vi } from 'vitest'
import { Request, Response } from 'express'
import { authorizeOwnership } from './authorizeOwnership'

function fakeRes() {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  return res as Response
}

// Testa o middleware genérico isolado, sem Prisma nenhum — quem chama passa
// o "como buscar o registro" (findRecord), então o teste só precisa de um
// fake simples, igual o repository fake usado no resto do projeto.
describe('authorizeOwnership middleware (genérico)', () => {
  it('retorna 404 quando o registro não existe', async () => {
    const findRecord = vi.fn().mockResolvedValue(null)
    const middleware = authorizeOwnership('ControleDeAssistenciaTecnica', 'update', findRecord, 'Registro não encontrado.')

    const req = { params: { id: 'inexistente' }, user_role: 'ADMIN' } as unknown as Request
    const res = fakeRes()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Registro não encontrado.' })
    expect(next).not.toHaveBeenCalled()
  })

  it('bloqueia com 403 quando um TECNICO tenta editar registro de outro técnico', async () => {
    const findRecord = vi.fn().mockResolvedValue({ id: 'reg-1', tecnico_id: 'tecnico-999' })
    const middleware = authorizeOwnership('ControleDeLaudoTecnico', 'update', findRecord, 'Não encontrado.')

    const req = {
      params: { id: 'reg-1' },
      user_role: 'TECNICO',
      user_tecnico_id: 'tecnico-1',
    } as unknown as Request
    const res = fakeRes()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('deixa passar quando o TECNICO edita o próprio registro', async () => {
    const findRecord = vi.fn().mockResolvedValue({ id: 'reg-1', tecnico_id: 'tecnico-1' })
    const middleware = authorizeOwnership('DocumentacaoTecnica', 'update', findRecord, 'Não encontrado.')

    const req = {
      params: { id: 'reg-1' },
      user_role: 'TECNICO',
      user_tecnico_id: 'tecnico-1',
    } as unknown as Request
    const res = fakeRes()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('deixa o ADMIN editar o registro de qualquer técnico', async () => {
    const findRecord = vi.fn().mockResolvedValue({ id: 'reg-1', tecnico_id: 'tecnico-999' })
    const middleware = authorizeOwnership('ControleDeAssistenciaTecnica', 'update', findRecord, 'Não encontrado.')

    const req = { params: { id: 'reg-1' }, user_role: 'ADMIN' } as unknown as Request
    const res = fakeRes()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(next).toHaveBeenCalledOnce()
  })

  it('usa a mensagem de erro 403 customizada quando informada', async () => {
    const findRecord = vi.fn().mockResolvedValue({ id: 'reg-1', tecnico_id: 'tecnico-999' })
    const middleware = authorizeOwnership(
      'DocumentacaoTecnica',
      'update',
      findRecord,
      'Não encontrado.',
      'Mensagem customizada.'
    )

    const req = {
      params: { id: 'reg-1' },
      user_role: 'TECNICO',
      user_tecnico_id: 'tecnico-1',
    } as unknown as Request
    const res = fakeRes()
    const next = vi.fn()

    await middleware(req, res, next)

    expect(res.json).toHaveBeenCalledWith({ error: 'Mensagem customizada.' })
  })
})
