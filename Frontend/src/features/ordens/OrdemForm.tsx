"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TbDeviceFloppy } from "react-icons/tb";
import { api } from "@/services/api";
import { apiErrorMessage } from "@/lib/apiError";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { useLookups } from "@/components/data/useLookups";
import { SearchableSelect } from "./SearchableSelect";

/** Fixed "Ordem de serviço" tipo (same id the old form sent). */
const ORDER_TYPE_ID = "94e32deb-2a02-41f1-9573-b4b5c265e80a";

const ENDPOINTS = {
  tipodeChamado_id: "/listtipodechamado",
  prioridade_id: "/liststatusprioridade",
  tarefa_id: "/liststatustarefa",
  tecnico_id: "/listtecnico",
  statusOrdemdeServico_id: "/liststatusordemdeservico",
  instituicaoUnidade_id: "/listinstuicao",
  cliente_id: "/listcliente",
} as const;

type SelectKey = keyof typeof ENDPOINTS;

const lookups = Object.values(ENDPOINTS).map((endpoint) => ({ endpoint }));

const emptySelects = Object.fromEntries(Object.keys(ENDPOINTS).map((key) => [key, ""])) as Record<SelectKey, string>;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h6 className="border-b border-border pb-2 text-xs font-semibold uppercase tracking-wide text-muted md:col-span-2">
      {children}
    </h6>
  );
}

/** "Abrir uma OS" — POST /ordemdeservico. */
export function OrdemForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { options, loading, failed } = useLookups(lookups);
  const [selects, setSelects] = useState(emptySelects);
  const [submitting, setSubmitting] = useState(false);

  function select(key: SelectKey, label: string, placeholder = "Selecione...", className?: string, required?: boolean) {
    return (
      <Field label={label} htmlFor={`os-${key}`} required={required} className={className}>
        <SearchableSelect
          inputId={`os-${key}`}
          options={options[ENDPOINTS[key]] ?? []}
          loading={loading}
          value={selects[key]}
          onChange={(value) => setSelects((previous) => ({ ...previous, [key]: value }))}
          placeholder={placeholder}
          clearable={!required}
        />
      </Field>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString().trim();
    const descricaodoProblemaouSolicitacao = formData.get("descricaodoProblemaouSolicitacao")?.toString().trim();
    const contato = formData.get("nomedoContatoaserProcuradonoLocal")?.toString().trim();

    if (!name || !selects.tipodeChamado_id || !descricaodoProblemaouSolicitacao) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    // Kept from the old form (client-side random number). The API ignores it
    // and generates its own numeroOS, retrying on collision.
    const numeroOS = Math.floor(10000 + Math.random() * 90000).toString();

    const payload: Record<string, unknown> = {
      numeroOS,
      name,
      tipodeChamado_id: selects.tipodeChamado_id,
      descricaodoProblemaouSolicitacao,
      tipodeOrdemdeServico_id: ORDER_TYPE_ID,
      nomedoContatoaserProcuradonoLocal: contato || undefined,
      user_id: userId,
    };
    // Optional ids are left out when empty: the API rejects `null`.
    (["prioridade_id", "tarefa_id", "tecnico_id", "statusOrdemdeServico_id", "instituicaoUnidade_id", "cliente_id"] as const).forEach(
      (key) => {
        if (selects[key]) payload[key] = selects[key];
      },
    );

    setSubmitting(true);
    try {
      await api.post("/ordemdeservico", payload);
      toast.success("Ordem de serviço cadastrada!");
      router.push("/dashboard/tickets");
      router.refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Erro ao enviar. Verifique os campos e tente novamente."));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {failed.length > 0 && (
        <p className="rounded-md bg-lightwarning px-4 py-3 text-sm text-warningtext">
          Algumas listas não puderam ser carregadas. Tente recarregar a página.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <SectionTitle>Informações gerais</SectionTitle>
        <Field label="Nome do cliente" htmlFor="os-name" required>
          <Input id="os-name" name="name" required placeholder="Digite o nome do cliente" />
        </Field>
        {select("tipodeChamado_id", "Tipo de chamado", "Selecione o tipo de chamado...", undefined, true)}
        <Field label="Descrição do problema / solicitação" htmlFor="os-descricao" required className="md:col-span-2">
          <Textarea
            id="os-descricao"
            name="descricaodoProblemaouSolicitacao"
            required
            placeholder="Descreva o problema ou solicitação..."
          />
        </Field>
        <Field label="Nome do contato no local" htmlFor="os-contato" className="md:col-span-2">
          <Input id="os-contato" name="nomedoContatoaserProcuradonoLocal" placeholder="Nome do contato (opcional)" />
        </Field>

        <SectionTitle>Atribuição</SectionTitle>
        {select("prioridade_id", "Prioridade")}
        {select("tarefa_id", "Tarefa")}
        {select("tecnico_id", "Técnico")}
        {select("statusOrdemdeServico_id", "Status da OS")}

        <SectionTitle>Localização e cliente</SectionTitle>
        {select("instituicaoUnidade_id", "Instituição / unidade", "Pesquise e selecione a unidade...")}
        {select("cliente_id", "Cliente", "Selecione o cliente (opcional)...")}
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
        <Button variant="outline" onClick={() => router.push("/dashboard/tickets")} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting} disabled={loading} icon={<TbDeviceFloppy className="h-4 w-4" />}>
          Concluir
        </Button>
      </div>
    </form>
  );
}
