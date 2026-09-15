import { describe, it, expect } from 'vitest'
import { idParamSchema } from './common.schema'

describe('idParamSchema', () => {
  it('aceita um uuid válido', () => {
    expect(idParamSchema.safeParse({ id: '11111111-1111-4111-8111-111111111111' }).success).toBe(true)
  })

  it('rejeita um id que não é uuid', () => {
    expect(idParamSchema.safeParse({ id: 'abc123' }).success).toBe(false)
  })
})
