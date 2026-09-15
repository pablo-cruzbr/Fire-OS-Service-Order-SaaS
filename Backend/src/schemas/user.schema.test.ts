import { describe, it, expect } from 'vitest'
import { createUserSchema, updateUserSchema, authUserSchema } from './user.schema'

describe('createUserSchema', () => {
  it('aceita o payload mínimo válido', () => {
    const result = createUserSchema.safeParse({
      name: 'João Técnico',
      email: 'joao@allti.com',
      password: 'senha123',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita quando falta a senha', () => {
    const result = createUserSchema.safeParse({ name: 'João', email: 'joao@allti.com' })
    expect(result.success).toBe(false)
  })

  it('rejeita senha curta demais', () => {
    const result = createUserSchema.safeParse({ name: 'João', email: 'joao@allti.com', password: '123' })
    expect(result.success).toBe(false)
  })

  it('rejeita email em formato inválido', () => {
    const result = createUserSchema.safeParse({ name: 'João', email: 'não-é-email', password: 'senha123' })
    expect(result.success).toBe(false)
  })
})

describe('updateUserSchema', () => {
  it('aceita objeto vazio (todo campo é opcional)', () => {
    expect(updateUserSchema.safeParse({}).success).toBe(true)
  })

  it('rejeita senha curta demais quando informada', () => {
    expect(updateUserSchema.safeParse({ password: '123' }).success).toBe(false)
  })
})

describe('authUserSchema', () => {
  it('aceita email e senha válidos', () => {
    expect(authUserSchema.safeParse({ email: 'joao@allti.com', password: 'qualquer' }).success).toBe(true)
  })

  it('rejeita quando falta a senha', () => {
    expect(authUserSchema.safeParse({ email: 'joao@allti.com' }).success).toBe(false)
  })
})
