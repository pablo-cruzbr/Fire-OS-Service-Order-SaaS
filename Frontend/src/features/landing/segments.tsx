import { ReactNode } from "react";
import {
  TbAirConditioning,
  TbBolt,
  TbBug,
  TbCamera,
  TbCar,
  TbDeviceDesktop,
  TbDeviceMobile,
  TbDroplet,
  TbHammer,
  TbSolarPanel,
  TbSpray,
  TbTools,
  TbWifi,
} from "react-icons/tb";

export type Segment = {
  id: string;
  name: string;
  short: string;
  icon: ReactNode;
  /** Photo in /public/segments (CC0, see CREDITS.md there). */
  image?: string;
  description: string;
  records: string[];
  /** Example service order shown in the preview card. */
  example: {
    title: string;
    client: string;
    lines: { label: string; value: string }[];
    status: string;
  };
};

export const segments: Segment[] = [
  {
    id: "oficinas",
    name: "Oficinas mecânicas e automotivas",
    short: "Oficinas",
    icon: <TbCar />,
    description:
      "Registre o diagnóstico, as peças trocadas e a mão de obra de cada veículo, com histórico por placa e aprovação do orçamento pelo cliente.",
    records: [
      "Diagnóstico e checklist de entrada do veículo",
      "Peças trocadas (óleo, filtros, pastilhas de freio...)",
      "Horas de mão de obra por mecânico",
      "Histórico de serviços por placa e quilometragem",
    ],
    example: {
      title: "Revisão dos 40.000 km",
      client: "Fiat Argo · ABC-1D23",
      lines: [
        { label: "Diagnóstico", value: "Ruído na frenagem" },
        { label: "Peças", value: "Óleo 5W30, filtro, pastilhas" },
        { label: "Mão de obra", value: "2h30 · Carlos" },
      ],
      status: "Em andamento",
    },
  },
  {
    id: "assistencia",
    name: "Assistência técnica de eletrodomésticos e eletrônicos",
    short: "Assistência técnica",
    icon: <TbDeviceMobile />,
    description:
      "Controle a entrada de celulares, notebooks e TVs para conserto: estado do aparelho, defeito relatado, laudo técnico e prazo de retirada.",
    records: [
      "Entrada do aparelho com nº de série e acessórios",
      "Defeito relatado e laudo técnico",
      "Controle de bancada: aguardando peça, em conserto, pronto",
      "Termo de retirada assinado pelo cliente",
    ],
    example: {
      title: "Notebook não liga",
      client: "Dell Inspiron 15 · SN 88A1-X",
      lines: [
        { label: "Acessórios", value: "Carregador" },
        { label: "Laudo", value: "Troca do conector DC" },
        { label: "Prazo", value: "3 dias úteis" },
      ],
      status: "Aguardando peça",
    },
  },
  {
    id: "climatizacao",
    name: "Climatização e refrigeração",
    short: "Climatização",
    icon: <TbAirConditioning />,
    description:
      "Organize instalações, PMOC e manutenções preventivas de ar-condicionado e câmaras frias, com agenda de visitas e fotos do serviço.",
    records: [
      "Instalação, higienização e manutenção preventiva",
      "Equipamentos por cliente, com BTUs e local",
      "Agenda recorrente de visitas (PMOC)",
      "Fotos de antes e depois e assinatura no local",
    ],
    example: {
      title: "Higienização split 12.000 BTUs",
      client: "Clínica Bem Estar · Sala 2",
      lines: [
        { label: "Tipo", value: "Manutenção preventiva" },
        { label: "Técnico", value: "Mariana Lima" },
        { label: "Próxima visita", value: "Em 90 dias" },
      ],
      status: "Agendada",
    },
  },
  {
    id: "marcenaria",
    name: "Marcenaria e móveis planejados",
    short: "Marcenaria",
    icon: <TbHammer />,
    description:
      "Acompanhe cada projeto da medição à montagem: materiais, etapas de produção, equipe de instalação e ajustes pós-entrega.",
    records: [
      "Medição e projeto aprovado pelo cliente",
      "Materiais e ferragens utilizados",
      "Etapas: corte, montagem, acabamento, instalação",
      "Assistência pós-entrega e garantia",
    ],
    example: {
      title: "Cozinha planejada",
      client: "Apto 142 · Residencial Aurora",
      lines: [
        { label: "Material", value: "MDF branco 18mm" },
        { label: "Etapa", value: "Montagem na fábrica" },
        { label: "Instalação", value: "Sexta, 08h" },
      ],
      status: "Em produção",
    },
  },
  {
    id: "helpdesk",
    name: "Suporte de TI (Helpdesk)",
    short: "Suporte de TI",
    icon: <TbDeviceDesktop />,
    description:
      "Abertura de chamados para correção de bugs, configuração de servidores ou formatação de máquinas, com controle de patrimônio e documentação técnica por cliente.",
    records: [
      "Chamados abertos pelo próprio usuário, com prioridade",
      "Bugs, configurações de servidor e formatações",
      "Patrimônio, laboratório e histórico de cada máquina",
      "Documentação técnica e senhas por cliente",
    ],
    example: {
      title: "Formatação e reinstalação",
      client: "Secretaria de Educação · Diretoria",
      lines: [
        { label: "Patrimônio", value: "PAT-20426" },
        { label: "Prioridade", value: "Alta" },
        { label: "Técnico", value: "Rafael Pereira" },
      ],
      status: "Em andamento",
    },
  },
  {
    id: "telecom",
    name: "Provedores de internet e telecom",
    short: "Internet e telecom",
    icon: <TbWifi />,
    description:
      "OS de campo para instalação de fibra óptica, troca de roteadores ou reparo de sinal, com agenda da equipe técnica e comprovação no local.",
    records: [
      "Instalação de fibra com dados do plano e da CTO",
      "Troca de roteador/ONU com nº de série",
      "Reparo de sinal com medição antes e depois",
      "Assinatura do assinante e fotos da instalação",
    ],
    example: {
      title: "Instalação de fibra 500 Mb",
      client: "Assinante · Rua XV de Novembro, 88",
      lines: [
        { label: "CTO / porta", value: "CTO-14 · porta 6" },
        { label: "Equipamento", value: "ONU Wi-Fi 6" },
        { label: "Sinal", value: "-19 dBm" },
      ],
      status: "Em deslocamento",
    },
  },
  {
    id: "eletrica",
    name: "Elétrica e manutenção predial",
    short: "Elétrica e predial",
    icon: <TbBolt />,
    description:
      "Gerencie manutenções corretivas e preventivas em condomínios, empresas e prédios públicos, com checklists e registro de materiais.",
    records: [
      "Checklist de inspeção por local",
      "Materiais aplicados em cada atendimento",
      "Chamados por bloco, andar e setor",
      "Relatórios mensais para o síndico ou gestor",
    ],
    example: {
      title: "Troca de disjuntor geral",
      client: "Condomínio Parque Verde · Bloco B",
      lines: [
        { label: "Material", value: "Disjuntor tripolar 63A" },
        { label: "Local", value: "Quadro do 3º andar" },
        { label: "Duração", value: "1h15" },
      ],
      status: "Concluída",
    },
  },
  {
    id: "hidraulica",
    name: "Hidráulica e encanamento",
    short: "Hidráulica",
    icon: <TbDroplet />,
    description:
      "Da detecção do vazamento ao reparo: registre o problema, os materiais, fotos da obra e a aprovação do cliente em uma só OS.",
    records: [
      "Diagnóstico com fotos do local",
      "Orçamento aprovado antes da execução",
      "Materiais e tempo de serviço",
      "Garantia registrada na OS",
    ],
    example: {
      title: "Vazamento sob a pia",
      client: "Padaria Pão Dourado",
      lines: [
        { label: "Causa", value: "Sifão trincado" },
        { label: "Material", value: "Sifão sanfonado" },
        { label: "Garantia", value: "90 dias" },
      ],
      status: "Concluída",
    },
  },
  {
    id: "seguranca",
    name: "Segurança eletrônica (CFTV e alarmes)",
    short: "Segurança eletrônica",
    icon: <TbCamera />,
    description:
      "Instale e mantenha câmeras, alarmes e controle de acesso com cadastro de equipamentos por cliente e visitas técnicas agendadas.",
    records: [
      "Projeto e pontos de câmera instalados",
      "Equipamentos por cliente (DVR, sensores...)",
      "Manutenções e visitas técnicas",
      "Chamados de emergência com prioridade",
    ],
    example: {
      title: "Câmera sem imagem",
      client: "Mercado São Jorge · Estoque",
      lines: [
        { label: "Equipamento", value: "Câmera IP 4MP" },
        { label: "Prioridade", value: "Alta" },
        { label: "Visita", value: "Hoje, 14h" },
      ],
      status: "Aberta",
    },
  },
  {
    id: "solar",
    name: "Energia solar",
    short: "Energia solar",
    icon: <TbSolarPanel />,
    description:
      "Controle vistorias, instalações e limpezas de placas com histórico por usina e fotos de cada etapa.",
    records: [
      "Vistoria técnica e dimensionamento",
      "Instalação por etapas com fotos",
      "Limpeza e manutenção periódica",
      "Histórico por usina e inversor",
    ],
    example: {
      title: "Limpeza de módulos",
      client: "Sítio Boa Vista · 24 placas",
      lines: [
        { label: "Inversor", value: "5 kW" },
        { label: "Equipe", value: "2 técnicos" },
        { label: "Próxima", value: "Em 6 meses" },
      ],
      status: "Agendada",
    },
  },
  {
    id: "dedetizacao",
    name: "Dedetização e controle de pragas",
    short: "Dedetização",
    icon: <TbBug />,
    description:
      "Registre produtos aplicados, áreas tratadas e o certificado de execução, com retornos programados para cada cliente.",
    records: [
      "Produtos e dosagens aplicadas",
      "Áreas tratadas por visita",
      "Certificado e assinatura do responsável",
      "Retornos e garantias agendados",
    ],
    example: {
      title: "Desinsetização trimestral",
      client: "Restaurante Sabor & Cia",
      lines: [
        { label: "Produto", value: "Gel inseticida" },
        { label: "Áreas", value: "Cozinha e estoque" },
        { label: "Retorno", value: "Em 90 dias" },
      ],
      status: "Concluída",
    },
  },
  {
    id: "limpeza",
    name: "Limpeza e conservação",
    short: "Limpeza",
    icon: <TbSpray />,
    description:
      "Planeje equipes, roteiros e checklists de limpeza para empresas e residências, com comprovação por fotos.",
    records: [
      "Checklist por ambiente",
      "Escala de equipes e roteiros",
      "Fotos de comprovação",
      "Avaliação do cliente ao final",
    ],
    example: {
      title: "Limpeza pós-obra",
      client: "Escritório Almeida & Costa",
      lines: [
        { label: "Equipe", value: "3 pessoas" },
        { label: "Ambientes", value: "6 salas" },
        { label: "Duração", value: "5h" },
      ],
      status: "Em andamento",
    },
  },
  {
    id: "serralheria",
    name: "Serralheria e manutenção geral",
    short: "Serralheria e reparos",
    icon: <TbTools />,
    description:
      "Portões, grades, estruturas e pequenos reparos: orçamento, execução e entrega registrados na mesma ordem de serviço.",
    records: [
      "Medição e orçamento",
      "Materiais e acabamento",
      "Agenda de instalação",
      "Fotos da entrega",
    ],
    example: {
      title: "Portão basculante",
      client: "Residência · Rua das Palmeiras",
      lines: [
        { label: "Serviço", value: "Troca de roldanas" },
        { label: "Material", value: "Kit roldana 4\"" },
        { label: "Entrega", value: "Amanhã" },
      ],
      status: "Aberta",
    },
  },
];

const photos = new Set([
  "oficinas",
  "assistencia",
  "climatizacao",
  "marcenaria",
  "helpdesk",
  "telecom",
  "eletrica",
  "hidraulica",
  "seguranca",
  "solar",
  "limpeza",
  "serralheria",
]);

segments.forEach((segment) => {
  if (photos.has(segment.id)) segment.image = `/segments/${segment.id}.webp`;
});
