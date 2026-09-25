"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TbDeviceDesktopPlus, TbExternalLink, TbFileText, TbPencil } from "react-icons/tb";
import { DetailGrid } from "@/components/data/DetailModal";
import { Button, ButtonLink, Modal, StatusBadge } from "@/components/ui";
import { api } from "@/services/api";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import type { OrdemdeServicoProps } from "@/lib/getOrdemdeServico.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { OrdemAssinatura } from "./OrdemAssinatura";
import { OrdemAtendimento } from "./OrdemAtendimento";
import { OrdemEditForm } from "./OrdemEditForm";
import { OrdemFotos } from "./OrdemFotos";
import { openerPlace, osEquipamento, osPlace } from "./helpers";

type Tab = "detalhes" | "atendimento" | "fotos" | "assinatura";

const TABS: { id: Tab; label: string }[] = [
  { id: "detalhes", label: "Detalhes" },
  { id: "atendimento", label: "Atendimento" },
  { id: "fotos", label: "Fotos" },
  { id: "assinatura", label: "Assinatura" },
];

function Local({ os }: { os: OrdemdeServicoProps }) {
  const place = osPlace(os);
  const opener = openerPlace(os);
  const shown = place ?? opener;
  if (!shown) return <span className="text-muted">Localização não informada</span>;
  return (
    <div>
      <p>{shown.name}</p>
      <p className="mt-0.5 text-xs font-normal text-bodytext">{shown.endereco || "Endereço não disponível"}</p>
      {place && opener && opener.name !== place.name && (
        <p className="mt-2 text-xs font-normal text-bodytext">Origem da abertura (usuário): {opener.name}</p>
      )}
    </div>
  );
}

/** Detail of an OS opened from the ticket list (modalType "OrdemdeServico"). */
export function OrdemModal({ data, onClose }: EntityModalProps<OrdemdeServicoProps>) {
  const router = useRouter();
  const [os, setOs] = useState<OrdemdeServicoProps>(data);
  const [tab, setTab] = useState<Tab>("detalhes");
  const [editing, setEditing] = useState(false);

  async function handleSaved() {
    try {
      const { data: fresh } = await api.get(`/ordemdeservico/${os.id}`);
      if (fresh?.id) setOs(fresh);
    } catch {
      // keep the current data; the list refresh below still picks up the change
    }
    setEditing(false);
    setTab("detalhes");
    router.refresh();
  }

  const title = `OS ${os.numeroOS ? `#${os.numeroOS}` : ""}`.trim();

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={editing ? "Atribuir técnico / alterar status" : title}
      subtitle={editing ? title : os.tipodeOrdemdeServico?.name ?? "Ordem de serviço"}
      footer={
        editing ? undefined : (
          <>
            <ButtonLink
              href={`/dashboard/ordemdeservico/${os.id}`}
              onClick={onClose}
              variant="ghost"
              icon={<TbExternalLink className="h-4 w-4" />}
            >
              Página da OS
            </ButtonLink>
            <Button
              variant="outline"
              onClick={() => window.open(`/os-digital/${os.id}`, "_blank", "noopener")}
              icon={<TbFileText className="h-4 w-4" />}
            >
              OS digital
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("/dashboard/formulariosadd/formularioMaquinas", "_blank", "noopener")}
              icon={<TbDeviceDesktopPlus className="h-4 w-4" />}
            >
              Cadastrar máquina
            </Button>
            <Button onClick={() => setEditing(true)} icon={<TbPencil className="h-4 w-4" />}>
              Atribuir / editar
            </Button>
          </>
        )
      }
    >
      {editing ? (
        <OrdemEditForm os={os} onSaved={handleSaved} onCancel={() => setEditing(false)} />
      ) : (
        <>
          <div role="tablist" aria-label="Seções da OS" className="-mt-1 mb-5 flex gap-1 overflow-x-auto border-b border-border">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
                  tab === item.id
                    ? "border-primary text-primary"
                    : "border-transparent text-bodytext hover:text-primary",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "detalhes" && (
            <DetailGrid
              fields={[
                { label: "Nº da OS", value: os.numeroOS },
                { label: "Tipo", value: os.tipodeOrdemdeServico?.name ?? "Não informado" },
                { label: "Status", value: <StatusBadge status={os.statusOrdemdeServico?.name} /> },
                { label: "Prioridade", value: <StatusBadge status={os.prioridade?.name} /> },
                { label: "Quem abriu a OS", value: os.name || "Não informado no formulário" },
                { label: "Usuário cadastrado", value: os.user?.name },
                { label: "Tipo de serviço", value: os.tipodeChamado?.name },
                { label: "Contato no local", value: os.nomedoContatoaserProcuradonoLocal },
                { label: "Técnico responsável", value: os.tecnico?.name ?? "Não atribuído" },
                { label: "Tarefa", value: os.tarefa?.name ?? "Não informada" },
                { label: "Equipamento", value: osEquipamento(os) ?? "Não informado" },
                { label: "Aberta em", value: formatDateTime(os.created_at) },
                { label: "Local", value: <Local os={os} />, full: true },
                { label: "Problema", value: os.descricaodoProblemaouSolicitacao || "Não informado", full: true },
              ]}
            />
          )}
          {tab === "atendimento" && <OrdemAtendimento os={os} />}
          {tab === "fotos" && <OrdemFotos ordemId={os.id} />}
          {tab === "assinatura" && <OrdemAssinatura os={os} />}
        </>
      )}
    </Modal>
  );
}
