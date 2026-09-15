import { describe, it, expect } from 'vitest'
import { createMaquinasPendentesOroSchema, updateMaquinasPendentesOroSchema } from './maquinasPendentesOro.schema'

const payloadValido = {
  datadaInstalacao: '2026-09-01',
  osInstalacao: 'OS-INST-001',
  osRetirada: 'OS-RET-001',
  equipamento_id: '11111111-1111-4111-8111-111111111111',
  instituicaoUnidade_id: '22222222-2222-4222-8222-222222222222',
  statusMaquinasPendentesOro_id: '33333333-3333-4333-8333-333333333333',
}

describe('createMaquinasPendentesOroSchema', () => {
  it('aceita o payload válido', () => {
    expect(createMaquinasPendentesOroSchema.safeParse(payloadValido).success).toBe(true)
  })

  it('rejeita quando falta instituicaoUnidade_id (obrigatório aqui, diferente do módulo Lab)', () => {
    const { instituicaoUnidade_id, ...semInstituicao } = payloadValido
    expect(createMaquinasPendentesOroSchema.safeParse(semInstituicao).success).toBe(false)
  })
})

describe('updateMaquinasPendentesOroSchema', () => {
  it('aceita objeto vazio (todo campo é opcional)', () => {
    expect(updateMaquinasPendentesOroSchema.safeParse({}).success).toBe(true)
  })
})
