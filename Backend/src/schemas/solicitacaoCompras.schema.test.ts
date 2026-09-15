import { describe, it, expect } from 'vitest'
import { createSolicitacaoComprasSchema, updateSolicitacaoComprasSchema } from './solicitacaoCompras.schema'

const payloadValido = {
  itemSolicitado: 'Mouse sem fio',
  solicitante: 'João',
  motivoDaSolicitacao: 'Mouse quebrado',
  preco: 89.9,
  linkDeCompra: 'https://loja.com/mouse',
  statusCompras_id: '11111111-1111-4111-8111-111111111111',
}

describe('createSolicitacaoComprasSchema', () => {
  it('aceita o payload válido', () => {
    expect(createSolicitacaoComprasSchema.safeParse(payloadValido).success).toBe(true)
  })

  it('rejeita preço negativo', () => {
    expect(createSolicitacaoComprasSchema.safeParse({ ...payloadValido, preco: -10 }).success).toBe(false)
  })

  it('faz coerce de preço string pra number', () => {
    const result = createSolicitacaoComprasSchema.safeParse({ ...payloadValido, preco: '89.90' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.preco).toBe(89.9)
    }
  })

  it('rejeita quando falta campo obrigatório', () => {
    const { itemSolicitado, ...semItem } = payloadValido
    expect(createSolicitacaoComprasSchema.safeParse(semItem).success).toBe(false)
  })
})

describe('updateSolicitacaoComprasSchema', () => {
  it('aceita objeto vazio (todo campo é opcional)', () => {
    expect(updateSolicitacaoComprasSchema.safeParse({}).success).toBe(true)
  })
})
