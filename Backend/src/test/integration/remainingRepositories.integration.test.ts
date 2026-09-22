import { describe, it, expect, beforeEach } from 'vitest'
import prismaClient from '../../prisma'
import { ClienteRepository } from '../../repositories/ClienteRepository'
import { SetorRepository } from '../../repositories/SetorRepository'
import { TecnicoRepository } from '../../repositories/TecnicoRepository'
import { EstabilizadorRepository } from '../../repositories/EstabilizadorRepository'
import { EventoRepository } from '../../repositories/EventoRepository'
import { FotoOrdemServicoRepository } from '../../repositories/FotoOrdemServicoRepository'
import { AtividadePadraoRepository } from '../../repositories/AtividadePadraoRepository'
import { limparBanco } from './helpers'

// Os 7 Repositories que fecham a lista de 21: CRUD simples, sem relação
// aninhada arriscada como os de controles_forms — o risco aqui é mais raso
// (nome de coluna errado, tipo de dado incompatível com o Postgres real,
// enum do Prisma não batendo com o valor gravado), mas ainda assim é coisa
// que um Prisma mockado não prova. Um arquivo só, um describe por
// Repository, cobrindo create + o método de leitura mais específico de cada
// um.
describe('Repositories restantes (integração, Postgres real)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  describe('ClienteRepository', () => {
    it('create+findById+count refletem o Postgres de verdade', async () => {
      const repository = new ClienteRepository()

      const criado = await repository.create({ name: 'Cliente Um', endereco: 'Rua A', cnpj: '00.000.000/0001-00' })

      expect(await repository.count()).toBe(1)
      expect((await repository.findById(criado.id))?.name).toBe('Cliente Um')
      expect(await repository.findAll()).toHaveLength(1)
    })
  })

  describe('SetorRepository', () => {
    it('create+findAll+delete refletem o Postgres de verdade', async () => {
      const repository = new SetorRepository()

      const criado = await repository.create({ name: 'TI' })
      expect(await repository.findAll()).toEqual([{ id: criado.id, name: 'TI' }])

      await repository.delete(criado.id)
      expect(await repository.findAll()).toEqual([])
    })
  })

  describe('TecnicoRepository', () => {
    it('create+findAll+count+delete refletem o Postgres de verdade', async () => {
      const repository = new TecnicoRepository()

      const criado = await repository.create({ name: 'Técnico Um' })
      expect(await repository.count()).toBe(1)

      await repository.delete(criado.id)
      expect(await repository.count()).toBe(0)
    })
  })

  describe('EstabilizadorRepository', () => {
    it('create grava na tabela certa (estabilizadores, não equipamento) e findAll lê de lá', async () => {
      const repository = new EstabilizadorRepository()

      await repository.create({ name: 'Estabilizador SMS', patrimonio: 'EST-999' })

      // Prova direta da regressão de 22/09: o Create antigo gravava em
      // `equipamento`. Aqui confirmamos as duas tabelas separadamente.
      expect(await prismaClient.estabilizadores.count()).toBe(1)
      expect(await prismaClient.equipamento.count()).toBe(0)
      expect(await repository.findAll()).toHaveLength(1)
    })
  })

  describe('EventoRepository', () => {
    it('create+findAll+update+delete refletem o Postgres de verdade (id numérico)', async () => {
      const repository = new EventoRepository()

      const criado = await repository.create({
        text: 'Evento', start_date: new Date('2026-10-01'), end_date: new Date('2026-10-02'),
      })
      expect(typeof criado.id).toBe('number')
      expect(await repository.findAll()).toHaveLength(1)

      const atualizado = await repository.update(criado.id, { text: 'Evento revisado' })
      expect(atualizado.text).toBe('Evento revisado')

      await repository.delete(criado.id)
      expect(await repository.findAll()).toHaveLength(0)
    })
  })

  describe('FotoOrdemServicoRepository', () => {
    it('findByOrdem filtra pela FK de verdade e delete apaga', async () => {
      const tipodeChamado = await prismaClient.tipodeChamado.create({ data: { name: 'Manutenção' } })
      const status = await prismaClient.statusOrdemdeServico.create({ data: { name: 'Aberto' } })
      const user = await prismaClient.user.create({
        data: { name: 'User', email: 'repo-foto@teste.com', password: 'hash', role: 'ADMIN' },
      })
      const ordem = await prismaClient.ordemdeServico.create({
        data: {
          name: 'OS com foto',
          tipodeChamado: { connect: { id: tipodeChamado.id } },
          statusOrdemdeServico: { connect: { id: status.id } },
          user: { connect: { id: user.id } },
        },
      })
      const outraOrdem = await prismaClient.ordemdeServico.create({
        data: {
          name: 'Outra OS',
          tipodeChamado: { connect: { id: tipodeChamado.id } },
          statusOrdemdeServico: { connect: { id: status.id } },
          user: { connect: { id: user.id } },
        },
      })
      await prismaClient.fotoOrdemServico.create({
        data: { url: 'https://cdn.exemplo.com/foto1.jpg', ordemdeServico: { connect: { id: ordem.id } } },
      })
      await prismaClient.fotoOrdemServico.create({
        data: { url: 'https://cdn.exemplo.com/foto2.jpg', ordemdeServico: { connect: { id: outraOrdem.id } } },
      })
      const repository = new FotoOrdemServicoRepository()

      const fotosDaOrdem = await repository.findByOrdem(ordem.id)
      expect(fotosDaOrdem).toHaveLength(1)
      expect(fotosDaOrdem[0].url).toBe('https://cdn.exemplo.com/foto1.jpg')

      await repository.delete(fotosDaOrdem[0].id)
      expect(await repository.findById(fotosDaOrdem[0].id)).toBeNull()
      expect(await repository.findByOrdem(outraOrdem.id)).toHaveLength(1)
    })
  })

  describe('AtividadePadraoRepository', () => {
    it('findAll sem filtro traz tudo, com filtro de categoria usa o enum do Prisma de verdade', async () => {
      await prismaClient.atividadePadrao.create({ data: { descricao: 'Troca de peça', categoria: 'EXTERNO' } })
      await prismaClient.atividadePadrao.create({ data: { descricao: 'Análise em bancada', categoria: 'LABORATORIO' } })
      const repository = new AtividadePadraoRepository()

      expect(await repository.findAll()).toHaveLength(2)
      expect(await repository.findAll('EXTERNO')).toHaveLength(1)
      expect(await repository.findAll('LABORATORIO')).toHaveLength(1)
    })
  })
})
