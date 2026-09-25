"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TbCircleCheck,
  TbClockPause,
  TbExternalLink,
  TbFileSpreadsheet,
  TbListDetails,
  TbPlayerPlay,
  TbTicket,
} from "react-icons/tb";
import { CellTitle, EntityList, optionsFrom } from "@/components/data/EntityList";
import { Button, ButtonLink, StatusBadge } from "@/components/ui";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatDateTime } from "@/lib/format";
import type { OrdemdeServicoProps, OrdemdeServicoResponseData } from "@/lib/getOrdemdeServico.type";
import { ExportOrdensModal } from "./ExportOrdensModal";
import { RelatorioSecretariaModal, type Secretaria } from "./RelatorioSecretariaModal";
import { byNewest, osClienteName, osInstituicaoName, osPlaceName } from "./helpers";

const REFRESH_INTERVAL = 60_000;

/** Silent refresh every 60s and whenever the window regains focus. */
function useAutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    window.addEventListener("focus", refresh);
    const interval = window.setInterval(refresh, REFRESH_INTERVAL);
    return () => {
      window.removeEventListener("focus", refresh);
      window.clearInterval(interval);
    };
  }, [router]);
}

/** Matches when any of the candidate names equals the selected filter value. */
function anyIs(value: string, ...names: (string | null | undefined)[]) {
  return names.some((name) => name === value);
}

export default function OrdensList({ data }: { data: OrdemdeServicoResponseData }) {
  const { openModal } = useGlobalModal();
  const [exportOpen, setExportOpen] = useState(false);
  const [secretaria, setSecretaria] = useState<Secretaria | null>(null);
  useAutoRefresh();

  const items = useMemo(() => [...(data.controles ?? [])].sort(byNewest), [data.controles]);

  return (
    <>
      <EntityList<OrdemdeServicoProps>
        title="Chamados"
        breadcrumbs={[{ label: "Chamados" }, { label: "Lista de chamados" }]}
        description={`${data.total ?? items.length} chamados no total, do mais recente para o mais antigo.`}
        items={items}
        rowKey={(os) => os.id}
        stats={[
          { label: "Abertas", value: data.totalAberta ?? 0, tone: "warning", icon: <TbTicket /> },
          { label: "Em andamento", value: data.totalEmAndamento ?? 0, tone: "primary", icon: <TbPlayerPlay /> },
          { label: "Pausadas", value: data.totalPausada ?? 0, tone: "secondary", icon: <TbClockPause /> },
          { label: "Concluídas", value: data.totalConcluida ?? 0, tone: "success", icon: <TbCircleCheck /> },
        ]}
        search={{
          placeholder: "Buscar por nº da OS, solicitante ou local...",
          text: (os) => [os.numeroOS?.toString(), os.name, osPlaceName(os)],
        }}
        filters={[
          {
            label: "Status",
            options: (rows) => optionsFrom(rows, (os) => os.statusOrdemdeServico?.name),
            match: (os, value) => os.statusOrdemdeServico?.name === value,
          },
          {
            label: "Tipo",
            options: (rows) => optionsFrom(rows, (os) => os.tipodeOrdemdeServico?.name),
            match: (os, value) => os.tipodeOrdemdeServico?.name === value,
          },
          {
            label: "Prioridade",
            options: (rows) => optionsFrom(rows, (os) => os.prioridade?.name),
            match: (os, value) => os.prioridade?.name === value,
          },
          {
            label: "Tarefa",
            options: (rows) => optionsFrom(rows, (os) => os.tarefa?.name),
            match: (os, value) => os.tarefa?.name === value,
          },
          {
            label: "Técnico",
            options: (rows) => optionsFrom(rows, (os) => os.tecnico?.name),
            match: (os, value) => os.tecnico?.name === value,
          },
          {
            label: "Instituição",
            options: (rows) => optionsFrom(rows, osInstituicaoName),
            match: (os, value) =>
              anyIs(
                value,
                os.instituicaoUnidade?.name,
                os.user?.instituicaoUnidade?.name,
                os.informacoesSetor?.instituicaoUnidade?.name,
              ),
          },
          {
            label: "Cliente",
            options: (rows) => optionsFrom(rows, osClienteName),
            match: (os, value) =>
              anyIs(value, os.cliente?.name, os.user?.cliente?.name, os.informacoesSetor?.cliente?.name),
          },
        ]}
        columns={[
          {
            header: "Nº da OS",
            cell: (os) => (
              <CellTitle title={os.numeroOS ? `#${os.numeroOS}` : "—"} subtitle={os.tipodeOrdemdeServico?.name} />
            ),
          },
          {
            header: "Solicitante",
            cell: (os) => <CellTitle title={os.name || "—"} subtitle={osPlaceName(os)} />,
          },
          { header: "Status", cell: (os) => <StatusBadge status={os.statusOrdemdeServico?.name} /> },
          { header: "Prioridade", cell: (os) => <StatusBadge status={os.prioridade?.name} /> },
          { header: "Técnico", cell: (os) => os.tecnico?.name ?? <span className="text-muted">Não atribuído</span> },
          { header: "Aberta em", cell: (os) => formatDateTime(os.created_at), className: "whitespace-nowrap" },
          {
            header: "Página",
            className: "w-16 text-right",
            cell: (os) => (
              <Link
                href={`/dashboard/ordemdeservico/${os.id}`}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                aria-label={`Abrir a página da OS ${os.numeroOS ?? ""}`}
                title="Abrir a página da OS"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-bodytext transition-colors hover:bg-lightprimary hover:text-primary"
              >
                <TbExternalLink className="h-4 w-4" />
              </Link>
            ),
          },
        ]}
        headerActions={
          <>
            <Button
              variant="outline"
              className="bg-card"
              onClick={() => setExportOpen(true)}
              icon={<TbFileSpreadsheet className="h-4 w-4" />}
            >
              Relatório
            </Button>
            <Button
              variant="outline"
              className="bg-card"
              onClick={() => setSecretaria("educacao")}
              icon={<TbFileSpreadsheet className="h-4 w-4" />}
              title="Relatório da Secretaria da Educação"
            >
              Rel. Educação
            </Button>
            <Button
              variant="outline"
              className="bg-card"
              onClick={() => setSecretaria("saude")}
              icon={<TbFileSpreadsheet className="h-4 w-4" />}
              title="Relatório da Secretaria da Saúde"
            >
              Rel. Saúde
            </Button>
            <ButtonLink
              href="/dashboard/formulariosadd/formularioOrdemdeServico"
              variant="light"
              icon={<TbListDetails className="h-4 w-4" />}
            >
              Nova OS
            </ButtonLink>
          </>
        }
        add={{ href: "/dashboard/formulariosadd/formularioTicket", label: "Novo ticket" }}
        onOpen={(os) => openModal("OrdemdeServico", os)}
        emptyMessage="Nenhum chamado cadastrado ainda."
      />

      {exportOpen && <ExportOrdensModal onClose={() => setExportOpen(false)} />}
      {secretaria && <RelatorioSecretariaModal secretaria={secretaria} onClose={() => setSecretaria(null)} />}
    </>
  );
}
