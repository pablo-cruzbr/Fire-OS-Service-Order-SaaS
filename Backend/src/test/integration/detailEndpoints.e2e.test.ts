import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'
import { criarUsuarioELogar, limparBanco } from './helpers'

// 7 módulos de controles_forms têm um endpoint GET .../detail?controle_id=
// (ou ?compra_id= no caso de SolicitacaoCompras) que nunca tinha Zod nem
// Repository — todos praticamente idênticos em formato (query string, um
// findUnique com include, sem checagem de "não encontrado"). Em vez de 7
// arquivos de teste quase iguais, 2 representativos: um com relação simples
// (AssistenciaTecnica) e um com nome de query diferente (SolicitacaoCompras).
describe('Detail endpoints de controles_forms (E2E)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  it('GET /controledeassistenciatecnica/detail devolve o registro com a relação incluída', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-detail-assist@teste.com' })
    const equipamento = await prismaClient.equipamento.create({ data: { name: 'Notebook', patrimonio: 'PAT-600' } })
    const statusReparo = await prismaClient.statusReparo.create({ data: { name: 'Aguardando' } })
    const tecnico = await prismaClient.tecnico.create({ data: { name: 'Técnico Detail' } })

    const registro = await prismaClient.controleDeAssistenciaTecnica.create({
      data: {
        name: 'Impressora com defeito',
        mesAno: new Date('2026-09-01'),
        idChamado: 'CH-600',
        assistencia: 'Assistência XYZ',
        observacoes: 'Nenhuma',
        osDaAssistencia: 'OS-600',
        dataDeRetirada: new Date('2026-09-05'),
        equipamento: { connect: { id: equipamento.id } },
        statusReparo: { connect: { id: statusReparo.id } },
        tecnico: { connect: { id: tecnico.id } },
      },
    })

    const response = await supertest(app)
      .get('/controledeassistenciatecnica/detail')
      .query({ controle_id: registro.id })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(registro.id)
    expect(response.body.statusReparo.name).toBe('Aguardando')
  })

  it('GET /controledeassistenciatecnica/detail devolve 422 quando controle_id não é um uuid', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-detail-assist2@teste.com' })

    const response = await supertest(app)
      .get('/controledeassistenciatecnica/detail')
      .query({ controle_id: 'não-é-um-uuid' })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(422)
  })

  it('GET /compra/detail (query compra_id, não controle_id) devolve o registro com a relação incluída', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-detail-compra@teste.com' })
    const status = await prismaClient.statusCompras.create({ data: { name: 'Aguardando' } })

    const registro = await prismaClient.solicitacaoDeCompras.create({
      data: {
        itemSolicitado: 'Mouse sem fio',
        solicitante: 'Maria',
        motivoDaSolicitacao: 'Substituição',
        preco: 79.9,
        linkDeCompra: 'https://loja.exemplo.com/mouse',
        statusCompras: { connect: { id: status.id } },
      },
    })

    const response = await supertest(app)
      .get('/compra/detail')
      .query({ compra_id: registro.id })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(registro.id)
    expect(response.body.statusCompras.name).toBe('Aguardando')
  })

  it('GET /compra/detail devolve 200 com corpo nulo quando o id não existe (comportamento preservado, sem 404)', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-detail-compra2@teste.com' })

    const response = await supertest(app)
      .get('/compra/detail')
      .query({ compra_id: randomUUID() })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toBeNull()
  })
})
