import { describe, it, expect, beforeEach } from 'vitest'
import prismaClient from '../../prisma'
import { EquipamentoRepository } from '../../repositories/EquipamentoRepository'
import { InformacoesSetorRepository } from '../../repositories/InformacoesSetorRepository'
import { InstituicaoUnidadeRepository } from '../../repositories/InstituicaoUnidadeRepository'
import { LookupCategoriaRepository } from '../../repositories/LookupCategoriaRepository'
import { limparBanco } from './helpers'

describe('EquipamentoRepository (integração, Postgres real)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  it('findByPatrimonio acha o equipamento certo e devolve null quando não existe', async () => {
    const repository = new EquipamentoRepository()
    await repository.create({ name: 'Notebook', patrimonio: 'PAT-001' })

    expect((await repository.findByPatrimonio('PAT-001'))?.name).toBe('Notebook')
    expect(await repository.findByPatrimonio('PAT-INEXISTENTE')).toBeNull()
  })
})

describe('InformacoesSetorRepository (integração, Postgres real)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  it('create com UncheckedCreateInput (setorId escalar) grava e o findAll traz a relação de setor', async () => {
    const setor = await prismaClient.setor.create({ data: { name: 'TI' } })
    const repository = new InformacoesSetorRepository()

    await repository.create({ usuario: 'Fulano', andar: '2', ramal: '123', setorId: setor.id })

    const [encontrado] = await repository.findAll()
    expect(encontrado.setor?.name).toBe('TI')
  })
})

describe('InstituicaoUnidadeRepository (integração, Postgres real)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  it('create+findAll+count refletem o Postgres de verdade', async () => {
    const repository = new InstituicaoUnidadeRepository()

    await repository.create({ name: 'Unidade Central', endereco: 'Rua Principal, 100' })

    expect(await repository.count()).toBe(1)
    const [encontrada] = await repository.findAll()
    expect(encontrada.name).toBe('Unidade Central')
  })
})

describe('LookupCategoriaRepository (integração, Postgres real)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  // O ponto de risco real aqui é `prismaClient[this.modelName]` (delegate
  // genérico via `any`): um nome de model errado só quebra em runtime, e um
  // teste unitário com Prisma mockado nunca chamaria o Prisma de verdade pra
  // pegar isso. Provar com 2 models de lookup diferentes (tabelas físicas
  // distintas) é o que garante que a generalização (13 repositories -> 1)
  // realmente funciona pra qualquer um deles, não só pro que foi copiado
  // primeiro.
  it('funciona contra tabelas de lookup físicas diferentes (tarefa e statusReparo)', async () => {
    const tarefaRepository = new LookupCategoriaRepository('tarefa')
    const statusReparoRepository = new LookupCategoriaRepository('statusReparo')

    const tarefa = await tarefaRepository.create('Instalação')
    const status = await statusReparoRepository.create('ABERTO')

    expect(await tarefaRepository.findAll()).toEqual([{ id: tarefa.id, name: 'Instalação' }])
    expect(await statusReparoRepository.findAll()).toEqual([{ id: status.id, name: 'ABERTO' }])

    await tarefaRepository.delete(tarefa.id)
    expect(await tarefaRepository.findAll()).toEqual([])
    // Deletar de um model não deve afetar o outro — prova que o `delegate`
    // aponta pra tabela certa em cada instância.
    expect(await statusReparoRepository.findAll()).toHaveLength(1)
  })
})
