import { describe, it, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'
import { criarUsuarioELogar, limparBanco } from './helpers'

// Os 3 endpoints "ao redor" de OrdemdeServico que ficaram de fora do
// rollout original: listagem de atividades padrão (usada no dropdown de
// atividades de uma OS), o relatório da secretaria (filtra OS por tipo de
// instituição) e a exportação em Excel. Nenhum tinha Zod nem Repository.
describe('Relatórios/lookups ao redor de OrdemdeServico (E2E)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  describe('GET /listatividade', () => {
    it('lista as atividades, filtrando por categoria', async () => {
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-atividade@teste.com' })
      await prismaClient.atividadePadrao.create({
        data: { descricao: 'Visita externa', categoria: 'EXTERNO' },
      })
      await prismaClient.atividadePadrao.create({
        data: { descricao: 'Análise em laboratório', categoria: 'LABORATORIO' },
      })

      const response = await supertest(app)
        .get('/listatividade')
        .query({ categoria: 'EXTERNO' })
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].descricao).toBe('Visita externa')
    })

    it('devolve 422 quando a categoria não é um valor válido', async () => {
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-atividade2@teste.com' })

      const response = await supertest(app)
        .get('/listatividade')
        .query({ categoria: 'QUALQUER-COISA' })
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(422)
    })
  })

  describe('GET /ordens/relatorio-secretaria', () => {
    it('devolve 422 quando falta tiposIds', async () => {
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-relatorio@teste.com' })

      const response = await supertest(app)
        .get('/ordens/relatorio-secretaria')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(422)
    })

    it('filtra ordens pelo tipo de instituição informado em tiposIds', async () => {
      const { token, user } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-relatorio2@teste.com' })
      const tipoCerto = await prismaClient.tipodeInstituicaoUnidade.create({ data: { name: 'Hospital' } })
      const tipoErrado = await prismaClient.tipodeInstituicaoUnidade.create({ data: { name: 'Escola' } })
      const instituicaoCerta = await prismaClient.instituicaoUnidade.create({
        data: { name: 'Unidade Certa', endereco: 'Rua A', tipodeinstituicaoUnidade_id: tipoCerto.id },
      })
      const instituicaoErrada = await prismaClient.instituicaoUnidade.create({
        data: { name: 'Unidade Errada', endereco: 'Rua B', tipodeinstituicaoUnidade_id: tipoErrado.id },
      })
      const tipodeChamado = await prismaClient.tipodeChamado.create({ data: { name: 'Manutenção' } })
      const status = await prismaClient.statusOrdemdeServico.create({ data: { name: 'Aberto' } })

      await prismaClient.ordemdeServico.create({
        data: {
          descricaodoProblemaouSolicitacao: 'OS na unidade certa',
          tipodeChamado: { connect: { id: tipodeChamado.id } },
          statusOrdemdeServico: { connect: { id: status.id } },
          user: { connect: { id: user.id } },
          instituicaoUnidade: { connect: { id: instituicaoCerta.id } },
        },
      })
      await prismaClient.ordemdeServico.create({
        data: {
          descricaodoProblemaouSolicitacao: 'OS na unidade errada',
          tipodeChamado: { connect: { id: tipodeChamado.id } },
          statusOrdemdeServico: { connect: { id: status.id } },
          user: { connect: { id: user.id } },
          instituicaoUnidade: { connect: { id: instituicaoErrada.id } },
        },
      })

      const response = await supertest(app)
        .get('/ordens/relatorio-secretaria')
        .query({ tiposIds: tipoCerto.id })
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].descricaodoProblemaouSolicitacao).toBe('OS na unidade certa')
    })
  })

  describe('GET /ordens/exportar', () => {
    it('devolve uma planilha .xlsx (200, content-type correto)', async () => {
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-export@teste.com' })

      const response = await supertest(app)
        .get('/ordens/exportar')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toContain('spreadsheetml')
    })

    it('devolve 422 quando cliente_id não é um uuid', async () => {
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-export2@teste.com' })

      const response = await supertest(app)
        .get('/ordens/exportar')
        .query({ cliente_id: 'não-é-um-uuid' })
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(422)
    })
  })
})
