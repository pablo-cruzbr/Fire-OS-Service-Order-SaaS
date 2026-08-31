import { describe, it, expect } from 'vitest'
import { createOrdemdeServicoSchema, idParamSchema, updateOrdemdeServicoSchema } from './ordemdeServico.schema'

describe('createOrdemdeServicoSchema', () => {
  it('aceita o payload mínimo válido', () => {
    const result = createOrdemdeServicoSchema.safeParse({
      name: 'Computador sem ligar',
      descricaodoProblemaouSolicitacao: 'Não liga',
      patrimoniodoequipamento: 'PAT-001',
      tipodeChamado_id: '11111111-1111-4111-8111-111111111111',
      user_id: '22222222-2222-4222-8222-222222222222',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita quando falta campo obrigatório', () => {
    const result = createOrdemdeServicoSchema.safeParse({ name: 'Só o nome' })
    expect(result.success).toBe(false)
  })

  it('rejeita quando um _id não é um uuid válido', () => {
    const result = createOrdemdeServicoSchema.safeParse({
      name: 'Computador sem ligar',
      descricaodoProblemaouSolicitacao: 'Não liga',
      patrimoniodoequipamento: 'PAT-001',
      tipodeChamado_id: 'nao-eh-um-uuid',
      user_id: '22222222-2222-4222-8222-222222222222',
    })
    expect(result.success).toBe(false)
  })
})

describe('idParamSchema', () => {
  it('aceita um uuid válido', () => {
    expect(idParamSchema.safeParse({ id: '11111111-1111-4111-8111-111111111111' }).success).toBe(true)
  })

  it('rejeita um id que não é uuid', () => {
    expect(idParamSchema.safeParse({ id: 'abc123' }).success).toBe(false)
  })
})

describe('updateOrdemdeServicoSchema', () => {
  it('aceita objeto vazio (todo campo é opcional)', () => {
    expect(updateOrdemdeServicoSchema.safeParse({}).success).toBe(true)
  })

  it('faz coerce de duracao string para number', () => {
    const result = updateOrdemdeServicoSchema.safeParse({ duracao: '150' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.duracao).toBe(150)
    }
  })
})
