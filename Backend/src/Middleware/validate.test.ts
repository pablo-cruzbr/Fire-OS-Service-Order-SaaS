import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import { validate } from './validate'
import { ValidationError } from '../errors/AppError'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
})

function makeReq(body: unknown) {
  return { body } as any
}

describe('validate middleware', () => {
  it('chama next() e substitui req.body pelo dado parseado quando válido', () => {
    const req = makeReq({ name: 'Ordem de Serviço' })
    const next = vi.fn()

    validate(schema)(req, {} as any, next)

    expect(next).toHaveBeenCalledOnce()
    expect(req.body).toEqual({ name: 'Ordem de Serviço' })
  })

  it('lança ValidationError com os campos inválidos quando o payload é inválido', () => {
    const req = makeReq({ name: '' })
    const next = vi.fn()

    expect(() => validate(schema)(req, {} as any, next)).toThrowError(ValidationError)
    expect(next).not.toHaveBeenCalled()

    try {
      validate(schema)(req, {} as any, next)
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)
      expect((error as ValidationError).details).toEqual([
        { campo: 'name', mensagem: 'Nome é obrigatório.' },
      ])
    }
  })
})
