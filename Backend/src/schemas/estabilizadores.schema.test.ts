import { describe, it, expect } from 'vitest'
import { createEstabilizadoresSchema, updateEstabilizadoresSchema } from './estabilizadores.schema'

const payloadValido = {
  idChamado: 'CH-001',
  problema: 'Estabilizador não liga',
  observacoes: '',
  osdaAssistencia: 'OS-001',
  datadeChegada: '2026-09-01',
  datadeRetirada: '2026-09-05',
  estabilizadores_id: '11111111-1111-4111-8111-111111111111',
  statusEstabilizadores_id: '22222222-2222-4222-8222-222222222222',
}

describe('createEstabilizadoresSchema', () => {
  it('aceita o payload mínimo válido', () => {
    expect(createEstabilizadoresSchema.safeParse(payloadValido).success).toBe(true)
  })

  it('rejeita quando falta campo obrigatório', () => {
    const { problema, ...semProblema } = payloadValido
    expect(createEstabilizadoresSchema.safeParse(semProblema).success).toBe(false)
  })

  it('rejeita quando um _id não é uuid válido', () => {
    expect(
      createEstabilizadoresSchema.safeParse({ ...payloadValido, estabilizadores_id: 'não-é-uuid' }).success
    ).toBe(false)
  })
})

describe('updateEstabilizadoresSchema', () => {
  it('aceita objeto vazio (todo campo é opcional)', () => {
    expect(updateEstabilizadoresSchema.safeParse({}).success).toBe(true)
  })
})
