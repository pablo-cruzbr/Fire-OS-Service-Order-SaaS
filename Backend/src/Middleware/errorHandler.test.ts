import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { errorHandler } from './errorHandler'
import { ValidationError, NotFoundError, ConflictError } from '../errors/AppError'

function makeRes() {
  const res: any = {}
  res.status = vi.fn(() => res)
  res.json = vi.fn(() => res)
  return res
}

describe('errorHandler', () => {
  let res: any
  const next = vi.fn()

  beforeEach(() => {
    res = makeRes()
    next.mockClear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('responde 422 com os campos inválidos para ZodError', () => {
    const schema = z.object({ name: z.string().min(1, 'Nome é obrigatório.') })
    const result = schema.safeParse({ name: '' })

    errorHandler(result.success ? undefined : result.error, {} as any, res, next)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        errors: [{ campo: 'name', mensagem: 'Nome é obrigatório.' }],
      })
    )
  })

  it('responde com o statusCode e os detalhes de uma ValidationError', () => {
    const error = new ValidationError('Dados inválidos.', [{ campo: 'x', mensagem: 'y' }])

    errorHandler(error, {} as any, res, next)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Dados inválidos.',
      errors: [{ campo: 'x', mensagem: 'y' }],
    })
  })

  it('responde 404 para NotFoundError e 409 para ConflictError', () => {
    errorHandler(new NotFoundError(), {} as any, res, next)
    expect(res.status).toHaveBeenCalledWith(404)

    errorHandler(new ConflictError(), {} as any, res, next)
    expect(res.status).toHaveBeenCalledWith(409)
  })

  it('mapeia P2002 (unique constraint) pra 409', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '5.0.0',
      meta: { target: ['numeroOS'] },
    })

    errorHandler(error, {} as any, res, next)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('numeroOS') })
    )
  })

  it('mapeia P2025 (not found) pra 404', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '5.0.0',
    })

    errorHandler(error, {} as any, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('responde 500 genérico pra erro não mapeado', () => {
    errorHandler(new Error('boom'), {} as any, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Erro interno do servidor.',
    })
  })
})
