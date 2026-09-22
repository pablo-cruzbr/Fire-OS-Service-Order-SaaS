import { hash } from 'bcryptjs'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'

// Todos os arquivos de integração compartilham o MESMO Postgres efêmero (um
// container só, subido uma vez no globalSetup — ver vitest.integration.config.ts
// e o motivo de fileParallelism: false). Cada arquivo limpando só "suas"
// tabelas parecia seguro até o 3º/4º arquivo aparecer: sobra de um arquivo
// (ex.: uma OrdemdeServico criada em ordemDeServico.e2e.test.ts) quebrava o
// `user.deleteMany()` de outro arquivo por causa de FK. Centralizar a limpeza
// aqui, numa ordem FK-safe única (filhos antes dos pais), evita esse tipo de
// corrida entre arquivos — todo `beforeEach` deveria chamar só isto.
export async function limparBanco() {
  await prismaClient.ordemdeServico.deleteMany()
  await prismaClient.controleDeAssistenciaTecnica.deleteMany()
  await prismaClient.controleDeLaudoTecnico.deleteMany()
  await prismaClient.documentacaoTecnica.deleteMany()
  await prismaClient.controledeEstabilizadores.deleteMany()
  await prismaClient.controleDeLaboratorio.deleteMany()
  await prismaClient.controleDeMaquinasPendentesLaboratorio.deleteMany()
  await prismaClient.controledeMaquinasPendentesOro.deleteMany()
  await prismaClient.solicitacaoDeCompras.deleteMany()
  await prismaClient.informacoesSetor.deleteMany()
  await prismaClient.equipamento.deleteMany()
  await prismaClient.user.deleteMany()
  await prismaClient.tecnico.deleteMany()
  await prismaClient.instituicaoUnidade.deleteMany()
  await prismaClient.cliente.deleteMany()
  await prismaClient.setor.deleteMany()
  await prismaClient.tipodeChamado.deleteMany()
  await prismaClient.statusOrdemdeServico.deleteMany()
  await prismaClient.statusReparo.deleteMany()
  await prismaClient.statusEstabilizadores.deleteMany()
  await prismaClient.statusControledeLaboratorio.deleteMany()
  await prismaClient.statusMaquinasPendentesLab.deleteMany()
  await prismaClient.statusMaquinasPendentesOro.deleteMany()
  await prismaClient.statusCompras.deleteMany()
  await prismaClient.tipodeEquipamento.deleteMany()
  await prismaClient.tipodeInstituicaoUnidade.deleteMany()
  await prismaClient.estabilizadores.deleteMany()
}

// Compartilhado por todos os arquivos de integração/E2E que precisam de um
// usuário autenticado de verdade — evita duplicar o mesmo boilerplate de
// "cria no banco + loga via HTTP" em cada arquivo novo. Senha fixa de
// propósito: nenhum teste depende do valor em si, só de conseguir logar.
export async function criarUsuarioELogar(params: {
  role: 'ADMIN' | 'TECNICO' | 'USER'
  tecnico_id?: string | null
  email: string
}) {
  const passwordHash = await hash('senha123', 8)
  const user = await prismaClient.user.create({
    data: {
      name: 'Usuário Teste',
      email: params.email,
      password: passwordHash,
      role: params.role,
      tecnico_id: params.tecnico_id ?? null,
    },
  })

  const loginResponse = await supertest(app)
    .post('/session')
    .send({ email: params.email, password: 'senha123' })

  return { user, token: loginResponse.body.token as string }
}
