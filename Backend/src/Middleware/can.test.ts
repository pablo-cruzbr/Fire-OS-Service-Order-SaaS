import { describe, it, expect, vi } from 'vitest'
import { Request, Response } from 'express'
import { can } from './can'

function fakeRes() {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  return res as Response
}

describe('can middleware', () => {
  it('chama next() quando a role do usuário está na lista permitida', () => {
    const req = { user_role: 'ADMIN' } as Request
    const res = fakeRes()
    const next = vi.fn()

    can(['ADMIN'])(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('retorna 401 quando não há role identificada (sem login)', () => {
    const req = { user_role: undefined } as unknown as Request
    const res = fakeRes()
    const next = vi.fn()

    can(['ADMIN'])(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 403 quando a role está logada mas não é uma das permitidas', () => {
    const req = { user_role: 'TECNICO' } as Request
    const res = fakeRes()
    const next = vi.fn()

    can(['ADMIN'])(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('é case-insensitive na comparação de role', () => {
    const req = { user_role: 'admin' } as Request
    const res = fakeRes()
    const next = vi.fn()

    can(['ADMIN'])(req, res, next)

    expect(next).toHaveBeenCalledOnce()
  })
})
