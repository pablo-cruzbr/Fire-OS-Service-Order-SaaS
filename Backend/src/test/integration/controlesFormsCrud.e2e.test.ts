import { describe, it, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'
import { criarUsuarioELogar, limparBanco } from './helpers'

// Os 5 módulos de controles_forms que não têm ownership (diferente dos 3
// técnicos cobertos em controlesTecnicos.e2e.test.ts) — CRUD simples,
// protegido só por isAuthenticated. Um describe por módulo: cria via HTTP
// com sucesso, 401 sem token, 422 quando falta campo obrigatório.
describe('controles_forms — CRUD simples (E2E)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  describe('ControledeEstabilizadores', () => {
    it('cria via HTTP', async () => {
      const estabilizador = await prismaClient.estabilizadores.create({
        data: { name: 'Estabilizador SMS', patrimonio: 'EST-001' },
      })
      const status = await prismaClient.statusEstabilizadores.create({ data: { name: 'Em uso' } })
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-estab@teste.com' })

      const response = await supertest(app)
        .post('/controledeestabilizadores')
        .set('Authorization', `Bearer ${token}`)
        .send({
          idChamado: 'CH-100',
          problema: 'Não estabiliza a tensão',
          observacoes: 'Nenhuma',
          osdaAssistencia: 'OS-100',
          datadeChegada: '2026-09-01',
          datadeRetirada: '2026-09-02',
          estabilizadores_id: estabilizador.id,
          statusEstabilizadores_id: status.id,
        })

      expect(response.status).toBe(200)
      expect(response.body.id).toBeDefined()
    })

    it('devolve 401 sem token', async () => {
      const response = await supertest(app).post('/controledeestabilizadores').send({})
      expect(response.status).toBe(401)
    })

    it('devolve 422 quando falta estabilizadores_id', async () => {
      const status = await prismaClient.statusEstabilizadores.create({ data: { name: 'Em uso' } })
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-estab2@teste.com' })

      const response = await supertest(app)
        .post('/controledeestabilizadores')
        .set('Authorization', `Bearer ${token}`)
        .send({
          idChamado: 'CH-101',
          problema: 'Não estabiliza a tensão',
          observacoes: 'Nenhuma',
          osdaAssistencia: 'OS-101',
          datadeChegada: '2026-09-01',
          datadeRetirada: '2026-09-02',
          statusEstabilizadores_id: status.id,
        })

      expect(response.status).toBe(422)
    })
  })

  describe('ControleDeLaboratorio', () => {
    it('cria via HTTP', async () => {
      const status = await prismaClient.statusControledeLaboratorio.create({ data: { name: 'Aguardando conserto' } })
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-lab@teste.com' })

      const response = await supertest(app)
        .post('/controledelaboratorio')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nomedoEquipamento: 'Monitor',
          defeito: 'Tela quebrada',
          marca: 'LG',
          osDeAbertura: 'OS-200',
          osDeDevolucao: 'OS-201',
          data_de_Chegada: '2026-09-01',
          data_de_Finalizacao: '2026-09-10',
          statusControledeLaboratorio_id: status.id,
        })

      expect(response.status).toBe(200)
      expect(response.body.id).toBeDefined()
    })

    it('devolve 401 sem token', async () => {
      const response = await supertest(app).post('/controledelaboratorio').send({})
      expect(response.status).toBe(401)
    })

    it('devolve 422 quando falta statusControledeLaboratorio_id', async () => {
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-lab2@teste.com' })

      const response = await supertest(app)
        .post('/controledelaboratorio')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nomedoEquipamento: 'Monitor',
          defeito: 'Tela quebrada',
          marca: 'LG',
          osDeAbertura: 'OS-202',
          osDeDevolucao: 'OS-203',
          data_de_Chegada: '2026-09-01',
          data_de_Finalizacao: '2026-09-10',
        })

      expect(response.status).toBe(422)
    })
  })

  describe('ControleDeMaquinasPendentesLab', () => {
    it('cria via HTTP', async () => {
      const equipamento = await prismaClient.equipamento.create({ data: { name: 'Notebook', patrimonio: 'PAT-300' } })
      const status = await prismaClient.statusMaquinasPendentesLab.create({ data: { name: 'Disponível' } })
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-pendlab@teste.com' })

      const response = await supertest(app)
        .post('/controledemaquinaspendenteslab')
        .set('Authorization', `Bearer ${token}`)
        .send({
          numeroDeSerie: 'SN-001',
          ssd: '256GB',
          idDaOs: 'OS-300',
          obs: 'Nenhuma',
          equipamento_id: equipamento.id,
          statusMaquinasPendentesLab_id: status.id,
        })

      expect(response.status).toBe(200)
      expect(response.body.id).toBeDefined()
    })

    it('devolve 401 sem token', async () => {
      const response = await supertest(app).post('/controledemaquinaspendenteslab').send({})
      expect(response.status).toBe(401)
    })
  })

  describe('ControleDeMaquinasPendentesOro', () => {
    it('cria via HTTP', async () => {
      const equipamento = await prismaClient.equipamento.create({ data: { name: 'Notebook', patrimonio: 'PAT-301' } })
      const instituicaoUnidade = await prismaClient.instituicaoUnidade.create({
        data: { name: 'Unidade Oro', endereco: 'Rua Oro, 1' },
      })
      const status = await prismaClient.statusMaquinasPendentesOro.create({ data: { name: 'Instalada' } })
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-pendoro@teste.com' })

      const response = await supertest(app)
        .post('/controledemaquinaspendentesoro')
        .set('Authorization', `Bearer ${token}`)
        .send({
          datadaInstalacao: '2026-09-01',
          osInstalacao: 'OS-400',
          osRetirada: 'OS-401',
          equipamento_id: equipamento.id,
          instituicaoUnidade_id: instituicaoUnidade.id,
          statusMaquinasPendentesOro_id: status.id,
        })

      expect(response.status).toBe(200)
      expect(response.body.id).toBeDefined()
    })

    it('devolve 422 quando falta instituicaoUnidade_id (obrigatório aqui, diferente do módulo Lab)', async () => {
      const equipamento = await prismaClient.equipamento.create({ data: { name: 'Notebook', patrimonio: 'PAT-302' } })
      const status = await prismaClient.statusMaquinasPendentesOro.create({ data: { name: 'Instalada' } })
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-pendoro2@teste.com' })

      const response = await supertest(app)
        .post('/controledemaquinaspendentesoro')
        .set('Authorization', `Bearer ${token}`)
        .send({
          datadaInstalacao: '2026-09-01',
          osInstalacao: 'OS-402',
          osRetirada: 'OS-403',
          equipamento_id: equipamento.id,
          statusMaquinasPendentesOro_id: status.id,
        })

      expect(response.status).toBe(422)
    })
  })

  describe('SolicitacaodeCompras', () => {
    it('cria via HTTP', async () => {
      const status = await prismaClient.statusCompras.create({ data: { name: 'Aguardando' } })
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-compras@teste.com' })

      const response = await supertest(app)
        .post('/solicitacaodecompras')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemSolicitado: 'Mouse sem fio',
          solicitante: 'Maria',
          motivoDaSolicitacao: 'Substituição de item quebrado',
          preco: 79.9,
          linkDeCompra: 'https://loja.exemplo.com/mouse',
          statusCompras_id: status.id,
        })

      expect(response.status).toBe(200)
      expect(response.body.id).toBeDefined()
    })

    it('devolve 422 quando o preço é negativo', async () => {
      const status = await prismaClient.statusCompras.create({ data: { name: 'Aguardando' } })
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-compras2@teste.com' })

      const response = await supertest(app)
        .post('/solicitacaodecompras')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemSolicitado: 'Mouse sem fio',
          solicitante: 'Maria',
          motivoDaSolicitacao: 'Substituição de item quebrado',
          preco: -10,
          linkDeCompra: 'https://loja.exemplo.com/mouse',
          statusCompras_id: status.id,
        })

      expect(response.status).toBe(422)
    })

    it('devolve 401 sem token', async () => {
      const response = await supertest(app).post('/solicitacaodecompras').send({})
      expect(response.status).toBe(401)
    })
  })
})
