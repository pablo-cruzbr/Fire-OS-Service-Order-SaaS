import { describe, it, expect } from 'vitest'
import { createAssistenciaTecnicaSchema, updateAssistenciaTecnicaSchema } from './assistenciaTecnica.schema'

const payloadValido = {
  name: 'Notebook Dell',
  mesAno: '2026-09-01',
  idChamado: 'CH-001',
  assistencia: 'Assistência autorizada Dell',
  observacoes: 'Sem observações',
  osDaAssistencia: 'OS-001',
  dataDeRetirada: '2026-09-05',
  equipamento_id: '11111111-1111-4111-8111-111111111111',
  statusReparo_id: '22222222-2222-4222-8222-222222222222',
  tecnico_id: '33333333-3333-4333-8333-333333333333',
}

describe('createAssistenciaTecnicaSchema', () => {
  it('aceita o payload mínimo válido', () => {
    expect(createAssistenciaTecnicaSchema.safeParse(payloadValido).success).toBe(true)
  })

  it('rejeita quando falta campo obrigatório', () => {
    const { name, ...semNome } = payloadValido
    expect(createAssistenciaTecnicaSchema.safeParse(semNome).success).toBe(false)
  })

  it('rejeita quando um _id não é uuid válido', () => {
    expect(
      createAssistenciaTecnicaSchema.safeParse({ ...payloadValido, tecnico_id: 'não-é-uuid' }).success
    ).toBe(false)
  })

  it('aceita cliente_id e instituicaoUnidade_id ausentes (são opcionais)', () => {
    expect(createAssistenciaTecnicaSchema.safeParse(payloadValido).success).toBe(true)
  })
})

describe('updateAssistenciaTecnicaSchema', () => {
  it('aceita objeto vazio (todo campo é opcional)', () => {
    expect(updateAssistenciaTecnicaSchema.safeParse({}).success).toBe(true)
  })

  it('aceita atualização parcial de um campo só', () => {
    expect(updateAssistenciaTecnicaSchema.safeParse({ observacoes: 'Nova observação' }).success).toBe(true)
  })
})
