import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'
import { criarUsuarioELogar, limparBanco } from './helpers'

// Os 7 Deletes de controles_forms que ficaram fora das rodadas anteriores de
// item 7 (Estabilizadores não entra aqui — o módulo nunca teve rota de
// Delete, ver EstabilizadoresRepository.ts). Um teste por módulo: cria o
// registro direto no banco (sem passar pela API, não é o que está sob teste
// aqui), apaga via HTTP, confirma 200 e o registro sumido do banco. Sem
// ownership nessas rotas (só as de Update têm authorizeOwnership) — token de
// qualquer usuário autenticado basta.
describe('controles_forms — Delete (E2E)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  it('DELETE /controledeassistenciatecnica/:id apaga de verdade', async () => {
    const equipamento = await prismaClient.equipamento.create({ data: { name: 'Notebook', patrimonio: 'DEL-001' } })
    const tecnico = await prismaClient.tecnico.create({ data: { name: 'Téc' } })
    const status = await prismaClient.statusReparo.create({ data: { name: 'ABERTO' } })
    const registro = await prismaClient.controleDeAssistenciaTecnica.create({
      data: {
        name: 'Assistência a apagar', mesAno: new Date(), idChamado: '1', assistencia: 'X',
        observacoes: 'obs', osDaAssistencia: 'os1', dataDeRetirada: new Date(),
        equipamento: { connect: { id: equipamento.id } },
        tecnico: { connect: { id: tecnico.id } },
        statusReparo: { connect: { id: status.id } },
      },
    })
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-del-assist@teste.com' })

    const response = await supertest(app)
      .delete(`/controledeassistenciatecnica/${registro.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(await prismaClient.controleDeAssistenciaTecnica.findUnique({ where: { id: registro.id } })).toBeNull()
  })

  it('DELETE /deletecontroledelaudotecnico/:id apaga de verdade', async () => {
    const equipamento = await prismaClient.equipamento.create({ data: { name: 'Impressora', patrimonio: 'DEL-002' } })
    const tecnico = await prismaClient.tecnico.create({ data: { name: 'Téc' } })
    const instituicao = await prismaClient.instituicaoUnidade.create({ data: { name: 'Unidade', endereco: 'Rua A' } })
    const registro = await prismaClient.controleDeLaudoTecnico.create({
      data: {
        descricaodoProblema: 'Não liga', mesAno: new Date(), osLab: 'os1',
        equipamento: { connect: { id: equipamento.id } },
        tecnico: { connect: { id: tecnico.id } },
        instituicaoUnidade: { connect: { id: instituicao.id } },
      },
    })
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-del-laudo@teste.com' })

    const response = await supertest(app)
      .delete(`/deletecontroledelaudotecnico/${registro.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(await prismaClient.controleDeLaudoTecnico.findUnique({ where: { id: registro.id } })).toBeNull()
  })

  it('DELETE /deletecontroledelaboratorio/:id apaga de verdade', async () => {
    const status = await prismaClient.statusControledeLaboratorio.create({ data: { name: 'EM ANALISE' } })
    const registro = await prismaClient.controleDeLaboratorio.create({
      data: {
        nomedoEquipamento: 'Bomba', marca: 'X', defeito: 'Y', osDeAbertura: '1', osDeDevolucao: '1',
        data_de_Chegada: new Date(), data_de_Finalizacao: new Date(),
        statusControledeLaboratorio: { connect: { id: status.id } },
      },
    })
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-del-lab@teste.com' })

    const response = await supertest(app)
      .delete(`/deletecontroledelaboratorio/${registro.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(await prismaClient.controleDeLaboratorio.findUnique({ where: { id: registro.id } })).toBeNull()
  })

  it('DELETE /deletecontroledemaquinaspendenteslab/:id apaga de verdade', async () => {
    const equipamento = await prismaClient.equipamento.create({ data: { name: 'PC', patrimonio: 'DEL-003' } })
    const status = await prismaClient.statusMaquinasPendentesLab.create({ data: { name: 'PENDENTE' } })
    const registro = await prismaClient.controleDeMaquinasPendentesLaboratorio.create({
      data: {
        numeroDeSerie: 'SN1', ssd: '500GB', idDaOs: '1', obs: 'obs',
        equipamento: { connect: { id: equipamento.id } },
        statusMaquinasPendentesLab: { connect: { id: status.id } },
      },
    })
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-del-pendlab@teste.com' })

    const response = await supertest(app)
      .delete(`/deletecontroledemaquinaspendenteslab/${registro.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(
      await prismaClient.controleDeMaquinasPendentesLaboratorio.findUnique({ where: { id: registro.id } })
    ).toBeNull()
  })

  it('DELETE /deletecontroledemaquinaspendentesoro/:id apaga de verdade', async () => {
    const equipamento = await prismaClient.equipamento.create({ data: { name: 'PC', patrimonio: 'DEL-004' } })
    const instituicao = await prismaClient.instituicaoUnidade.create({ data: { name: 'Unidade Oro', endereco: 'Rua B' } })
    const status = await prismaClient.statusMaquinasPendentesOro.create({ data: { name: 'INSTALADO' } })
    const registro = await prismaClient.controledeMaquinasPendentesOro.create({
      data: {
        datadaInstalacao: new Date(), osInstalacao: '1', osRetirada: '1',
        equipamento: { connect: { id: equipamento.id } },
        instituicaoUnidade: { connect: { id: instituicao.id } },
        statusMaquinasPendentesOro: { connect: { id: status.id } },
      },
    })
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-del-pendoro@teste.com' })

    const response = await supertest(app)
      .delete(`/deletecontroledemaquinaspendentesoro/${registro.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(await prismaClient.controledeMaquinasPendentesOro.findUnique({ where: { id: registro.id } })).toBeNull()
  })

  it('DELETE /deletedocumentacaotecnica/:id apaga de verdade', async () => {
    const tecnico = await prismaClient.tecnico.create({ data: { name: 'Téc' } })
    const registro = await prismaClient.documentacaoTecnica.create({
      data: { titulo: 'Manual', descricao: 'desc', tecnico: { connect: { id: tecnico.id } } },
    })
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-del-doc@teste.com' })

    const response = await supertest(app)
      .delete(`/deletedocumentacaotecnica/${registro.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(await prismaClient.documentacaoTecnica.findUnique({ where: { id: registro.id } })).toBeNull()
  })

  it('DELETE /deletedesolicitacaodecompras/:id apaga de verdade', async () => {
    const status = await prismaClient.statusCompras.create({ data: { name: 'SOLICITADO' } })
    const registro = await prismaClient.solicitacaoDeCompras.create({
      data: {
        itemSolicitado: 'Mouse', solicitante: 'Fulano', motivoDaSolicitacao: 'quebrado',
        preco: 50, linkDeCompra: 'http://x.com',
        statusCompras: { connect: { id: status.id } },
      },
    })
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-del-compras@teste.com' })

    const response = await supertest(app)
      .delete(`/deletedesolicitacaodecompras/${registro.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(await prismaClient.solicitacaoDeCompras.findUnique({ where: { id: registro.id } })).toBeNull()
  })

  it('devolve 404 ao apagar um id inexistente (P2025 -> errorHandler)', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-del-404@teste.com' })

    const response = await supertest(app)
      .delete(`/deletedocumentacaotecnica/${randomUUID()}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
  })

  it('devolve 401 sem token', async () => {
    const response = await supertest(app).delete(`/deletedesolicitacaodecompras/${randomUUID()}`)
    expect(response.status).toBe(401)
  })
})
