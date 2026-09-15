import { describe, it, expect } from 'vitest'
import { createLaboratorioSchema, updateLaboratorioSchema } from './laboratorio.schema'

const payloadValido = {
  nomedoEquipamento: 'Impressora HP',
  defeito: 'Não imprime',
  marca: 'HP',
  osDeAbertura: 'OS-001',
  osDeDevolucao: 'OS-002',
  data_de_Chegada: '2026-09-01',
  data_de_Finalizacao: '2026-09-05',
  statusControledeLaboratorio_id: '11111111-1111-4111-8111-111111111111',
}

describe('createLaboratorioSchema', () => {
  it('aceita o payload mínimo válido (FKs de cliente/instituição/equipamento são opcionais)', () => {
    expect(createLaboratorioSchema.safeParse(payloadValido).success).toBe(true)
  })

  it('rejeita quando falta campo obrigatório', () => {
    const { defeito, ...semDefeito } = payloadValido
    expect(createLaboratorioSchema.safeParse(semDefeito).success).toBe(false)
  })

  it('rejeita quando statusControledeLaboratorio_id não é uuid válido', () => {
    expect(
      createLaboratorioSchema.safeParse({ ...payloadValido, statusControledeLaboratorio_id: 'não-é-uuid' }).success
    ).toBe(false)
  })
})

describe('updateLaboratorioSchema', () => {
  it('aceita objeto vazio (todo campo é opcional)', () => {
    expect(updateLaboratorioSchema.safeParse({}).success).toBe(true)
  })
})
