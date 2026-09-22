import { Router} from "express";
import uploadConfig from './config/multer';

import {CreateUserController} from './controllers/user/CreateUserController'
import { AuthUserController } from "./controllers/user/AuthUserController";
import { DetailUserController } from "./controllers/user/DetailUserController";
import { isAuthenticated } from "./Middleware/isAuthenticated";
import { can } from "./Middleware/can";
import { authorizeOrdemdeServico } from "./Middleware/authorizeOrdemdeServico";
import { authorizeOwnership } from "./Middleware/authorizeOwnership";
import prismaClient from "./prisma";
import { validate } from "./Middleware/validate";
import { createOrdemdeServicoSchema, idParamSchema, updateOrdemdeServicoSchema, listByStatusQuerySchema, listByTecnicoQuerySchema, atualizarTempoSchema, ordemIdParamSchema, assinaturaSchema } from "./schemas/ordemdeServico.schema";
import { controleIdQuerySchema } from "./schemas/common.schema";
import { createUserSchema, updateUserSchema, authUserSchema } from "./schemas/user.schema";
import { createAssistenciaTecnicaSchema, updateAssistenciaTecnicaSchema } from "./schemas/assistenciaTecnica.schema";
import { createLaudoTecnicoSchema, updateLaudoTecnicoSchema } from "./schemas/laudoTecnico.schema";
import { createDocumentacaoTecnicaSchema, updateDocumentacaoTecnicaSchema } from "./schemas/documentacaoTecnica.schema";
import { createEstabilizadoresSchema, updateEstabilizadoresSchema } from "./schemas/estabilizadores.schema";
import { createLaboratorioSchema, updateLaboratorioSchema } from "./schemas/laboratorio.schema";
import { createMaquinasPendentesLabSchema, updateMaquinasPendentesLabSchema } from "./schemas/maquinasPendentesLab.schema";
import { createMaquinasPendentesOroSchema, updateMaquinasPendentesOroSchema } from "./schemas/maquinasPendentesOro.schema";
import { createSolicitacaoComprasSchema, updateSolicitacaoComprasSchema, detailComprasQuerySchema } from "./schemas/solicitacaoCompras.schema";
import { createEquipamentoSchema, updateEquipamentoSchema } from "./schemas/equipamento.schema";
import { createInformacoesSetorSchema, updateInformacoesSetorSchema } from "./schemas/informacoesSetor.schema";
import { createLookupCategoriaSchema, deleteStatusOrdemdeServicoQuerySchema } from "./schemas/lookupCategoria.schema";
import { updateInstituicaoUnidadeSchema } from "./schemas/instituicaoUnidade.schema";
import { createClienteSchema, updateClienteSchema, detailClienteQuerySchema } from "./schemas/cliente.schema";
import { createSetorSchema, deleteSetorQuerySchema } from "./schemas/setor.schema";
import { createTecnicoSchema } from "./schemas/tecnico.schema";
import { createEquipamentoEstabilizadorSchema } from "./schemas/equipamentoEstabilizador.schema";
import { CreateClienteController } from "./controllers/status_categorias/cliente/CreateClienteController";
import { CreateSetorController } from "./controllers/status_categorias/setor/CreateSetorController";
import { ListClienteController } from "./controllers/status_categorias/cliente/ListClienteController";
import { RemoveClienteController } from "./controllers/status_categorias/cliente/RemoveClienteController";
import { UpdateClienteController } from "./controllers/status_categorias/cliente/UpdateClienteController";
import { ListSetoresController } from "./controllers/status_categorias/setor/ListSetoresController";
import { RemoveSetorController } from "./controllers/status_categorias/setor/RemoveSetorController";
import { CreateInstituicaoUnidadeController } from "./controllers/status_categorias/instituicaoUnidade/CreateInstituicaoUnidadeController";
import { ListInstituicaoUnidadeController } from "./controllers/status_categorias/instituicaoUnidade/ListInstituicaoUnidadeController";
import { RemoveInstituicaoUnidadeController } from "./controllers/status_categorias/instituicaoUnidade/RemoveInstituicaoUnidadeController";
import { UpdateInstituicaoUnidadeController } from "./controllers/status_categorias/instituicaoUnidade/UpdateInstituicaoUnidadeController";
import { CreateStatusOrdemdeServicoController } from "./controllers/status_categorias/statusOrdemdeServico/CreateStatusOrdemdeServicoController";
import { ListStatusOrdemdeServicoController } from "./controllers/status_categorias/statusOrdemdeServico/ListStatusOrdemdeServicoController";
import { RemoveStatusOrdemServicoController } from "./controllers/status_categorias/statusOrdemdeServico/RemoveStatusOrdemServicoController";
import { CreatetipodeChamadoController } from "./controllers/status_categorias/tipodeChamado/CreatetipodeChamadoController";
import { ListtipodeEquipamentoController } from "./controllers/status_categorias/tipodeEquipamento/ListtipodeEquipamentoController";
import { CreatetipodeEquipamentoController } from "./controllers/status_categorias/tipodeEquipamento/CreateTipodeEquipamentoController";
import { CreateTecnicoController } from "./controllers/status_categorias/tecnico/CreateTecnicoController";
import { ListTecnicoController } from "./controllers/status_categorias/tecnico/ListTecnicoController";
import { RemoveTecnicoController } from "./controllers/status_categorias/tecnico/RemoveTecnicoController";
import { CreateEquipamentoController } from "./controllers/status_categorias/equipamento/CreateEquipamentoController";
import { ListEquipamentoController } from "./controllers/status_categorias/equipamento/ListEquipamentoController";
import { RemoveEquipamentoController } from "./controllers/status_categorias/equipamento/RemoveEquipamentoController";
import { UpdateEquipamentoController } from "./controllers/status_categorias/equipamento/UpdateEquipamentoController";
import { CreatestatusMaquinasPendentesController } from "./controllers/status_categorias/statusMaquinasPendentesLab/CreatestatusMaquinasPendentesController";
import { ListMaquinasPendentesLabController } from "./controllers/status_categorias/statusMaquinasPendentesLab/ListMaquinasPendentesLabController";
import { ListMaquinasPendentesOroController } from "./controllers/status_categorias/statusMaquinasPendentesOro/ListstatusMaquinasPendentesOroController";
import { CreatestatusMaquinasPendentesOroController } from "./controllers/status_categorias/statusMaquinasPendentesOro/CreatestatusMaquinasPendentesOroController";
import { CreatestatusControlledeLaboratorioController } from "./controllers/status_categorias/statusControlledeLaboratorio/CreatestatusControlledeLaboratorioController";
import { ListstatusControlleLaboratioController } from "./controllers/status_categorias/statusControlledeLaboratorio/ListstatusControlledeLaboratioController";
import { CreateStatusComprasController } from "./controllers/status_categorias/statusCompras/CreateStatusComprasController";
import { ListStatusComprasController } from "./controllers/status_categorias/statusCompras/ListStatusComprasController";
import { CreateStatusReparoController } from "./controllers/status_categorias/statusReparo/CreateStatusReparoController";
import { ListstatusReparoController } from "./controllers/status_categorias/statusReparo/LitstatusReparoController";
import { CreateControledeAssistenciaTecnicaController } from "./controllers/controles_forms/ControledeAssistenciaTecnica/CreateControledeAssistenciaTecnicaController";
import { ListControledeAssistenciaTecnicaController } from "./controllers/controles_forms/ControledeAssistenciaTecnica/ListControledeAssistenciaTecnicaController";
import { CreateOrdemServicoController } from "./controllers/controles_forms/OrdemdeServico/CreateOrdemdeServicoController";
import { CreateStatusUrgenciaController } from "./controllers/status_categorias/statusUrgencia/CreateStatusUrgenciaController";
import { ListStatusUrgenciaController } from "./controllers/status_categorias/statusUrgencia/ListStatusUrgenciaController";
import { DeleteControledeAssistenciaTecnicaController } from "./controllers/controles_forms/ControledeAssistenciaTecnica/DeleteControledeAssistenciaTecnicaController";
import { CreateControledeLaudoTecnicoController } from "./controllers/controles_forms/ControledeLaudoTécnico/CreateControledeLaudoTécnicoController";
import { ListControledeLaudoTecnicoController } from "./controllers/controles_forms/ControledeLaudoTécnico/ListControledeLaudoTecnicoController";
import { DeleteControledeLaudoTecnicoController } from "./controllers/controles_forms/ControledeLaudoTécnico/DeleteControledeLaudoTecnicoController";
import { CreateControledeLaboratorioController } from "./controllers/controles_forms/ControledeLaboratorio/CreateControledeLaboratorioController";
import { ListControledeLaboratorioController } from "./controllers/controles_forms/ControledeLaboratorio/ListControledeLaboratorioController";
import { DeleteControledeLaboratorioController } from "./controllers/controles_forms/ControledeLaboratorio/DeleteControledeLaboratorioController";
import { CreateControledeMaquinasPendentesLabController } from "./controllers/controles_forms/ControledeMaquinasPendentesLab/CreateControledeMaquinasPendentesLabController";
import { ListControledeMaquinasPendentesLabController } from "./controllers/controles_forms/ControledeMaquinasPendentesLab/ListControledeMaquinasPendentesLabController";
import { DeleteControledeMaquinasPendentesLabController } from "./controllers/controles_forms/ControledeMaquinasPendentesLab/DeleteControledeMaquinasPendentesLabController";
import { CreateControledeMaquinasPendentesOroController } from "./controllers/controles_forms/ControledeMaquinasPendentesOro/CreateControledeMaquinasPendentesOroController";
import { ListControledeMaquinasPendentesOroController } from "./controllers/controles_forms/ControledeMaquinasPendentesOro/ListControledeMaquinasPendentesOroController";
import { DeleteControledeMaquinasPendentesOroController } from "./controllers/controles_forms/ControledeMaquinasPendentesOro/DeleteControledeMaquinasPendentesLabController";
import { CreateDocumentacaoTecnicaController } from "./controllers/controles_forms/DocumentacaoTecnica/CreateDocumentacaoTecnicaController";
import { ListDocumentacaoTecnicaController } from "./controllers/controles_forms/DocumentacaoTecnica/ListDocumentacaoTecnicaController";
import { DeleteDocumentacaoTecnicaController } from "./controllers/controles_forms/DocumentacaoTecnica/DeleteDocumentacaoTecnicaController";
import { CreateSolicitacaodeComprasController } from "./controllers/controles_forms/SolicitacaodeCompras/CreateSolicitacaodeComprasController";
import { ListSolicitacaodeComprasController } from "./controllers/controles_forms/SolicitacaodeCompras/ListSolicitacaodeComprasController";
import { DeleteSolicitacaodeComprasController } from "./controllers/controles_forms/SolicitacaodeCompras/DeleteSolicitacaodeComprasController";

import { DetailComprasController } from "./controllers/controles_forms/SolicitacaodeCompras/DetailSolicitacaodeComprasController";
import { DetailAssistenciaTecnicaController } from "./controllers/controles_forms/ControledeAssistenciaTecnica/DetailControledeAssistenciaTecnicaController";
import { ListUserController } from "./controllers/user/ListUserController";
import { UpdateUserController } from "./controllers/user/UpdateUserController";
import { DetailLaudoTenicoController } from "./controllers/controles_forms/ControledeLaudoTécnico/DetailControledeLaudoTenicoController";
import { DetailControledeLaboratorioController } from "./controllers/controles_forms/ControledeLaboratorio/DetailControledeLaboratorioController";
import { DetailMaquinasPendentesLabController } from "./controllers/controles_forms/ControledeMaquinasPendentesLab/DetailMaquinasPendentesLabController";
import { DetailControledeMaquinasPendentesOroController } from "./controllers/controles_forms/ControledeMaquinasPendentesOro/DetailControledeMaquinasPendentesOroController";
import { DetailDocumentacaoTecnicaController } from "./controllers/controles_forms/DocumentacaoTecnica/DetailDocumentacaoTecnicaController";
import { DetailClienteController } from "./controllers/status_categorias/cliente/DetailClienteController";
import { UpdateSolicitacaodeComprasController } from "./controllers/controles_forms/SolicitacaodeCompras/UpdateSolicitacaodeComprasController";
import { UpdateDocumentacaoTecnicaController } from "./controllers/controles_forms/DocumentacaoTecnica/UpdateDocumentacaoTecnicaController";
import { UpdateAssistenciaTecnicaController } from "./controllers/controles_forms/ControledeAssistenciaTecnica/UpdateControlledeAssistenciaTecnicaController";
import { UpdateControllerdeLaudoTecnicoController } from "./controllers/controles_forms/ControledeLaudoTécnico/UpdateControllerdeLaudoTecnicoController";
import { UpdateControledeLaboratorioController } from "./controllers/controles_forms/ControledeLaboratorio/UpdateControledeLaboratorioController";
import { UpdateControledeMaquinasPendentesLabController } from "./controllers/controles_forms/ControledeMaquinasPendentesLab/UpdateControledeMaquinasPendentesLabController";
import { UpdateControledeMaquinasPendentesOroController } from "./controllers/controles_forms/ControledeMaquinasPendentesOro/UpdateControledeMaquinasPendentesOroController";
import { ListOrdemdeServicoController } from "./controllers/controles_forms/OrdemdeServico/ListOrdemdeServicoController";
import { ListtipodeChamadoController } from "./controllers/status_categorias/tipodeChamado/ListtipodeChamadoController";
import { UpdateOrdemdeServicoController } from "./services/controles_forms/OrdemdeServico/UpdateOrdemdeServicoService";
import { EventosController } from "./controllers/Eventos/EventosControllers";
import { createEventoSchema, updateEventoSchema, eventoIdParamSchema } from "./schemas/evento.schema";
import multer from 'multer';

import { fotoController } from "./services/controles_forms/FotoOrdensTec/fotoController";
import { fotoSchema } from "./schemas/foto.schema";
import { ListByStatusTicketsController } from "./controllers/controles_forms/OrdemdeServico/ListByStatusTicketsController";
import { ListByTecnicosTicketsController } from "./controllers/controles_forms/OrdemdeServico/ListByTecnicosTicketsController";
import { CreateStatusEstabilizadoresController } from "./controllers/status_categorias/statusEstabilizadores/CreateStatusEstabilizadoresController";
import { ListStatusEstabilizadoresController } from "./controllers/status_categorias/statusEstabilizadores/ListStatusEstabilizadoresController";
import { CreateEquipamentoEstabilizadorController } from "./controllers/status_categorias/EquipamentoEstabilizador/CreateEquipamentoEstabilizadorController";
import { ListEsquipamentoEstabilizadorController } from "./controllers/status_categorias/EquipamentoEstabilizador/ListEquipamentoEstabilizadorController";
import { CreateControledeEstabilizadoresController } from "./controllers/controles_forms/ControledeEstabilizadores/CreateControledeEstabilizadoresController";
import { ListControledeEstabilizadoresController } from "./controllers/controles_forms/ControledeEstabilizadores/ListControledeEstabilizadoresController";
import { UpdateControledeEstabilizadoresController } from "./controllers/controles_forms/ControledeEstabilizadores/UpdateControledeEstabilizadoresController";
import { CreatetipodeInstituicaoUnidadeController } from "./controllers/status_categorias/tipodeInsituicaoUnidade/CreatetipodeInstituicaoUnidadeController";
import { ListtipoInsituicaoUnidadeController } from "./controllers/status_categorias/tipodeInsituicaoUnidade/ListtipoInsituicaoUnidadeController";
import { TimeOrdemdeServicoController } from "./controllers/controles_forms/OrdemdeServico/time/TimeOrdemdeServicoController";
import { AssinaturaController } from "./controllers/controles_forms/OrdemdeServico/assinatura/saveAssinatura";
import { CreateInformacoesSetorController } from "./controllers/status_categorias/setor/informacoessetor/CreateInformacoesSetorController";
import { ListInformacaoesSetoresController } from "./controllers/status_categorias/setor/informacoessetor/ListInformacoesSetorController";
import { UpdateInformacoesSetorController } from "./controllers/status_categorias/setor/informacoessetor/UpdateInformacoesSetorController";
import { GetOrdemdeServicoByIdController } from "./controllers/controles_forms/OrdemdeServico/ListByIdOrdemdeServicoController";
import { CreatetipodeOrdemdeServicoController } from "./controllers/status_categorias/tipodeOrdemdeServico/CreateTipodeOrdemdeServicoController";
import { ListtipodeOrdemdeServicoController } from "./controllers/status_categorias/tipodeOrdemdeServico/ListTipodeOrdemdeServicoController";
import { CreateStatusTarefaController } from "./controllers/status_categorias/tarefa/CreateStatusTarefaController";
import { ListStatusTarefaController } from "./controllers/status_categorias/tarefa/ListStatusTarefaController";
import { ListAtividadePadraoController } from "./controllers/status_categorias/Atividade/ListAtividadePadraoController";
import { ExportOrdemdeServicoController } from "./controllers/controles_forms/OrdemdeServico/ExportOrdemdeServicoController";
import { RelatorioSecretariaController } from "./controllers/controles_forms/OrdemdeServico/RelatorioSecretariaController";
import { AIChatController } from "./api/ai/chat/route";

// Dois roteadores: publicRouter não passa por isAuthenticated, privateRouter passa por TODOS.
// Ver estudos-pleno/ROADMAP-PLENO.md, item 1, para o raciocínio completo por trás dessa divisão.
const publicRouter = Router();
const privateRouter = Router();

//get,post, update, delete

//const upload = multer(uploadConfig.upload("./tmp"));

const upload = multer(uploadConfig.upload());

// ============================================================
// PUBLIC ROUTER — sem isAuthenticated.
// Só entra aqui rota comprovadamente usada por página pública
// (cadastro/login) ou lookup de referência sem PII e sem escrita
// de entidade de negócio.
// ============================================================

//1  - ROTAS DE LOGIN/CADASTRO DE USUÁRIO --
// Cadastro público: usado pelas páginas signup_instituicao e signup_empresa do Frontend
publicRouter.post('/users', validate(createUserSchema), new CreateUserController().handle)
// Login
publicRouter.post('/session', validate(authUserSchema), new AuthUserController().handle)

// Listas usadas pelas telas de signup público, sem PII de usuário
publicRouter.get('/listcliente', new ListClienteController().handle)
publicRouter.get('/listsetores', new ListSetoresController().handle)
publicRouter.get('/listinstuicao', new ListInstituicaoUnidadeController().handle)

// Lookups de referência (nomes de categoria, sem PII, sem mutação)
publicRouter.get('/listtipodeinstituicaounidade', new ListtipoInsituicaoUnidadeController().handle)
publicRouter.get('/listtipodechamado', new ListtipodeChamadoController().handle)
publicRouter.get('/listtipodeordemdeservico', new ListtipodeOrdemdeServicoController().handle)

// ============================================================
// PRIVATE ROUTER — isAuthenticated aplicado UMA vez aqui,
// vale pra tudo que vem depois desta linha. Não precisa mais
// repetir isAuthenticated rota por rota (era assim que a rota
// de listusers, foto e ai/chat tinham ficado públicas por
// esquecimento).
// ============================================================
privateRouter.use(isAuthenticated);

// ROTA DE IA (custa dinheiro por chamada — não pode ficar pública)
const aiChatController = new AIChatController();
privateRouter.post("/ai/chat", aiChatController.handle);

// Listar todos os usuários — expõe nome/e-mail/role de todo mundo, só ADMIN
privateRouter.get('/listusers', can(['ADMIN']), new ListUserController().handle)
privateRouter.get('/users/detail', new DetailUserController().handle)
// Achado 15/09: essa rota não tinha can() nem ownership nenhum — qualquer
// usuário autenticado trocava a senha/email/instituição de QUALQUER outro
// usuário, só sabendo o id. A tela que usa isso (EditUsuariosForm.tsx) é de
// gestão de usuários, só ADMIN deveria acessar — mesma regra de /listusers.
privateRouter.patch(
  '/user/update/:id',
  can(['ADMIN']),
  validate(idParamSchema, 'params'),
  validate(updateUserSchema),
  new UpdateUserController().handle
)

//---> CATEGORIAS <---

//2 - CRIAR,LISTAR E DELETAR CATEGORIAS
privateRouter.get('/liststatusprioridade', new ListStatusUrgenciaController().handle);
// 1 - Cliente
privateRouter.post('/categorycliente', validate(createClienteSchema), new CreateClienteController().handle)
// Achado no rollout: o Frontend já chama DELETE /deletecliente/:id (id no
// path), mas a rota não tinha :id nenhum — Express nunca casava, 404
// silencioso sempre que alguém tentava apagar um cliente.
privateRouter.delete('/deletecliente/:id', can(['ADMIN']), validate(idParamSchema, 'params'), new RemoveClienteController().handle)
privateRouter.get('/cliente/detail', validate(detailClienteQuerySchema, 'query'), new DetailClienteController().handle)
// Achado no rollout: o Frontend já chama PATCH /cliente/:id (EditClienteForm.tsx),
// mas essa rota nunca existiu — editar um cliente sempre devolveu 404. O
// controller/service já existiam prontos (UpdateClienteController/Service),
// só nunca tinham sido ligados.
privateRouter.patch('/cliente/:id', validate(idParamSchema, 'params'), validate(updateClienteSchema), new UpdateClienteController().handle)

// 2 - Setor
privateRouter.post('/categorysetor', validate(createSetorSchema), new CreateSetorController().handle)
privateRouter.delete('/deletesetor', can(['ADMIN']), validate(deleteSetorQuerySchema, 'query'), new RemoveSetorController().handle)

// - Informações Setor
privateRouter.post('/informacoessetor', validate(createInformacoesSetorSchema), new CreateInformacoesSetorController().handle)
privateRouter.patch(
  '/informacoessetor/:id',
  validate(idParamSchema, 'params'),
  validate(updateInformacoesSetorSchema),
  new UpdateInformacoesSetorController().handle
)
privateRouter.get('/listinformacoessetor', new ListInformacaoesSetoresController().handle)

//3 - Instuituicao/Unidade
privateRouter.post('/categoryintituicao', new CreateInstituicaoUnidadeController().handle)
privateRouter.delete('/deleteinstituicao', can(['ADMIN']), new RemoveInstituicaoUnidadeController().handle)
// Achado no rollout de status_categorias: esse controller existia (editar
// name/endereco/telefone/tipo de uma instituição), com lógica pronta, mas
// nunca teve rota nem uso no Frontend — decidido ligar mesmo assim (ver
// CHECKLIST-REFATORACAO-BACKEND.md) pra completar o CRUD do módulo, que já
// tinha Create/List/Remove. Mesmo nível de proteção do Remove (ADMIN).
privateRouter.patch(
  '/instituicaounidade/update/:id',
  can(['ADMIN']),
  validate(idParamSchema, 'params'),
  validate(updateInstituicaoUnidadeSchema),
  new UpdateInstituicaoUnidadeController().handle
)

// tipodeInstituicaoUnidade
privateRouter.post('/tipodeinstituicaounidade', validate(createLookupCategoriaSchema), new CreatetipodeInstituicaoUnidadeController().handle)

//4 - Tipo de Solicitação (Solicitação, Chamado Tecnico)
privateRouter.post('/tipodechamado', validate(createLookupCategoriaSchema), new CreatetipodeChamadoController().handle)

// Achado ao converter esse módulo pro padrão genérico: o Frontend já chama
// GET /list/tipo/equipamento (EditEquipamentoForm.tsx) pra popular o dropdown
// de "Tipo de Equipamento", mas essa rota nunca existiu aqui — 404 sempre,
// silenciado por um .catch() que já vinha com o comentário "404 provável na
// Vercel". O dropdown nunca mostrou nenhuma opção em produção. Adicionada
// agora com o path exato que o Frontend espera.
privateRouter.get('/list/tipo/equipamento', new ListtipodeEquipamentoController().handle)
// Achado no rollout anterior: controller já modernizado (Zod + Repository
// genérico), só sem rota — sem uso no Frontend hoje, mas decidido ligar
// mesmo assim pra fechar o CRUD do módulo (Create+List, igual aos outros
// 12 de lookup).
privateRouter.post('/tipodeequipamento', validate(createLookupCategoriaSchema), new CreatetipodeEquipamentoController().handle)

// 5 - Tecnico
privateRouter.post('/tecnico', validate(createTecnicoSchema), new CreateTecnicoController().handle)
privateRouter.get('/listtecnico', new ListTecnicoController().handle)
privateRouter.delete('/removertecnico/:id', can(['ADMIN']), validate(idParamSchema, 'params'), new RemoveTecnicoController().handle)

// 6 -  Equipamento
privateRouter.post('/equipamento', validate(createEquipamentoSchema), new CreateEquipamentoController().handle)
privateRouter.get('/listequipamento', new ListEquipamentoController().handle)
privateRouter.delete('/deleteequipamento/:id', validate(idParamSchema, 'params'), new RemoveEquipamentoController().handle)
privateRouter.patch(
  '/equipamento/:id',
  validate(idParamSchema, 'params'),
  validate(updateEquipamentoSchema),
  new UpdateEquipamentoController().handle
)


// 7 - StatusOrdemdeServicoService
privateRouter.post('/statusordemdeservico', validate(createLookupCategoriaSchema), new CreateStatusOrdemdeServicoController().handle)
privateRouter.get('/liststatusordemdeservico', new ListStatusOrdemdeServicoController().handle)
privateRouter.delete(
  '/removestatusordemdeservico',
  validate(deleteStatusOrdemdeServicoQuerySchema, 'query'),
  new RemoveStatusOrdemServicoController().handle
)

// 8 - StatusMaquinasPendentesLab (Pendentes ORO, Substituta)
privateRouter.post('/statusMaquinasPendentesLab', validate(createLookupCategoriaSchema), new CreatestatusMaquinasPendentesController().handle)

privateRouter.get('/liststatusMaquinasPendentesLab', new ListMaquinasPendentesLabController().handle)

// 9 - StatusMaquinasPendentesOro (DISPONIVEL, INSTALADA, AGUARDANDO RETIRADA, EM MANUTENÇÃO, RESERVADA, DESCARTADA)
privateRouter.post('/statusMaquinasPendentesOro', validate(createLookupCategoriaSchema), new CreatestatusMaquinasPendentesOroController().handle)
privateRouter.get('/liststatusMaquinasPendentesOro', new ListMaquinasPendentesOroController().handle);

// 10 - StatusControllerdeMaquinasLaboratorio (AGUARDANDO CONSERTO, AGUARDANDO O.S DE LABORATORIO, AGUARDANDO DEVOLUÇÃO, CONCLUIDO)
privateRouter.post('/statuscontrolledeLaboratorio', validate(createLookupCategoriaSchema), new CreatestatusControlledeLaboratorioController().handle)
privateRouter.get('/listcontrolledeLaboratorio', new ListstatusControlleLaboratioController().handle)

//12 - StatusCompras (AGUARDANDO, AGUARDANDO ENTREGA, COMPRA FINALIZADA)
privateRouter.post('/statuscompras', validate(createLookupCategoriaSchema), new CreateStatusComprasController().handle)
privateRouter.get('/liststatuscompras', new ListStatusComprasController().handle)

//13 - StatusReparo (AGUARDANDO REPARO, REPARO FINALIZADO)

privateRouter.post('/statusreparo', validate(createLookupCategoriaSchema), new CreateStatusReparoController().handle)
privateRouter.get('/liststatusreparo', new ListstatusReparoController().handle)

// - Atividade Padrao
privateRouter.get('/listatividade', new ListAtividadePadraoController().handle)

//14 - Urgência
privateRouter.post('/statusurgencia', validate(createLookupCategoriaSchema), new CreateStatusUrgenciaController().handle)
privateRouter.get('/liststatusurgencia', new ListStatusUrgenciaController().handle)

//---> FORMULARIOS <---

//CONTROLE DE ASSISTENCIA TÉCNICA
privateRouter.post('/controledeassistenciatecnica', validate(createAssistenciaTecnicaSchema), new CreateControledeAssistenciaTecnicaController().handle)
privateRouter.get('/listcontroledeassistenciatecnica', new ListControledeAssistenciaTecnicaController().handle);
privateRouter.delete('/controledeassistenciatecnica/:id', validate(idParamSchema, 'params'), new DeleteControledeAssistenciaTecnicaController().handle);
privateRouter.get('/controledeassistenciatecnica/detail', validate(controleIdQuerySchema, 'query'), new DetailAssistenciaTecnicaController().handle)
privateRouter.patch(
  '/assistenciatecnica/update/:id',
  validate(idParamSchema, 'params'),
  authorizeOwnership(
    "ControleDeAssistenciaTecnica",
    "update",
    (id) => prismaClient.controleDeAssistenciaTecnica.findUnique({ where: { id }, select: { id: true, tecnico_id: true } }),
    "Controle de assistência técnica não encontrado."
  ),
  validate(updateAssistenciaTecnicaSchema),
  new UpdateAssistenciaTecnicaController().handle
)
// CRIAR UPDATE - PACTH

//CONTROLE DE LAUDO TÉCNICO
privateRouter.post('/controledelaudotecnico', validate(createLaudoTecnicoSchema), new CreateControledeLaudoTecnicoController().handle)
privateRouter.get('/listcontroledelaudotecnico', new ListControledeLaudoTecnicoController().handle)
privateRouter.delete('/deletecontroledelaudotecnico/:id', validate(idParamSchema, 'params'), new DeleteControledeLaudoTecnicoController().handle);
privateRouter.get('/controledelaudotecnico/detail', validate(controleIdQuerySchema, 'query'), new DetailLaudoTenicoController().handle)
privateRouter.patch(
  '/laudotecnico/update/:id',
  validate(idParamSchema, 'params'),
  authorizeOwnership(
    "ControleDeLaudoTecnico",
    "update",
    (id) => prismaClient.controleDeLaudoTecnico.findUnique({ where: { id }, select: { id: true, tecnico_id: true } }),
    "Controle de laudo técnico não encontrado."
  ),
  validate(updateLaudoTecnicoSchema),
  new UpdateControllerdeLaudoTecnicoController().handle
)
//CRIAR UPDATE - PATCH

//CONTROLE DE LABORATORIO
privateRouter.post('/controledelaboratorio', validate(createLaboratorioSchema), new CreateControledeLaboratorioController().handle)
privateRouter.get('/listcontroledelaboratorio', new ListControledeLaboratorioController().handle)
privateRouter.delete('/deletecontroledelaboratorio/:id', validate(idParamSchema, 'params'), new DeleteControledeLaboratorioController().handle)
privateRouter.get('/controledelaboratorio/detail', validate(controleIdQuerySchema, 'query'), new DetailControledeLaboratorioController().handle)
privateRouter.patch('/controledelaboratorio/update/:id', validate(idParamSchema, 'params'), validate(updateLaboratorioSchema), new UpdateControledeLaboratorioController().handle)
//CRIAR UPDATE - PATCH

//CONTROLE DE MAQUINAS PENDENTES LAB
privateRouter.post('/controledemaquinaspendenteslab', validate(createMaquinasPendentesLabSchema), new CreateControledeMaquinasPendentesLabController().handle)
privateRouter.get('/listcontroledemaquinaspendenteslab', new ListControledeMaquinasPendentesLabController().handle)
privateRouter.delete('/deletecontroledemaquinaspendenteslab/:id', validate(idParamSchema, 'params'), new DeleteControledeMaquinasPendentesLabController().handle)
privateRouter.get('/controledemaquinaspendenteslab/detail', validate(controleIdQuerySchema, 'query'), new DetailMaquinasPendentesLabController().handle)
privateRouter.patch('/controledemaquinaspendenteslab/update/:id', validate(idParamSchema, 'params'), validate(updateMaquinasPendentesLabSchema), new UpdateControledeMaquinasPendentesLabController().handle)
//CRIAR UPDATE - PACTH

// CONTROLE DE MAQUINAS PENDENTES ORO
privateRouter.post('/controledemaquinaspendentesoro', validate(createMaquinasPendentesOroSchema), new CreateControledeMaquinasPendentesOroController().handle)
privateRouter.get('/listcontroledemaquinaspendentesoro', new ListControledeMaquinasPendentesOroController().handle)
privateRouter.delete('/deletecontroledemaquinaspendentesoro/:id', validate(idParamSchema, 'params'), new DeleteControledeMaquinasPendentesOroController().handle)
privateRouter.get('/controledemaquinaspendentesoro/detail', validate(controleIdQuerySchema, 'query'), new DetailControledeMaquinasPendentesOroController().handle)
privateRouter.patch('/controledemaquinaspendentesoro/update/:id', validate(idParamSchema, 'params'), validate(updateMaquinasPendentesOroSchema), new UpdateControledeMaquinasPendentesOroController().handle)
// CRIAR UPDATE - PACTH

//DOCUMENTAÇÃO TÉCNICA
privateRouter.post('/documentacaotecnica', validate(createDocumentacaoTecnicaSchema), new CreateDocumentacaoTecnicaController().handle)
privateRouter.get('/listdocumentacaotecnica', new ListDocumentacaoTecnicaController().handle)
privateRouter.delete('/deletedocumentacaotecnica/:id', validate(idParamSchema, 'params'), new DeleteDocumentacaoTecnicaController().handle)
privateRouter.get('/controlededocumentacaotecnica/detail', validate(controleIdQuerySchema, 'query'), new DetailDocumentacaoTecnicaController().handle)
privateRouter.patch(
  '/documentacaotecnica/update/:id',
  validate(idParamSchema, 'params'),
  authorizeOwnership(
    "DocumentacaoTecnica",
    "update",
    (id) => prismaClient.documentacaoTecnica.findUnique({ where: { id }, select: { id: true, tecnico_id: true } }),
    "Documentação técnica não encontrada."
  ),
  validate(updateDocumentacaoTecnicaSchema),
  new UpdateDocumentacaoTecnicaController().handle
)

//SOLICITACAO DE COMPRAS
privateRouter.post('/solicitacaodecompras', validate(createSolicitacaoComprasSchema), new CreateSolicitacaodeComprasController().handle)
privateRouter.get('/listsolicitacaodecompras', new ListSolicitacaodeComprasController().handle)
privateRouter.delete('/deletedesolicitacaodecompras/:id', validate(idParamSchema, 'params'), new DeleteSolicitacaodeComprasController().handle)
privateRouter.get('/compra/detail', validate(detailComprasQuerySchema, 'query'), new DetailComprasController().handle)
privateRouter.patch('/compra/update/:id', validate(idParamSchema, 'params'), validate(updateSolicitacaoComprasSchema), new UpdateSolicitacaodeComprasController().handle)

// - CONTINUAR DEPOIS
//ORDEM DE SERVIÇO
privateRouter.post(
  '/ordemdeservico',
  validate(createOrdemdeServicoSchema),
  new CreateOrdemServicoController().handle
)
privateRouter.get('/listordemdeservico', new ListOrdemdeServicoController().handle)
privateRouter.get(
  '/ordemdeservico/:id',
  validate(idParamSchema, 'params'),
  authorizeOrdemdeServico('read'),
  new GetOrdemdeServicoByIdController().handle
)

privateRouter.patch(
  '/ordemdeservico/update/:id',
  validate(idParamSchema, 'params'),
  authorizeOrdemdeServico('update'),
  upload.array('files'),
  validate(updateOrdemdeServicoSchema),
  new UpdateOrdemdeServicoController().handle
);
const fotoControllerInstance = new fotoController();
privateRouter.get('/foto/:id', validate(idParamSchema, 'params'), fotoControllerInstance.listByOrdem);
privateRouter.post('/foto', validate(fotoSchema), fotoControllerInstance.handle);
privateRouter.delete('/foto/:id', validate(idParamSchema, 'params'), fotoControllerInstance.delete);

//STATUS ESTABILIZADORES
privateRouter.post("/status/estabilizadores", validate(createLookupCategoriaSchema), new CreateStatusEstabilizadoresController().handle);

privateRouter.get("/liststatus/estabilizadores", new ListStatusEstabilizadoresController().handle)

privateRouter.post('/statustarefa', validate(createLookupCategoriaSchema), new CreateStatusTarefaController().handle)
privateRouter.get("/liststatustarefa", new ListStatusTarefaController().handle)

//ESTABILIZADORES
privateRouter.post("/equipamento/esbilizadores", validate(createEquipamentoEstabilizadorSchema), new CreateEquipamentoEstabilizadorController().handle)
const listEstabilizadorController = new ListEsquipamentoEstabilizadorController();
privateRouter.get("/list/estabilizador", listEstabilizadorController.handle)
// Achado no rollout: FormularioControledeEstabilizadores.tsx chama
// /list/estabilizadores (plural) pra popular o dropdown de "qual
// estabilizador" ao registrar uma manutenção — rota nunca existiu (só a
// singular), e como vem dentro de um Promise.all, a falha silenciosa
// derrubava as 3 listas do formulário de uma vez (catch genérico no
// Frontend, sem nenhum aviso pro usuário). Mesmo Controller, só o alias.
privateRouter.get("/list/estabilizadores", listEstabilizadorController.handle)

//CONTROLE DE ESTABILIZADORES
privateRouter.post("/controledeestabilizadores", validate(createEstabilizadoresSchema), new CreateControledeEstabilizadoresController().handle)
privateRouter.get("/listcontroledeestabilizadores", new ListControledeEstabilizadoresController().handle)
privateRouter.patch("/update/controledeestabilizadores/:id", validate(idParamSchema, 'params'), validate(updateEstabilizadoresSchema), new UpdateControledeEstabilizadoresController().handle)

//ORDEM DE SERVIÇO POR STATUS
privateRouter.get('/statusordemdeServico/ordens', validate(listByStatusQuerySchema, 'query'), new ListByStatusTicketsController().handle)
privateRouter.get('/tecnicosordemdeServico/ordens', validate(listByTecnicoQuerySchema, 'query'), new ListByTecnicosTicketsController().handle)

//EVENTOS
const eventosController = new EventosController();
privateRouter.get("/events", eventosController.list);
privateRouter.post("/events", validate(createEventoSchema), eventosController.create);
privateRouter.put("/events", validate(updateEventoSchema), eventosController.update);
privateRouter.delete("/events/:id", validate(eventoIdParamSchema, 'params'), eventosController.delete);

// --- Controle de Tempo ---
const timeController = new TimeOrdemdeServicoController();
privateRouter.patch("/ordemdeservico/iniciar/:id", validate(idParamSchema, 'params'), timeController.iniciar);
privateRouter.patch("/ordemdeservico/concluir/:id", validate(idParamSchema, 'params'), timeController.concluir);
privateRouter.patch("/ordemdeservico/pausar/:id", validate(idParamSchema, 'params'), timeController.pausar);
privateRouter.patch("/ordemdeservico/retomar/:id", validate(idParamSchema, 'params'), timeController.retomar);
privateRouter.patch("/ordemdeservico/atualizar-tempo/:id", validate(idParamSchema, 'params'), validate(atualizarTempoSchema), timeController.atualizarTempo);
privateRouter.get("/ordemdeservico/tempo/:id", validate(idParamSchema, 'params'), timeController.lerTempo);

// ASSINATURA
const assinaturaController = new AssinaturaController();
privateRouter.patch(
  "/assinatura/:id",
  validate(idParamSchema, 'params'),
  validate(assinaturaSchema),
  assinaturaController.atualizar
);
privateRouter.get(
  "/assinatura/:ordemId",
  validate(ordemIdParamSchema, 'params'),
  assinaturaController.buscar
);

//TipodeOrdemdeServico
privateRouter.post("/tipodeordemdeservico", validate(createLookupCategoriaSchema), new CreatetipodeOrdemdeServicoController().handle)

//Excel
privateRouter.get('/ordens/exportar', (req, res) => new ExportOrdemdeServicoController().handle(req, res));
privateRouter.get('/ordens/relatorio-secretaria', (req, res) => new RelatorioSecretariaController().handle(req, res));

const router = Router();
router.use(publicRouter);
router.use(privateRouter);

export {router}
