import { Router} from "express";
import uploadConfig from './config/multer';

import {CreateUserController} from './controllers/user/CreateUserController'
import { AuthUserController } from "./controllers/user/AuthUserController";
import { DetailUserController } from "./controllers/user/DetailUserController";
import { isAuthenticated } from "./Middleware/isAuthenticated";
import { can } from "./Middleware/can";
import { authorizeOrdemdeServico } from "./Middleware/authorizeOrdemdeServico";
import { CreateClienteController } from "./controllers/status_categorias/cliente/CreateClienteController";
import { CreateSetorController } from "./controllers/status_categorias/setor/CreateSetorController";
import { ListClienteController } from "./controllers/status_categorias/cliente/ListClienteController";
import { RemoveClienteController } from "./controllers/status_categorias/cliente/RemoveClienteController";
import { ListSetoresController } from "./controllers/status_categorias/setor/ListSetoresController";
import { RemoveSetorController } from "./controllers/status_categorias/setor/RemoveSetorController";
import { CreateInstituicaoUnidadeController } from "./controllers/status_categorias/instituicaoUnidade/CreateInstituicaoUnidadeController";
import { ListInstituicaoUnidadeController } from "./controllers/status_categorias/instituicaoUnidade/ListInstituicaoUnidadeController";
import { RemoveInstituicaoUnidadeController } from "./controllers/status_categorias/instituicaoUnidade/RemoveInstituicaoUnidadeController";
import { CreateStatusOrdemdeServicoController } from "./controllers/status_categorias/statusOrdemdeServico/CreateStatusOrdemdeServicoController";
import { ListStatusOrdemdeServicoController } from "./controllers/status_categorias/statusOrdemdeServico/ListStatusOrdemdeServicoController";
import { RemoveStatusOrdemServicoController } from "./controllers/status_categorias/statusOrdemdeServico/RemoveStatusOrdemServicoController";
import { CreatetipodeChamadoController } from "./controllers/status_categorias/tipodeChamado/CreatetipodeChamadoController";
import { ListtipodeChamadoService } from "./services/status_categorias/tipodeChamado/ListtipodeChamadoService";
import { CreateTecnicoController } from "./controllers/status_categorias/tecnico/CreateTecnicoController";
import { ListTecnicoController } from "./controllers/status_categorias/tecnico/ListTecnicoController";
import { RemoveTecnicoController } from "./controllers/status_categorias/tecnico/RemoveTecnicoController";
import { CreateEquipamentoController } from "./controllers/status_categorias/equipamento/CreateEquipamentoController";
import { ListEquipamentoController } from "./controllers/status_categorias/equipamento/ListEquipamentoController";
import { RemoveEquipamentoController } from "./controllers/status_categorias/equipamento/RemoveEquipamentoController";
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
import { UpdateOrdemdeServicoService } from "./services/controles_forms/OrdemdeServico/UpdateOrdemdeServicoService";
import { getEventsController, createEventController, updateEventController, deleteEventController } from "../src/controllers/Eventos/EventosControllers";
import multer from 'multer';

import { fotoController } from "./services/controles_forms/FotoOrdensTec/fotoController";
import { ListByStatusTicketsController } from "./controllers/controles_forms/OrdemdeServico/ListByStatusTicketsController";
import { ListByTecnicosTicketsController } from "./controllers/controles_forms/OrdemdeServico/ListByTecnicosTicketsController";
import { CreateStatusEstabilizadoresController } from "./controllers/status_categorias/statusEstabilizadores/CreateStatusEstabilizadoresController";
import { ListStatusEstabilizadoresController } from "./controllers/status_categorias/statusEstabilizadores/ListStatusEstabilizadoresController";
import { CreateEquipamentoEstabilizadorController } from "./controllers/status_categorias/EquipamentoEstabilizador/CreateEquipamentoEstabilizadorController";
import { ListEsquipamentoEstabilizadorController } from "./controllers/status_categorias/EquipamentoEstabilizador/ListEquipamentoEstabilizadorController";
import { CreateControledeEstabilizadoresController } from "./controllers/controles_forms/ControledeEstabilizadores/CreateControledeEstabilizadoresController";
import { ListControledeEstabilizadoresService } from "./services/controles_forms/ControledeEstabilizadores/ListControledeEstabilizadoresService";
import { ListControledeEstabilizadoresController } from "./controllers/controles_forms/ControledeEstabilizadores/ListControledeEstabilizadoresController";
import { UpdateControledeEstabilizadoresController } from "./controllers/controles_forms/ControledeEstabilizadores/UpdateControledeEstabilizadoresController";
import { CreatetipodeInstituicaoUnidadeController } from "./controllers/status_categorias/tipodeInsituicaoUnidade/CreatetipodeInstituicaoUnidadeController";
import { ListtipoInsituicaoUnidadeController } from "./controllers/status_categorias/tipodeInsituicaoUnidade/ListtipoInsituicaoUnidadeController";
import { TimeOrdemdeServicoController } from "./controllers/controles_forms/OrdemdeServico/time/TimeOrdemdeServicoController";
import { CreateAssinaturaController } from "./controllers/controles_forms/OrdemdeServico/assinatura/CreateAssinaturaController";
import { SaveAssinaturaController } from "./controllers/controles_forms/OrdemdeServico/assinatura/GetAssinaturaController";
import { AssinaturaController } from "./controllers/controles_forms/OrdemdeServico/assinatura/saveAssinatura";
import { CreateInformacoesSetorController } from "./controllers/status_categorias/setor/informacoessetor/CreateInformacoesSetorController";
import { ListInformacaoesSetoresController } from "./controllers/status_categorias/setor/informacoessetor/ListInformacoesSetorController";
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
// Ver ROADMAP-PLENO.md, item 1, para o raciocínio completo por trás dessa divisão.
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
publicRouter.post('/users', new CreateUserController().handle)
// Login
publicRouter.post('/session', new AuthUserController().handle)

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
privateRouter.patch('/user/update/:id', new UpdateUserController().handle)

//---> CATEGORIAS <---

//2 - CRIAR,LISTAR E DELETAR CATEGORIAS
privateRouter.get('/liststatusprioridade', new ListStatusUrgenciaController().handle);
// 1 - Cliente
privateRouter.post('/categorycliente', new CreateClienteController().handle)
privateRouter.delete('/deletecliente', can(['ADMIN']), new RemoveClienteController().handle)
privateRouter.get('/cliente/detail', new DetailClienteController().handle)

// 2 - Setor
privateRouter.post('/categorysetor', new CreateSetorController().handle)
privateRouter.delete('/deletesetor', can(['ADMIN']), new RemoveSetorController().handle)

// - Informações Setor
privateRouter.post('/informacoessetor', new CreateInformacoesSetorController().handle)
privateRouter.get('/listinformacoessetor', new ListInformacaoesSetoresController().handle)

//3 - Instuituicao/Unidade
privateRouter.post('/categoryintituicao', new CreateInstituicaoUnidadeController().handle)
privateRouter.delete('/deleteinstituicao', can(['ADMIN']), new RemoveInstituicaoUnidadeController().handle)

// tipodeInstituicaoUnidade
privateRouter.post('/tipodeinstituicaounidade', new CreatetipodeInstituicaoUnidadeController().handle)

//4 - Tipo de Solicitação (Solicitação, Chamado Tecnico)
privateRouter.post('/tipodechamado', new CreatetipodeChamadoController().handle)

// 5 - Tecnico
privateRouter.post('/tecnico', new CreateTecnicoController().handle)
privateRouter.get('/listtecnico', new ListTecnicoController().handle)
privateRouter.delete('/removertecnico/:id', can(['ADMIN']), new RemoveTecnicoController().handle)

// 6 -  Equipamento
privateRouter.post('/equipamento', new CreateEquipamentoController().handle)
privateRouter.get('/listequipamento', new ListEquipamentoController().handle)
privateRouter.delete('/deleteequipamento/:id', new RemoveEquipamentoController().handle)


// 7 - StatusOrdemdeServicoService
privateRouter.post('/statusordemdeservico', new CreateStatusOrdemdeServicoController().handle)
privateRouter.get('/liststatusordemdeservico', new ListStatusOrdemdeServicoController().handle)
privateRouter.delete('/removestatusordemdeservico', new RemoveStatusOrdemServicoController().handle)

// 8 - StatusMaquinasPendentesLab (Pendentes ORO, Substituta)
privateRouter.post('/statusMaquinasPendentesLab', new CreatestatusMaquinasPendentesController().handle)

privateRouter.get('/liststatusMaquinasPendentesLab', new ListMaquinasPendentesLabController().handle)

// 9 - StatusMaquinasPendentesOro (DISPONIVEL, INSTALADA, AGUARDANDO RETIRADA, EM MANUTENÇÃO, RESERVADA, DESCARTADA)
privateRouter.post('/statusMaquinasPendentesOro', new CreatestatusMaquinasPendentesOroController().handle)
privateRouter.get('/liststatusMaquinasPendentesOro', new ListMaquinasPendentesOroController().handle);

// 10 - StatusControllerdeMaquinasLaboratorio (AGUARDANDO CONSERTO, AGUARDANDO O.S DE LABORATORIO, AGUARDANDO DEVOLUÇÃO, CONCLUIDO)
privateRouter.post('/statuscontrolledeLaboratorio', new CreatestatusControlledeLaboratorioController().hadle)
privateRouter.get('/listcontrolledeLaboratorio', new ListstatusControlleLaboratioController().handle)

//12 - StatusCompras (AGUARDANDO, AGUARDANDO ENTREGA, COMPRA FINALIZADA)
privateRouter.post('/statuscompras', new CreateStatusComprasController().handle)
privateRouter.get('/liststatuscompras', new ListStatusComprasController().handle)

//13 - StatusReparo (AGUARDANDO REPARO, REPARO FINALIZADO)

privateRouter.post('/statusreparo', new CreateStatusReparoController().handle)
privateRouter.get('/liststatusreparo', new ListstatusReparoController().handle)

// - Atividade Padrao
privateRouter.get('/listatividade', new ListAtividadePadraoController().handle)

//14 - Urgência
privateRouter.post('/statusurgencia', new CreateStatusUrgenciaController().handle)
privateRouter.get('/liststatusurgencia', new ListStatusUrgenciaController().handle)

//---> FORMULARIOS <---

//CONTROLE DE ASSISTENCIA TÉCNICA
privateRouter.post('/controledeassistenciatecnica', new CreateControledeAssistenciaTecnicaController().handle)
privateRouter.get('/listcontroledeassistenciatecnica', new ListControledeAssistenciaTecnicaController().handle);
privateRouter.delete('/controledeassistenciatecnica/:id', new DeleteControledeAssistenciaTecnicaController().handle);
privateRouter.get('/controledeassistenciatecnica/detail', new DetailAssistenciaTecnicaController().handle)
privateRouter.patch('/assistenciatecnica/update/:id', new UpdateAssistenciaTecnicaController().handle)
// CRIAR UPDATE - PACTH

//CONTROLE DE LAUDO TÉCNICO
privateRouter.post('/controledelaudotecnico', new CreateControledeLaudoTecnicoController().handle)
privateRouter.get('/listcontroledelaudotecnico', new ListControledeLaudoTecnicoController().handle)
privateRouter.delete('/deletecontroledelaudotecnico/:id', new DeleteControledeLaudoTecnicoController().handle);
privateRouter.get('/controledelaudotecnico/detail', new DetailLaudoTenicoController().handle)
privateRouter.patch('/laudotecnico/update/:id', new UpdateControllerdeLaudoTecnicoController().handle)
//CRIAR UPDATE - PATCH

//CONTROLE DE LABORATORIO
privateRouter.post('/controledelaboratorio', new CreateControledeLaboratorioController().handle)
privateRouter.get('/listcontroledelaboratorio', new ListControledeLaboratorioController().handle)
privateRouter.delete('/deletecontroledelaboratorio/:id', new DeleteControledeLaboratorioController().handle)
privateRouter.get('/controledelaboratorio/detail', new DetailControledeLaboratorioController().handle)
privateRouter.patch('/controledelaboratorio/update/:id', new UpdateControledeLaboratorioController().handle)
//CRIAR UPDATE - PATCH

//CONTROLE DE MAQUINAS PENDENTES LAB
privateRouter.post('/controledemaquinaspendenteslab', new CreateControledeMaquinasPendentesLabController().handle)
privateRouter.get('/listcontroledemaquinaspendenteslab', new ListControledeMaquinasPendentesLabController().handle)
privateRouter.delete('/deletecontroledemaquinaspendenteslab/:id', new DeleteControledeMaquinasPendentesLabController().handle)
privateRouter.get('/controledemaquinaspendenteslab/detail', new DetailMaquinasPendentesLabController().handle)
privateRouter.patch('/controledemaquinaspendenteslab/update/:id', new UpdateControledeMaquinasPendentesLabController().handle)
//CRIAR UPDATE - PACTH

// CONTROLE DE MAQUINAS PENDENTES ORO
privateRouter.post('/controledemaquinaspendentesoro', new CreateControledeMaquinasPendentesOroController().handle)
privateRouter.get('/listcontroledemaquinaspendentesoro', new ListControledeMaquinasPendentesOroController().handle)
privateRouter.delete('/deletecontroledemaquinaspendentesoro/:id', new DeleteControledeMaquinasPendentesOroController().handle)
privateRouter.get('/controledemaquinaspendentesoro/detail', new DetailControledeMaquinasPendentesOroController().handle)
privateRouter.patch('/controledemaquinaspendentesoro/update/:id', new UpdateControledeMaquinasPendentesOroController().handle)
// CRIAR UPDATE - PACTH

//DOCUMENTAÇÃO TÉCNICA
privateRouter.post('/documentacaotecnica', new CreateDocumentacaoTecnicaController().handle)
privateRouter.get('/listdocumentacaotecnica', new ListDocumentacaoTecnicaController().handle)
privateRouter.delete('/deletedocumentacaotecnica/:id', new DeleteDocumentacaoTecnicaController().handle)
privateRouter.get('/controlededocumentacaotecnica/detail', new DetailDocumentacaoTecnicaController().handle)
privateRouter.patch('/documentacaotecnica/update/:id', new UpdateDocumentacaoTecnicaController().handle)

//SOLICITACAO DE COMPRAS
privateRouter.post('/solicitacaodecompras', new CreateSolicitacaodeComprasController().handle)
privateRouter.get('/listsolicitacaodecompras', new ListSolicitacaodeComprasController().handle)
privateRouter.delete('/deletedesolicitacaodecompras/:id', new DeleteSolicitacaodeComprasController().handle)
privateRouter.get('/compra/detail', new DetailComprasController().handle)
privateRouter.patch('/compra/update/:id', new UpdateSolicitacaodeComprasController().handle)

// - CONTINUAR DEPOIS
//ORDEM DE SERVIÇO
privateRouter.post('/ordemdeservico', new CreateOrdemServicoController().handle)
privateRouter.get('/listordemdeservico', new ListOrdemdeServicoController().handle)
privateRouter.get('/ordemdeservico/:id', authorizeOrdemdeServico('read'), new GetOrdemdeServicoByIdController().handle)

privateRouter.patch(
  '/ordemdeservico/update/:id',
  authorizeOrdemdeServico('update'),
  upload.array('files'),
  new UpdateOrdemdeServicoService().handle.bind(new UpdateOrdemdeServicoService())
);
const fotoControllerInstance = new fotoController();
privateRouter.get('/foto/:id', fotoControllerInstance.listByOrdem);
//router.post('/foto', upload.array('files'),  new fotoController().handle)
privateRouter.post('/foto', new fotoController().handle);
privateRouter.delete('/foto/:id', new fotoController().delete);

//STATUS ESTABILIZADORES
privateRouter.post("/status/estabilizadores", new CreateStatusEstabilizadoresController().handle);

privateRouter.get("/liststatus/estabilizadores", new ListStatusEstabilizadoresController().handle)

privateRouter.post('/statustarefa', new CreateStatusTarefaController().handle)
privateRouter.get("/liststatustarefa", new ListStatusTarefaController().handle)

//ESTABILIZADORES
privateRouter.post("/equipamento/esbilizadores", new CreateEquipamentoEstabilizadorController().handle)
privateRouter.get("/list/estabilizador", new ListEsquipamentoEstabilizadorController().handle)

//CONTROLE DE ESTABILIZADORES
privateRouter.post("/controledeestabilizadores", new CreateControledeEstabilizadoresController().handle)
privateRouter.get("/listcontroledeestabilizadores", new ListControledeEstabilizadoresController().handle)
privateRouter.patch("/update/controledeestabilizadores/:id", new UpdateControledeEstabilizadoresController().handle)

//ORDEM DE SERVIÇO POR STATUS
privateRouter.get('/statusordemdeServico/ordens', new ListByStatusTicketsController().handle)
privateRouter.get('/tecnicosordemdeServico/ordens', new ListByTecnicosTicketsController().handle)

//EVENTOS
privateRouter.get("/events", getEventsController);
privateRouter.post("/events", createEventController);
privateRouter.put("/events", updateEventController);
privateRouter.delete("/events/:id", deleteEventController);

// --- Controle de Tempo (Corrigido para usar a instância timeController) ---
const timeController = new TimeOrdemdeServicoController();
// --- Controle de Tempo (Corrigido para usar a instância timeController) ---
privateRouter.patch("/ordemdeservico/iniciar/:id", (req, res) => timeController.iniciar(req, res));
privateRouter.patch("/ordemdeservico/concluir/:id", (req, res) => timeController.concluir(req, res));
privateRouter.patch("/ordemdeservico/pausar/:id", (req, res) => timeController.pausar(req, res));
privateRouter.patch("/ordemdeservico/retomar/:id", (req, res) => timeController.retomar(req, res));
privateRouter.patch("/ordemdeservico/atualizar-tempo/:id", (req, res) => timeController.atualizarTempo(req, res));
privateRouter.get("/ordemdeservico/tempo/:id", (req, res) => timeController.lerTempo(req, res));

// ASSINATURA
privateRouter.patch("/assinatura/:id", AssinaturaController.atualizar);

// GET → buscar assinatura
privateRouter.get("/assinatura/:ordemId", AssinaturaController.buscar);

//TipodeOrdemdeServico
privateRouter.post("/tipodeordemdeservico", new CreatetipodeOrdemdeServicoController().handle)

//Excel
privateRouter.get('/ordens/exportar', (req, res) => new ExportOrdemdeServicoController().handle(req, res));
privateRouter.get('/ordens/relatorio-secretaria', (req, res) => new RelatorioSecretariaController().handle(req, res));

const router = Router();
router.use(publicRouter);
router.use(privateRouter);

export {router}
