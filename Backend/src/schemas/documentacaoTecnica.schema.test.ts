import { describe, it, expect } from 'vitest'
import { createDocumentacaoTecnicaSchema, updateDocumentacaoTecnicaSchema } from './documentacaoTecnica.schema'

const payloadValido = {
  titulo: 'Manual do equipamento X',
  descricao: 'Descrição completa',
  tecnico_id: '11111111-1111-4111-8111-111111111111',
}

describe('createDocumentacaoTecnicaSchema', () => {
  it('aceita o payload mínimo válido', () => {
    expect(createDocumentacaoTecnicaSchema.safeParse(payloadValido).success).toBe(true)
  })

  it('rejeita quando falta o título', () => {
    const { titulo, ...semTitulo } = payloadValido
    expect(createDocumentacaoTecnicaSchema.safeParse(semTitulo).success).toBe(false)
  })

  it('rejeita quando tecnico_id não é uuid válido', () => {
    expect(
      createDocumentacaoTecnicaSchema.safeParse({ ...payloadValido, tecnico_id: 'não-é-uuid' }).success
    ).toBe(false)
  })
})

describe('updateDocumentacaoTecnicaSchema', () => {
  it('aceita objeto vazio (todo campo é opcional)', () => {
    expect(updateDocumentacaoTecnicaSchema.safeParse({}).success).toBe(true)
  })
})
