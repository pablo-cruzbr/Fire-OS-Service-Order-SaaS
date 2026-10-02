import { describe, it, expect, beforeEach } from 'vitest'
import prismaClient from '../../prisma'
import { AssistenciaTecnicaRepository } from '../../repositories/AssistenciaTecnicaRepository'
import { LaudoTecnicoRepository } from '../../repositories/LaudoTecnicoRepository'
import { LaboratorioRepository } from '../../repositories/LaboratorioRepository'
import { MaquinasPendentesLabRepository } from '../../repositories/MaquinasPendentesLabRepository'
import { MaquinasPendentesOroRepository } from '../../repositories/MaquinasPendentesOroRepository'
import { DocumentacaoTecnicaRepository } from '../../repositories/DocumentacaoTecnicaRepository'
import { SolicitacaoComprasRepository } from '../../repositories/SolicitacaoComprasRepository'
import { EstabilizadoresRepository } from '../../repositories/EstabilizadoresRepository'
import { limparBanco } from './helpers'

// As 8 repositories dos módulos controles_forms têm o mesmo formato:
// findUnique/create/findMany com `include`, e um `countByStatusXName` que
// filtra por relação aninhada (ex.: `{ where: { statusReparo: { name } } }`).
// É exatamente esse tipo de filtro aninhado — fácil de digitar errado (nome
// de campo/relação trocado) e que um Prisma mockado nunca vai pegar, porque
// o mock simplesmente devolve o que o teste mandou — que vale a pena provar
// contra um Postgres de verdade. Um arquivo só para as 8, porque o contrato
// sendo testado é idêntico; volume de setup por módulo != sinal novo por
// módulo.
describe('Repositories de controles_forms (integração, Postgres real)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  it('AssistenciaTecnicaRepository: create+findUnique traz o include, countByStatusReparoName filtra pela relação de verdade', async () => {
    const equipamento = await prismaClient.equipamento.create({ data: { name: 'Notebook', patrimonio: '001' } })
    const tecnico = await prismaClient.tecnico.create({ data: { name: 'Téc' } })
    const statusAberto = await prismaClient.statusReparo.create({ data: { name: 'ABERTO' } })
    const statusFechado = await prismaClient.statusReparo.create({ data: { name: 'FECHADO' } })
    const repository = new AssistenciaTecnicaRepository()

    const criado = await repository.create({
      name: 'Assistência 1',
      mesAno: new Date(),
      idChamado: '1',
      assistencia: 'X',
      observacoes: 'obs',
      osDaAssistencia: 'os1',
      dataDeRetirada: new Date(),
      equipamento: { connect: { id: equipamento.id } },
      tecnico: { connect: { id: tecnico.id } },
      statusReparo: { connect: { id: statusAberto.id } },
    })
    expect((criado as any).statusReparo.name).toBe('ABERTO')

    await repository.create({
      name: 'Assistência 2',
      mesAno: new Date(),
      idChamado: '2',
      assistencia: 'X',
      observacoes: 'obs',
      osDaAssistencia: 'os2',
      dataDeRetirada: new Date(),
      equipamento: { connect: { id: equipamento.id } },
      tecnico: { connect: { id: tecnico.id } },
      statusReparo: { connect: { id: statusFechado.id } },
    })

    const encontrado = await repository.findUnique(criado.id)
    expect(encontrado?.statusReparo.name).toBe('ABERTO')
    expect(await repository.countByStatusReparoName('ABERTO')).toBe(1)
    expect(await repository.countByStatusReparoName('FECHADO')).toBe(1)
    expect(await repository.count()).toBe(2)
  })

  it('LaudoTecnicoRepository: create+findUnique via relação com Instituição/Equipamento/Técnico', async () => {
    const equipamento = await prismaClient.equipamento.create({ data: { name: 'Impressora', patrimonio: '002' } })
    const tecnico = await prismaClient.tecnico.create({ data: { name: 'Téc' } })
    const instituicao = await prismaClient.instituicaoUnidade.create({ data: { name: 'Unidade 1', endereco: 'Rua A' } })
    const repository = new LaudoTecnicoRepository()

    const criado = await repository.create({
      descricaodoProblema: 'Não liga',
      mesAno: new Date(),
      osLab: 'os1',
      equipamento: { connect: { id: equipamento.id } },
      tecnico: { connect: { id: tecnico.id } },
      instituicaoUnidade: { connect: { id: instituicao.id } },
    })

    const encontrado = await repository.findUnique(criado.id)
    expect(encontrado?.descricaodoProblema).toBe('Não liga')
    expect(await repository.findAll()).toHaveLength(1)
  })

  it('LaboratorioRepository: countByStatusName filtra por statusControledeLaboratorio de verdade', async () => {
    const statusA = await prismaClient.statusControledeLaboratorio.create({ data: { name: 'EM ANALISE' } })
    const statusB = await prismaClient.statusControledeLaboratorio.create({ data: { name: 'CONCLUIDO' } })
    const repository = new LaboratorioRepository()

    await repository.create({
      nomedoEquipamento: 'Bomba', marca: 'X', defeito: 'Y', osDeAbertura: '1', osDeDevolucao: '1',
      data_de_Chegada: new Date(), data_de_Finalizacao: new Date(),
      statusControledeLaboratorio: { connect: { id: statusA.id } },
    })
    await repository.create({
      nomedoEquipamento: 'Bomba 2', marca: 'X', defeito: 'Y', osDeAbertura: '2', osDeDevolucao: '2',
      data_de_Chegada: new Date(), data_de_Finalizacao: new Date(),
      statusControledeLaboratorio: { connect: { id: statusB.id } },
    })

    expect(await repository.countByStatusName('EM ANALISE')).toBe(1)
    expect(await repository.countByStatusName('CONCLUIDO')).toBe(1)
    expect(await repository.count()).toBe(2)
  })

  it('MaquinasPendentesLabRepository: countByStatusName filtra por statusMaquinasPendentesLab de verdade', async () => {
    const equipamento = await prismaClient.equipamento.create({ data: { name: 'PC', patrimonio: '003' } })
    const status = await prismaClient.statusMaquinasPendentesLab.create({ data: { name: 'PENDENTE' } })
    const repository = new MaquinasPendentesLabRepository()

    await repository.create({
      numeroDeSerie: 'SN1', ssd: '500GB', idDaOs: '1', obs: 'obs',
      equipamento: { connect: { id: equipamento.id } },
      statusMaquinasPendentesLab: { connect: { id: status.id } },
    })

    expect(await repository.countByStatusName('PENDENTE')).toBe(1)
    expect(await repository.countByStatusName('INEXISTENTE')).toBe(0)
  })

  it('MaquinasPendentesOroRepository: countByStatusName filtra por statusMaquinasPendentesOro de verdade', async () => {
    const equipamento = await prismaClient.equipamento.create({ data: { name: 'PC', patrimonio: '004' } })
    const instituicao = await prismaClient.instituicaoUnidade.create({ data: { name: 'Unidade 2', endereco: 'Rua B' } })
    const status = await prismaClient.statusMaquinasPendentesOro.create({ data: { name: 'INSTALADO' } })
    const repository = new MaquinasPendentesOroRepository()

    await repository.create({
      datadaInstalacao: new Date(), osInstalacao: '1', osRetirada: '1',
      equipamento: { connect: { id: equipamento.id } },
      instituicaoUnidade: { connect: { id: instituicao.id } },
      statusMaquinasPendentesOro: { connect: { id: status.id } },
    })

    expect(await repository.countByStatusName('INSTALADO')).toBe(1)
    expect(await repository.count()).toBe(1)
  })

  it('DocumentacaoTecnicaRepository: create+findUnique via relação com Técnico', async () => {
    const tecnico = await prismaClient.tecnico.create({ data: { name: 'Téc' } })
    const repository = new DocumentacaoTecnicaRepository()

    const criado = await repository.create({
      titulo: 'Manual', descricao: 'desc',
      tecnico: { connect: { id: tecnico.id } },
    })

    expect(await repository.findUnique(criado.id)).not.toBeNull()
    expect(await repository.findAll()).toHaveLength(1)
  })

  it('SolicitacaoComprasRepository: countByStatusComprasName filtra por statusCompras de verdade', async () => {
    const statusA = await prismaClient.statusCompras.create({ data: { name: 'SOLICITADO' } })
    const statusB = await prismaClient.statusCompras.create({ data: { name: 'APROVADO' } })
    const repository = new SolicitacaoComprasRepository()

    await repository.create({
      itemSolicitado: 'Mouse', solicitante: 'Fulano', motivoDaSolicitacao: 'quebrado',
      preco: 50, linkDeCompra: 'http://x.com',
      statusCompras: { connect: { id: statusA.id } },
    })
    await repository.create({
      itemSolicitado: 'Teclado', solicitante: 'Fulano', motivoDaSolicitacao: 'quebrado',
      preco: 100, linkDeCompra: 'http://x.com',
      statusCompras: { connect: { id: statusB.id } },
    })

    expect(await repository.countByStatusComprasName('SOLICITADO')).toBe(1)
    expect(await repository.countByStatusComprasName('APROVADO')).toBe(1)
  })

  it('EstabilizadoresRepository: countByStatusEstabilizadoresName filtra por statusEstabilizadores de verdade', async () => {
    const estabilizador = await prismaClient.estabilizadores.create({ data: { name: 'Estab 1', patrimonio: '005' } })
    const status = await prismaClient.statusEstabilizadores.create({ data: { name: 'EM MANUTENCAO' } })
    const repository = new EstabilizadoresRepository()

    await repository.create({
      idChamado: '1', observacoes: 'obs', osdaAssistencia: 'os1', datadeRetirada: '01/01/2026',
      datadeChegada: '02/01/2026', problema: 'não liga',
      estabilizadores: { connect: { id: estabilizador.id } },
      statusEstabilizadores: { connect: { id: status.id } },
    })

    expect(await repository.countByStatusEstabilizadoresName('EM MANUTENCAO')).toBe(1)
    expect(await repository.count()).toBe(1)
  })
})
