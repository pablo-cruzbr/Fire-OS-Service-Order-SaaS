import { describe, it, expect } from 'vitest'
import { createLaudoTecnicoSchema, updateLaudoTecnicoSchema } from './laudoTecnico.schema'

const payloadValido = {
  descricaodoProblema: 'Tela quebrada',
  mesAno: '2026-09-01',
  osLab: 'OS-LAB-001',
  instituicaoUnidade_id: '11111111-1111-4111-8111-111111111111',
  equipamento_id: '22222222-2222-4222-8222-222222222222',
  tecnico_id: '33333333-3333-4333-8333-333333333333',
}

describe('createLaudoTecnicoSchema', () => {
  it('aceita o payload mínimo válido', () => {
    expect(createLaudoTecnicoSchema.safeParse(payloadValido).success).toBe(true)
  })

  it('rejeita quando falta campo obrigatório', () => {
    const { osLab, ...semOsLab } = payloadValido
    expect(createLaudoTecnicoSchema.safeParse(semOsLab).success).toBe(false)
  })

  it('rejeita quando um _id não é uuid válido', () => {
    expect(
      createLaudoTecnicoSchema.safeParse({ ...payloadValido, equipamento_id: 'não-é-uuid' }).success
    ).toBe(false)
  })
})

describe('updateLaudoTecnicoSchema', () => {
  it('aceita objeto vazio (todo campo é opcional)', () => {
    expect(updateLaudoTecnicoSchema.safeParse({}).success).toBe(true)
  })
})
