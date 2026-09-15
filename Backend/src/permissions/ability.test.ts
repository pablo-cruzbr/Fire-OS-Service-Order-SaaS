import { describe, it, expect } from 'vitest'
import { subject } from '@casl/ability'
import { defineAbilityFor } from './ability'

describe('defineAbilityFor — OrdemdeServico', () => {
  it('ADMIN pode dar update em qualquer Ordem de Serviço', () => {
    const ability = defineAbilityFor({ role: 'ADMIN' })
    const ordemDeOutroTecnico = subject('OrdemdeServico', { tecnico_id: 'tecnico-999' })

    expect(ability.can('update', ordemDeOutroTecnico)).toBe(true)
  })

  it('TECNICO pode dar update na própria Ordem de Serviço', () => {
    const ability = defineAbilityFor({ role: 'TECNICO', tecnico_id: 'tecnico-1' })
    const ordemPropria = subject('OrdemdeServico', { tecnico_id: 'tecnico-1' })

    expect(ability.can('update', ordemPropria)).toBe(true)
  })

  it('TECNICO NÃO pode dar update na Ordem de Serviço de outro técnico', () => {
    const ability = defineAbilityFor({ role: 'TECNICO', tecnico_id: 'tecnico-1' })
    const ordemDeOutroTecnico = subject('OrdemdeServico', { tecnico_id: 'tecnico-999' })

    expect(ability.can('update', ordemDeOutroTecnico)).toBe(false)
  })

  it('TECNICO pode ler qualquer Ordem de Serviço, mesmo não sendo a dele', () => {
    const ability = defineAbilityFor({ role: 'TECNICO', tecnico_id: 'tecnico-1' })
    const ordemDeOutroTecnico = subject('OrdemdeServico', { tecnico_id: 'tecnico-999' })

    expect(ability.can('read', ordemDeOutroTecnico)).toBe(true)
  })

  it('USER não pode dar update em nenhuma Ordem de Serviço, só ler', () => {
    const ability = defineAbilityFor({ role: 'USER' })
    const qualquerOrdem = subject('OrdemdeServico', { tecnico_id: 'tecnico-1' })

    expect(ability.can('read', qualquerOrdem)).toBe(true)
    expect(ability.can('update', qualquerOrdem)).toBe(false)
  })
})

describe('defineAbilityFor — os 3 módulos técnicos (achado e corrigido em 14-15/09)', () => {
  const recursos = [
    'ControleDeAssistenciaTecnica',
    'ControleDeLaudoTecnico',
    'DocumentacaoTecnica',
  ] as const

  it.each(recursos)('ADMIN pode dar update em qualquer %s', (recurso) => {
    const ability = defineAbilityFor({ role: 'ADMIN' })
    const registroDeOutroTecnico = subject(recurso, { tecnico_id: 'tecnico-999' })

    expect(ability.can('update', registroDeOutroTecnico)).toBe(true)
  })

  it.each(recursos)('TECNICO pode dar update no próprio %s', (recurso) => {
    const ability = defineAbilityFor({ role: 'TECNICO', tecnico_id: 'tecnico-1' })
    const registroProprio = subject(recurso, { tecnico_id: 'tecnico-1' })

    expect(ability.can('update', registroProprio)).toBe(true)
  })

  it.each(recursos)('TECNICO NÃO pode dar update em %s de outro técnico', (recurso) => {
    const ability = defineAbilityFor({ role: 'TECNICO', tecnico_id: 'tecnico-1' })
    const registroDeOutroTecnico = subject(recurso, { tecnico_id: 'tecnico-999' })

    expect(ability.can('update', registroDeOutroTecnico)).toBe(false)
  })

  it.each(recursos)('USER não pode dar update em %s, só ler', (recurso) => {
    const ability = defineAbilityFor({ role: 'USER' })
    const qualquerRegistro = subject(recurso, { tecnico_id: 'tecnico-1' })

    expect(ability.can('read', qualquerRegistro)).toBe(true)
    expect(ability.can('update', qualquerRegistro)).toBe(false)
  })
})
