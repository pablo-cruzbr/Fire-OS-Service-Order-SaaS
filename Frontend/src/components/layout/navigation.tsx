import { ReactNode } from "react";
import {
  TbAddressBook,
  TbBuildingCommunity,
  TbCalendarEvent,
  TbFileText,
  TbLayoutDashboard,
  TbSettingsAutomation,
  TbSquarePlus,
  TbTicket,
  TbTool,
  TbUsersGroup,
} from "react-icons/tb";
import type { Role } from "@/lib/session";

export type NavLink = { label: string; href: string };

export type NavItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  children?: NavLink[];
};

export type NavSection = {
  heading: string;
  roles: Role[];
  items: NavItem[];
};

export const navigation: NavSection[] = [
  {
    heading: "Principal",
    roles: ["ADMIN", "TECNICO"],
    items: [
      { label: "Painel", icon: <TbLayoutDashboard />, href: "/dashboard" },
      {
        label: "Chamados",
        icon: <TbTicket />,
        children: [
          { label: "Lista de chamados", href: "/dashboard/tickets" },
          { label: "Abrir um ticket", href: "/dashboard/formulariosadd/formularioTicket" },
          { label: "Abrir uma OS", href: "/dashboard/formulariosadd/formularioOrdemdeServico" },
        ],
      },
      { label: "Documentação técnica", icon: <TbFileText />, href: "/dashboard/documentacaoTecnica" },
    ],
  },
  {
    heading: "Administração",
    roles: ["ADMIN"],
    items: [
      { label: "Calendário técnico", icon: <TbCalendarEvent />, href: "/dashboard/ticketscount" },
      {
        label: "Controles",
        icon: <TbSettingsAutomation />,
        children: [
          { label: "Equipamentos", href: "/dashboard/controles/equipamentos" },
          { label: "Estabilizadores", href: "/dashboard/controles/estabilizadores" },
          { label: "Assistência técnica", href: "/dashboard/controles/assistenciaTecnica" },
          { label: "Laudo técnico", href: "/dashboard/controles/laudoTecnico" },
          { label: "Laboratório", href: "/dashboard/controles/laboratorio" },
          { label: "Pendentes laboratório", href: "/dashboard/controles/pendentesLaboratorio" },
          { label: "Pendentes ORO", href: "/dashboard/controles/pendentesOro" },
          { label: "Compras", href: "/dashboard/compras" },
        ],
      },
      {
        label: "Clientes",
        icon: <TbBuildingCommunity />,
        children: [
          { label: "Clientes privados", href: "/dashboard/clientesprivados" },
          { label: "Clientes municipais", href: "/dashboard/clientesMunicipais" },
        ],
      },
      {
        label: "Ramais e setores",
        icon: <TbAddressBook />,
        children: [
          { label: "Ramais e setores", href: "/dashboard/ramaisSetores" },
          { label: "Setores", href: "/dashboard/setor" },
        ],
      },
      { label: "Técnicos", icon: <TbTool />, href: "/dashboard/controles/tecnicos" },
      { label: "Usuários", icon: <TbUsersGroup />, href: "/dashboard/usuarios" },
      {
        label: "Cadastros",
        icon: <TbSquarePlus />,
        children: [
          { label: "Novo ramal", href: "/dashboard/formulariosadd/formularioRamaisSetores" },
          { label: "Novo equipamento", href: "/dashboard/formulariosadd/formularioMaquinas" },
          { label: "Novo técnico", href: "/dashboard/formulariosadd/formularioTecnicoAdd" },
          { label: "Novo setor", href: "/dashboard/formulariosadd/formularioSetores" },
          { label: "Novo usuário", href: "/signup_empresa" },
        ],
      },
    ],
  },
];

export function navigationFor(role: Role) {
  return navigation.filter((section) => section.roles.includes(role));
}
