/*
 * Fake API data for `npm run dev:mock`. Shapes mirror what each endpoint
 * returns (some wrap rows in `controles`, some return a bare array).
 * Never imported outside mock mode.
 */

const day = 24 * 60 * 60 * 1000;
const base = Date.UTC(2026, 8, 24, 13, 0, 0);
const ago = (days: number, hours = 0) => new Date(base - days * day - hours * 3_600_000).toISOString();
const dateOnly = (days: number) => `${new Date(base - days * day).toISOString().slice(0, 10)}T12:00:00.000Z`;
const id = (prefix: string, n: number) => `${prefix}-${String(n).padStart(4, "0")}`;
const pick = <T,>(list: T[], n: number) => list[n % list.length];

// ── lookups ────────────────────────────────────────────────────────────────
export const tiposInstituicao = [
  { id: "ti-1", name: "Escola Municipal" },
  { id: "ti-2", name: "Unidade de Saúde" },
  { id: "ti-3", name: "Secretaria" },
];

export const instituicoes = [
  "EMEF Monteiro Lobato",
  "UBS Jardim das Flores",
  "Secretaria de Educação",
  "EMEI Cecília Meireles",
  "CEU Parque Verde",
  "UBS Vila Nova",
  "Secretaria de Saúde",
  "EMEF Paulo Freire",
].map((name, n) => ({
  id: id("inst", n + 1),
  name,
  endereco: `Rua ${pick(["das Palmeiras", "XV de Novembro", "Sete de Setembro", "dos Andradas"], n)}, ${120 + n * 37}`,
  telefone: `(11) 4${String(3100 + n * 17).padStart(4, "0")}-${String(2000 + n * 91).slice(0, 4)}`,
  created_at: ago(200 - n * 9),
  tipodeinstituicaoUnidade: pick(tiposInstituicao, n),
}));

export const clientes = [
  "Construtora Horizonte Ltda",
  "Clínica Bem Estar",
  "Mercado São Jorge",
  "Escritório Almeida & Costa",
  "Padaria Pão Dourado",
].map((name, n) => ({
  id: id("cli", n + 1),
  name,
  endereco: `Av. ${pick(["Paulista", "Brasil", "Independência"], n)}, ${800 + n * 55}`,
  telefone: `(11) 9${String(8100 + n * 23)}-${String(4400 + n * 13)}`,
  cnpj: `${String(12 + n).padStart(2, "0")}.345.678/0001-${String(10 + n * 7).slice(0, 2)}`,
  created_at: ago(300 - n * 20),
}));

export const tecnicos = ["Carlos Souza", "Mariana Lima", "Rafael Pereira", "Juliana Rocha"].map((name, n) => ({
  id: id("tec", n + 1),
  name,
  created_at: ago(400 - n * 30),
}));

export const setores = ["Secretaria", "Diretoria", "Laboratório de Informática", "Recepção", "Farmácia", "Almoxarifado"].map(
  (name, n) => ({ id: id("set", n + 1), name }),
);

export const tiposEquipamento = [
  { id: "te-1", name: "Desktop" },
  { id: "te-2", name: "Notebook" },
  { id: "te-3", name: "Impressora" },
  { id: "te-4", name: "Estabilizador" },
];

export const equipamentos = Array.from({ length: 14 }, (_, n) => ({
  id: id("eq", n + 1),
  name: `${pick(["Dell OptiPlex 3080", "Lenovo ThinkPad E14", "HP LaserJet M428", "SMS Revolution 1500VA", "Positivo Master D580"], n)}`,
  patrimonio: `PAT-${20400 + n * 13}`,
  instituicaoUnidade: pick(instituicoes, n),
  tipodeEquipamento: pick(tiposEquipamento, n),
  created_at: ago(120 - n * 6),
}));

const statusOS = [
  { id: "sos-1", name: "ABERTA" },
  { id: "sos-2", name: "EM DESLOCAMENTO" },
  { id: "sos-3", name: "EM ANDAMENTO" },
  { id: "sos-4", name: "PAUSADA" },
  { id: "sos-5", name: "CONCLUIDA" },
];
const tiposOS = [
  { id: "tos-1", name: "Ticket" },
  { id: "tos-2", name: "Ordem de Serviço" },
];
const tiposChamado = [
  { id: "tc-1", name: "Manutenção corretiva" },
  { id: "tc-2", name: "Instalação" },
  { id: "tc-3", name: "Suporte remoto" },
];
const prioridades = [
  { id: "pri-1", name: "BAIXA" },
  { id: "pri-2", name: "MÉDIA" },
  { id: "pri-3", name: "ALTA" },
];
const tarefas = [
  { id: "tar-1", name: "Pendente" },
  { id: "tar-2", name: "Em execução" },
  { id: "tar-3", name: "Finalizada" },
];
const atividades = [
  { id: "at-1", descricao: "Formatação e reinstalação do sistema", categoria: "Software" },
  { id: "at-2", descricao: "Troca de fonte", categoria: "Hardware" },
  { id: "at-3", descricao: "Configuração de rede", categoria: "Rede" },
  { id: "at-4", descricao: "Instalação de impressora", categoria: "Periféricos" },
];

export const usuarios = Array.from({ length: 9 }, (_, n) => ({
  id: id("usr", n + 1),
  name: pick(["Ana Beatriz", "Bruno Martins", "Camila Duarte", "Diego Alves", "Eduarda Nunes", "Felipe Ramos"], n) + ` ${n + 1}`,
  email: `usuario${n + 1}@exemplo.gov.br`,
  created_at: ago(90 - n * 7),
  instituicaoUnidade: pick(instituicoes, n),
  cliente: pick(clientes, n),
  setor: pick(setores, n),
  tecnico: pick(tecnicos, n),
}));

export const informacoesSetor = Array.from({ length: 12 }, (_, n) => ({
  id: id("ram", n + 1),
  usuario: pick(["Sandra", "Roberto", "Luciana", "Marcos", "Patrícia", "Fábio"], n),
  ramal: String(2100 + n * 7),
  andar: `${(n % 4) + 1}º andar`,
  setor: pick(setores, n),
  instituicaoUnidade: n % 3 === 2 ? undefined : pick(instituicoes, n),
  cliente: n % 3 === 2 ? pick(clientes, n) : undefined,
}));

// ── ordens de serviço ──────────────────────────────────────────────────────
const problemas = [
  "Computador não liga após queda de energia.",
  "Impressora atolando papel constantemente.",
  "Sem acesso à internet na sala da diretoria.",
  "Instalação de novo notebook para a secretaria.",
  "Sistema lento e travando ao abrir o navegador.",
  "Estabilizador apitando e desligando sozinho.",
];

export const ordens = Array.from({ length: 23 }, (_, n) => {
  const status = pick(statusOS, n);
  const created = ago(n * 1.3, n * 3);
  const inst = pick(instituicoes, n);
  const user = pick(usuarios, n);
  const concluded = status.name === "CONCLUIDA";
  return {
    id: id("os", n + 1),
    name: pick(["Manutenção", "Instalação", "Suporte"], n),
    descricaodoProblemaouSolicitacao: pick(problemas, n),
    patrimoniodoequipamento: `PAT-${20400 + n * 13}`,
    nomedoContatoaserProcuradonoLocal: pick(["Sandra", "Roberto", "Luciana"], n),
    tipodeChamado_id: pick(tiposChamado, n).id,
    tipodeOrdemdeServico_id: pick(tiposOS, n).id,
    numeroOS: 48210 + n * 7,
    assinante: concluded ? pick(["Sandra Oliveira", "Roberto Dias"], n) : null,
    startedAt: status.name === "ABERTA" ? null : created,
    endedAt: concluded ? ago(n * 1.3 - 0.1) : null,
    duracao: concluded ? 45 + n * 5 : undefined,
    user_id: user.id,
    nameTecnico: pick(tecnicos, n).name,
    solucao: concluded ? "Equipamento testado e funcionando normalmente." : undefined,
    created_at: created,
    update_at: created,
    // half of the orders are scheduled over the next weeks (calendar/agenda views)
    agendadoEm: n % 2 === 0 ? new Date(base + (n / 2 - 2) * day + ((n * 5) % 8) * 3_600_000 - 4 * 3_600_000).toISOString() : null,
    fotos: [],
    cliente: n % 4 === 3 ? pick(clientes, n) : undefined,
    tarefa: pick(tarefas, n),
    equipamento: pick(equipamentos, n),
    tecnico: n % 5 === 0 ? undefined : pick(tecnicos, n),
    statusOrdemdeServico: status,
    tipodeChamado: pick(tiposChamado, n),
    tipodeOrdemdeServico: pick(tiposOS, n),
    atividades: [{ id: id("oa", n), atividadePadrao: pick(atividades, n) }],
    instituicaoUnidade: n % 4 === 3 ? undefined : inst,
    prioridade: pick(prioridades, n),
    user,
    informacoesSetor: pick(informacoesSetor, n),
  };
});

function countBy<T>(rows: T[], name: (row: T) => string | undefined, value: string) {
  return rows.filter((row) => name(row) === value).length;
}

const osStatus = (row: (typeof ordens)[number]) => row.statusOrdemdeServico.name;

export const listOrdemDeServico = {
  controles: ordens,
  total: ordens.length,
  totalAberta: countBy(ordens, osStatus, "ABERTA"),
  totalEmDeslocamento: countBy(ordens, osStatus, "EM DESLOCAMENTO"),
  totalEmAndamento: countBy(ordens, osStatus, "EM ANDAMENTO"),
  totalPausada: countBy(ordens, osStatus, "PAUSADA"),
  totalConcluida: countBy(ordens, osStatus, "CONCLUIDA"),
  totalTicket: ordens.filter((row) => row.tipodeOrdemdeServico.name === "Ticket").length,
  totalOrdemdeServico: ordens.filter((row) => row.tipodeOrdemdeServico.name !== "Ticket").length,
};

// ── controles ──────────────────────────────────────────────────────────────
const statusCompras = [
  { id: "sc-1", name: "AGUARDANDO COMPRA" },
  { id: "sc-2", name: "AGUARDANDO ENTREGA" },
  { id: "sc-3", name: "COMPRA FINALIZADA" },
];
const compras = Array.from({ length: 11 }, (_, n) => ({
  id: id("cmp", n + 1),
  itemSolicitado: pick(["SSD Kingston 480GB", "Memória DDR4 8GB", "Fonte ATX 500W", "Cabo de rede Cat6 (caixa)", "Toner HP 58A"], n),
  solicitante: pick(tecnicos, n).name,
  motivoDaSolicitacao: pick(["Reposição de estoque", "Upgrade de máquinas da secretaria", "Equipamento com defeito"], n),
  preco: String(89.9 + n * 37.5),
  linkDeCompra: "https://www.exemplo.com.br/produto",
  statusCompras: pick(statusCompras, n),
  created_at: ago(n * 2.5),
}));

const statusReparo = [
  { id: "sr-1", name: "AGUARDANDO REPARO" },
  { id: "sr-2", name: "FINALIZADO" },
];
const assistencias = Array.from({ length: 8 }, (_, n) => ({
  id: id("ast", n + 1),
  name: pick(["Notebook Lenovo", "Impressora HP", "Monitor LG"], n),
  mesAno: dateOnly(n * 20),
  idChamado: `CH-${7100 + n}`,
  assistencia: pick(["Lenovo Service", "HP Care", "LG Assistência"], n),
  observacoes: "Aguardando retorno da assistência autorizada.",
  osDaAssistencia: `AS-${5500 + n * 3}`,
  dataDeRetirada: dateOnly(n * 4),
  equipamento: pick(equipamentos, n),
  statusReparo: pick(statusReparo, n),
  instituicaoUnidade: pick(instituicoes, n),
  tecnico: pick(tecnicos, n),
  cliente: pick(clientes, n),
  created_at: ago(n * 4),
}));

const statusEstabilizadores = [
  { id: "se-1", name: "AGUARDANDO REPARO" },
  { id: "se-2", name: "FINALIZADO" },
];
const estabilizadoresLista = Array.from({ length: 5 }, (_, n) => ({
  id: id("est", n + 1),
  name: `SMS Revolution ${1000 + n * 250}VA`,
  patrimonio: `EST-${900 + n}`,
}));
const estabilizadores = Array.from({ length: 7 }, (_, n) => ({
  id: id("cest", n + 1),
  idChamado: `CH-${8100 + n}`,
  problema: pick(["Não liga", "Apitando", "Oscilação na saída"], n),
  observacoes: "Enviado para análise.",
  osdaAssistencia: `AE-${300 + n}`,
  datadeChegada: dateOnly(n * 6 + 3),
  datadeRetirada: dateOnly(n * 6),
  estabilizadores: pick(estabilizadoresLista, n),
  statusEstabilizadores: pick(statusEstabilizadores, n),
  instituicaoUnidade: pick(instituicoes, n),
  created_at: ago(n * 6),
}));

const statusLaboratorio = [
  { id: "sl-1", name: "AGUARDANDO CONSERTO" },
  { id: "sl-2", name: "AGUARDANDO DEVOLUÇÃO" },
  { id: "sl-3", name: "AGUARDANDO OS DE LABORATÓRIO" },
];
const laboratorio = Array.from({ length: 9 }, (_, n) => ({
  id: id("lab", n + 1),
  nomedoEquipamento: pick(["Desktop Positivo", "Notebook Dell", "Impressora Epson"], n),
  marca: pick(["Positivo", "Dell", "Epson"], n),
  defeito: pick(["Placa-mãe queimada", "Tela quebrada", "Cabeça de impressão entupida"], n),
  osDeAbertura: `OSA-${1200 + n}`,
  osDeDevolucao: n % 2 ? `OSD-${1300 + n}` : "",
  data_de_Chegada: dateOnly(n * 5 + 2),
  data_de_Finalizacao: dateOnly(n * 5),
  statusControledeLaboratorio: pick(statusLaboratorio, n),
  instituicaoUnidade: pick(instituicoes, n),
  cliente: pick(clientes, n),
  equipamento: pick(equipamentos, n),
  tecnico: pick(tecnicos, n),
  created_at: ago(n * 5),
}));

const laudos = Array.from({ length: 6 }, (_, n) => ({
  id: id("lau", n + 1),
  descricaodoProblema: pick(["Equipamento sem reparo viável.", "Dano por descarga elétrica.", "Desgaste natural de componentes."], n),
  mesAno: dateOnly(n * 30),
  osLab: `LAB-${400 + n}`,
  instituicaoUnidade: pick(instituicoes, n),
  equipamento: pick(equipamentos, n),
  tecnico: pick(tecnicos, n),
  created_at: ago(n * 30),
}));

const statusPendentesLab = [
  { id: "spl-1", name: "PENDENTE ORO" },
  { id: "spl-2", name: "SUBSTITUTA" },
];
const pendentesLab = Array.from({ length: 6 }, (_, n) => ({
  id: id("pl", n + 1),
  numeroDeSerie: `SN${880120 + n * 17}`,
  ssd: pick(["240GB", "480GB", "Sem SSD"], n),
  idDaOs: `OS-${48210 + n}`,
  obs: "Aguardando peça.",
  osLab: `LAB-${500 + n}`,
  statusMaquinasPendentesLab: pick(statusPendentesLab, n),
  instituicaoUnidade: pick(instituicoes, n),
  equipamento: pick(equipamentos, n),
  created_at: ago(n * 3),
}));

const statusPendentesOro = [
  { id: "spo-1", name: "AGUARDANDO RETIRADA" },
  { id: "spo-2", name: "DESCARTADA" },
  { id: "spo-3", name: "DISPONIVEL" },
  { id: "spo-4", name: "EM MANUTENÇÃO" },
  { id: "spo-5", name: "INSTALADA" },
];
const pendentesOro = Array.from({ length: 8 }, (_, n) => ({
  id: id("po", n + 1),
  datadaInstalacao: n % 3 ? dateOnly(n * 7) : null,
  osInstalacao: `OSI-${700 + n}`,
  osRetirada: `OSR-${800 + n}`,
  equipamento: pick(equipamentos, n),
  statusMaquinasPendentesOro: pick(statusPendentesOro, n),
  instituicaoUnidade: pick(instituicoes, n),
  created_at: ago(n * 7),
}));

const documentacao = Array.from({ length: 7 }, (_, n) => ({
  id: id("doc", n + 1),
  titulo: pick(["Configuração do servidor de arquivos", "Topologia da rede da UBS", "Procedimento de backup", "Senhas de impressoras (cofre)"], n),
  descricao: "Passo a passo documentado pela equipe técnica, com observações e contatos.",
  created_at: ago(n * 11),
  instituicaoUnidade: pick(instituicoes, n),
  cliente: pick(clientes, n),
  tecnico: pick(tecnicos, n),
}));

const withTotals = <T,>(rows: T[], status: (row: T) => string, totals: Record<string, string>) => ({
  controles: rows,
  total: rows.length,
  ...Object.fromEntries(Object.entries(totals).map(([key, name]) => [key, countBy(rows, status, name)])),
});

// ── routes ─────────────────────────────────────────────────────────────────
export const mockUser = {
  id: "usr-admin",
  name: "Pablo Cruz",
  email: "admin@fireos.dev",
  role: process.env.NEXT_PUBLIC_MOCK_ROLE ?? "ADMIN",
};

export const getRoutes: Record<string, unknown> = {
  "/users/detail": mockUser,
  "/listordemdeservico": listOrdemDeServico,
  "/listinstuicao": { instituicoes, total: instituicoes.length },
  "/listcliente": { controles: clientes, total: clientes.length },
  "/listtecnico": { controles: tecnicos, total: tecnicos.length },
  "/listequipamento": equipamentos,
  "/list/tipo/equipamento": tiposEquipamento,
  "/listsetores": setores,
  "/listinformacoessetor": informacoesSetor,
  "/listusers": { users: usuarios, total: usuarios.length },
  "/listtipodeinstituicaounidade": tiposInstituicao,
  "/liststatusordemdeservico": statusOS,
  "/listtipodeordemdeservico": tiposOS,
  "/listtipodechamado": tiposChamado,
  "/liststatusprioridade": prioridades,
  "/liststatustarefa": tarefas,
  "/listatividade": atividades,
  "/liststatuscompras": statusCompras,
  "/liststatusreparo": statusReparo,
  "/liststatus/estabilizadores": statusEstabilizadores,
  "/list/estabilizadores": estabilizadoresLista,
  "/list/estabilizador": estabilizadoresLista,
  "/listcontrolledeLaboratorio": statusLaboratorio,
  "/liststatusmaquinaspendenteslab": statusPendentesLab,
  "/liststatusMaquinasPendentesLab": statusPendentesLab,
  "/liststatusMaquinasPendentesOro": statusPendentesOro,
  "/listsolicitacaodecompras": withTotals(compras, (row) => row.statusCompras.name, {
    totalAguardandoCompra: "AGUARDANDO COMPRA",
    totalAguardandoEntrega: "AGUARDANDO ENTREGA",
    totalCompraFinalizada: "COMPRA FINALIZADA",
  }),
  "/listcontroledeassistenciatecnica": withTotals(assistencias, (row) => row.statusReparo.name, {
    totalAguardandoReparo: "AGUARDANDO REPARO",
    totalFinalizado: "FINALIZADO",
  }),
  "/listcontroledeestabilizadores": withTotals(estabilizadores, (row) => row.statusEstabilizadores.name, {
    totalAguardandoReparo: "AGUARDANDO REPARO",
    totalFinalizado: "FINALIZADO",
  }),
  "/listcontroledelaboratorio": withTotals(laboratorio, (row) => row.statusControledeLaboratorio.name, {
    totalAguardandoConserto: "AGUARDANDO CONSERTO",
    totalAguardandoDevolucao: "AGUARDANDO DEVOLUÇÃO",
    totalAguardandoOSdeLaboratorio: "AGUARDANDO OS DE LABORATÓRIO",
  }),
  "/listcontroledelaudotecnico": laudos,
  "/listcontroledemaquinaspendenteslab": withTotals(pendentesLab, (row) => row.statusMaquinasPendentesLab.name, {
    totalPendenteOro: "PENDENTE ORO",
    totalSubstituta: "SUBSTITUTA",
  }),
  "/listcontroledemaquinaspendentesoro": withTotals(pendentesOro, (row) => row.statusMaquinasPendentesOro.name, {
    totalAguardandoRetirada: "AGUARDANDO RETIRADA",
    totalDescartada: "DESCARTADA",
    totalDisponivel: "DISPONIVEL",
    totalEmManutencao: "EM MANUTENÇÃO",
    totalInstalada: "INSTALADA",
  }),
  "/listdocumentacaotecnica": documentacao,
};

/** Detail routes: `/ordemdeservico/:id`, `/foto/:id`... */
export function getDynamic(path: string): unknown {
  const match = path.match(/^\/(ordemdeservico|foto|assinatura|ordemdeservico\/tempo)\/([^/]+)$/);
  if (!match) return undefined;
  const [, kind, key] = match;
  const os = ordens.find((row) => row.id === key) ?? ordens[0];
  if (kind === "ordemdeservico") return os;
  if (kind === "ordemdeservico/tempo") return { duracao: os.duracao ?? 0, startedAt: os.startedAt, endedAt: os.endedAt };
  return [];
}
