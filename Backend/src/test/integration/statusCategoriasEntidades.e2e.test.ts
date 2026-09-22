import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'
import { criarUsuarioELogar, limparBanco } from './helpers'

// Equipamento, InformacoesSetor e InstituicaoUnidade são as 3 "entidades
// reais" de status_categorias (ao contrário das 13 tabelas "só nome" de
// lookupCategoria.e2e.test.ts) — e as 3 tiveram bugs de produção reais
// achados no rollout de 15/09 (ver GUIA-ZOD-REPOSITORY.md, "Sétimo passo"):
// rotas de Update que 404 sempre (Frontend já chamava), um Delete que lia o
// id do lugar errado, e conflito de patrimônio devolvendo 500 em vez de 409.
describe('status_categorias — Equipamento/InformacoesSetor/InstituicaoUnidade (E2E)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  describe('Equipamento', () => {
    it('cria, atualiza e apaga via HTTP (ciclo completo)', async () => {
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-equip@teste.com' })

      const createResponse = await supertest(app)
        .post('/equipamento')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Notebook Dell', patrimonio: 'PAT-200' })

      expect(createResponse.status).toBe(200)
      const equipamentoId = createResponse.body.id
      expect(equipamentoId).toBeDefined()

      const updateResponse = await supertest(app)
        .patch(`/equipamento/${equipamentoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Notebook Dell (renomeado)' })

      expect(updateResponse.status).toBe(200)

      const naBaseAntesDoDelete = await prismaClient.equipamento.findUnique({ where: { id: equipamentoId } })
      expect(naBaseAntesDoDelete?.name).toBe('Notebook Dell (renomeado)')

      // Regressão do bug de 15/09: o Delete lia req.query.equipamento_id
      // (sempre undefined) em vez do :id do path — nunca apagava nada de
      // verdade, o try/catch genérico mascarava como um 400 comum.
      const deleteResponse = await supertest(app)
        .delete(`/deleteequipamento/${equipamentoId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(deleteResponse.status).toBe(200)

      const naBaseDepoisDoDelete = await prismaClient.equipamento.findUnique({ where: { id: equipamentoId } })
      expect(naBaseDepoisDoDelete).toBeNull()
    })

    it('devolve 409 ao criar com um patrimônio que já existe', async () => {
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-equip2@teste.com' })
      await prismaClient.equipamento.create({ data: { name: 'Já existe', patrimonio: 'PAT-201' } })

      const response = await supertest(app)
        .post('/equipamento')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Outro notebook', patrimonio: 'PAT-201' })

      expect(response.status).toBe(409)
    })
  })

  describe('InformacoesSetor', () => {
    it('cria e atualiza via HTTP sem apagar associações que não vieram no payload', async () => {
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-setor@teste.com' })
      const setor = await prismaClient.setor.create({ data: { name: 'TI' } })

      const createResponse = await supertest(app)
        .post('/informacoessetor')
        .set('Authorization', `Bearer ${token}`)
        .send({ setorId: setor.id, usuario: 'Maria', andar: '2', ramal: '1234' })

      expect(createResponse.status).toBe(200)
      const infoId = createResponse.body.id
      expect(infoId).toBeDefined()

      // Regressão do bug de partial-update de 15/09: o Service antigo
      // recalculava cliente_id/instituicaoUnidade_id mesmo quando eles não
      // vinham no payload. Aqui só mandamos `ramal` — os outros campos
      // não devem mudar.
      const updateResponse = await supertest(app)
        .patch(`/informacoessetor/${infoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ ramal: '5678' })

      expect(updateResponse.status).toBe(200)

      const naBase = await prismaClient.informacoesSetor.findUnique({ where: { id: infoId } })
      expect(naBase?.ramal).toBe('5678')
      expect(naBase?.usuario).toBe('Maria')
      expect(naBase?.andar).toBe('2')
    })

    it('devolve 404 ao atualizar um id inexistente', async () => {
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-setor2@teste.com' })

      const response = await supertest(app)
        .patch(`/informacoessetor/${randomUUID()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ ramal: '0000' })

      expect(response.status).toBe(404)
    })
  })

  describe('InstituicaoUnidade', () => {
    it('cria via HTTP, e só ADMIN consegue atualizar', async () => {
      const tipo = await prismaClient.tipodeInstituicaoUnidade.create({ data: { name: 'Hospital' } })
      const { token: tokenAdmin } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-inst@teste.com' })

      const createResponse = await supertest(app)
        .post('/categoryintituicao')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          name: 'Unidade Centro',
          endereco: 'Rua Principal, 1',
          telefone: '11999999999',
          tipodeInstituicaoUnidade_id: tipo.id,
        })

      expect(createResponse.status).toBe(200)
      const instituicaoId = createResponse.body.id
      expect(instituicaoId).toBeDefined()

      const updateResponse = await supertest(app)
        .patch(`/instituicaounidade/update/${instituicaoId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          name: 'Unidade Centro (renomeada)',
          endereco: 'Rua Principal, 1',
          tipodeInstituicaoUnidade_id: tipo.id,
        })

      expect(updateResponse.status).toBe(200)
    })

    it('usuário não-ADMIN toma 403 ao tentar atualizar uma instituição', async () => {
      const tipo = await prismaClient.tipodeInstituicaoUnidade.create({ data: { name: 'Hospital' } })
      const instituicao = await prismaClient.instituicaoUnidade.create({
        data: {
          name: 'Unidade Centro',
          endereco: 'Rua Principal, 1',
          tipodeinstituicaoUnidade_id: tipo.id,
        },
      })
      const { token } = await criarUsuarioELogar({ role: 'TECNICO', email: 'tecnico-inst@teste.com' })

      const response = await supertest(app)
        .patch(`/instituicaounidade/update/${instituicao.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Tentando renomear', endereco: 'Rua Principal, 1', tipodeInstituicaoUnidade_id: tipo.id })

      expect(response.status).toBe(403)
    })
  })
})
