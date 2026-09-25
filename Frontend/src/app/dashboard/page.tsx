import Link from "next/link";
import {
  TbArrowRight,
  TbCalendarEvent,
  TbCircleCheck,
  TbClockPause,
  TbFileText,
  TbListDetails,
  TbPlayerPlay,
  TbRoute,
  TbTicket,
  TbTool,
} from "react-icons/tb";
import { Badge, ButtonLink, Card, CardHeader, StatCard, StatusBadge } from "@/components/ui";
import { getSessionUser } from "@/lib/session";
import { serverGet } from "@/lib/serverApi";
import { formatDateTime } from "@/lib/format";
import type { OrdemdeServicoProps, OrdemdeServicoResponseData } from "@/lib/getOrdemdeServico.type";

export const dynamic = "force-dynamic";

const emptyTickets: OrdemdeServicoResponseData = {
  controles: [],
  total: 0,
  totalAberta: 0,
  totalEmDeslocamento: 0,
  totalEmAndamento: 0,
  totalConcluida: 0,
  totalPausada: 0,
  totalTicket: 0,
  totalOrdemdeServico: 0,
};

function place(os: OrdemdeServicoProps) {
  return (
    os.instituicaoUnidade?.name ??
    os.informacoesSetor?.instituicaoUnidade?.name ??
    os.user?.instituicaoUnidade?.name ??
    os.cliente?.name ??
    os.user?.cliente?.name ??
    "—"
  );
}

export default async function DashboardHome() {
  const [user, data] = await Promise.all([
    getSessionUser(),
    serverGet<OrdemdeServicoResponseData>("/listordemdeservico", emptyTickets),
  ]);

  const firstName = user?.name.split(" ")[0] ?? "";
  const isAdmin = user?.role === "ADMIN";
  const recent = [...(data.controles ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const breakdown = [
    { label: "Abertas", value: data.totalAberta ?? 0 },
    { label: "Em deslocamento", value: data.totalEmDeslocamento ?? 0 },
    { label: "Em andamento", value: data.totalEmAndamento ?? 0 },
    { label: "Pausadas", value: data.totalPausada ?? 0 },
    { label: "Concluídas", value: data.totalConcluida ?? 0 },
  ];
  const max = Math.max(1, ...breakdown.map((row) => row.value));

  const shortcuts = [
    { label: "Abrir um ticket", href: "/dashboard/formulariosadd/formularioTicket", icon: <TbTicket /> },
    { label: "Abrir uma OS", href: "/dashboard/formulariosadd/formularioOrdemdeServico", icon: <TbListDetails /> },
    { label: "Documentação técnica", href: "/dashboard/documentacaoTecnica", icon: <TbFileText /> },
    ...(isAdmin
      ? [
          { label: "Calendário técnico", href: "/dashboard/ticketscount", icon: <TbCalendarEvent /> },
          { label: "Técnicos", href: "/dashboard/controles/tecnicos", icon: <TbTool /> },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="relative overflow-hidden bg-lightprimary shadow-none lg:col-span-7 dark:shadow-none">
          <div className="relative z-10 max-w-md">
            <Badge tone="primary" className="bg-card">
              {isAdmin ? "Administrador" : "Técnico"}
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold text-link">Olá, {firstName}! 👋</h2>
            <p className="mt-2 text-bodytext">
              Você tem <strong className="text-link">{data.totalAberta ?? 0}</strong> chamados abertos e{" "}
              <strong className="text-link">{data.totalEmAndamento ?? 0}</strong> em andamento.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <ButtonLink href="/dashboard/tickets" icon={<TbTicket className="h-4 w-4" />}>
                Ver chamados
              </ButtonLink>
              <ButtonLink href="/dashboard/formulariosadd/formularioOrdemdeServico" variant="outline" className="bg-card">
                Nova OS
              </ButtonLink>
            </div>
          </div>
          <div aria-hidden className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-primary/15" />
          <div aria-hidden className="absolute -right-4 -top-20 h-40 w-40 rounded-full bg-secondary/15" />
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-5">
          <StatCard label="Total de chamados" value={data.total ?? 0} tone="primary" icon={<TbTicket />} />
          <StatCard label="Em deslocamento" value={data.totalEmDeslocamento ?? 0} tone="secondary" icon={<TbRoute />} />
          <StatCard label="Em andamento" value={data.totalEmAndamento ?? 0} tone="warning" icon={<TbPlayerPlay />} />
          <StatCard label="Concluídos" value={data.totalConcluida ?? 0} tone="success" icon={<TbCircleCheck />} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader
            title="Chamados recentes"
            subtitle="Os últimos chamados e ordens de serviço registrados"
            action={
              <Link href="/dashboard/tickets" className="flex items-center gap-1 text-sm font-medium text-primary">
                Ver todos <TbArrowRight />
              </Link>
            }
          />
          {recent.length === 0 ? (
            <p className="py-10 text-center text-bodytext">Nenhum chamado registrado ainda.</p>
          ) : (
            <div className="-mx-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="px-6 py-3 font-semibold text-link">OS</th>
                    <th scope="col" className="px-6 py-3 font-semibold text-link">Local</th>
                    <th scope="col" className="px-6 py-3 font-semibold text-link">Técnico</th>
                    <th scope="col" className="px-6 py-3 font-semibold text-link">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((os) => (
                    <tr key={os.id} className="border-b border-border last:border-0">
                      <td className="px-6 py-3.5">
                        <Link href={`/dashboard/ordemdeservico/${os.id}`} className="font-semibold text-link hover:text-primary">
                          #{os.numeroOS}
                        </Link>
                        <p className="text-xs text-muted">{formatDateTime(os.created_at)}</p>
                      </td>
                      <td className="max-w-[220px] truncate px-6 py-3.5 text-bodytext">{place(os)}</td>
                      <td className="px-6 py-3.5 text-bodytext">{os.tecnico?.name ?? "Não atribuído"}</td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={os.statusOrdemdeServico?.name} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card>
            <CardHeader title="Chamados por status" subtitle={`${data.total ?? 0} no total`} />
            <ul className="flex flex-col gap-4">
              {breakdown.map((row) => (
                <li key={row.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-bodytext">{row.label}</span>
                    <span className="font-semibold text-link">{row.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(row.value / max) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            {(data.totalPausada ?? 0) > 0 && (
              <p className="mt-5 flex items-center gap-2 rounded-md bg-lightwarning px-3 py-2 text-xs text-warningtext">
                <TbClockPause className="h-4 w-4" /> {data.totalPausada} chamado(s) pausado(s) aguardando retomada.
              </p>
            )}
          </Card>

          <Card>
            <CardHeader title="Atalhos" />
            <ul className="flex flex-col gap-1">
              {shortcuts.map((shortcut) => (
                <li key={shortcut.href}>
                  <Link
                    href={shortcut.href}
                    className="group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-lightprimary"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-lightprimary text-lg text-primary">
                      {shortcut.icon}
                    </span>
                    <span className="flex-1 text-sm font-medium text-link group-hover:text-primary">{shortcut.label}</span>
                    <TbArrowRight className="text-muted group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
