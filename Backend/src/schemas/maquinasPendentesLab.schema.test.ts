import { describe, it, expect } from 'vitest'
import { createMaquinasPendentesLabSchema, updateMaquinasPendentesLabSchema } from './maquinasPendentesLab.schema'

const payloadValido = {
  numeroDeSerie: 'SN-001',
  ssd: '256GB',
  idDaOs: 'OS-001',
  obs: '',
  equipamento_id: '11111111-1111-4111-8111-111111111111',
  statusMaquinasPendentesLab_id: '22222222-2222-4222-8222-222222222222',
}

describe('createMaquinasPendentesLabSchema', () => {
  it('aceita o payload mínimo válido', () => {
    expect(createMaquinasPendentesLabSchema.safeParse(payloadValido).success).toBe(true)
  })

  it('rejeita quando falta campo obrigatório', () => {
    const { numeroDeSerie, ...semNumero } = payloadValido
    expect(createMaquinasPendentesLabSchema.safeParse(semNumero).success).toBe(false)
  })
})

describe('updateMaquinasPendentesLabSchema', () => {
  it('aceita objeto vazio (todo campo é opcional)', () => {
    expect(updateMaquinasPendentesLabSchema.safeParse({}).success).toBe(true)
  })
})
