"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TbDeviceFloppy, TbSearch } from "react-icons/tb";
import { api } from "@/services/api";
import { apiErrorMessage } from "@/lib/apiError";
import { toArray } from "@/lib/toArray";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { DetailGrid } from "@/components/data/DetailModal";
import { useLookups } from "@/components/data/useLookups";

/** Fixed "Ticket" tipo de ordem de serviço (same id the old form sent). */
const TICKET_TYPE_ID = "9255770c-a7b5-400b-9773-8b249f04b9ed";

type Ramal = {
  id: string;
  usuario: string;
  ramal: string;
  andar: string;
  setor?: { id: string; name: string } | null;
  cliente?: { id: string; name: string; endereco?: string } | null;
  instituicaoUnidade?: { id: string; name: string; endereco?: string } | null;
};

const lookups = [{ endpoint: "/liststatusordemdeservico" }, { endpoint: "/listtipodechamado" }];

/** Ticket opened on behalf of a ramal user (searched by name or ramal). */
export function TicketForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { options, loading, failed } = useLookups(lookups);
  const [ramalInput, setRamalInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [usuario, setUsuario] = useState<Ramal | null>(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function search(by: "name" | "ramal") {
    const term = (by === "name" ? nameInput : ramalInput).trim();
    if (!term) {
      toast.error(by === "name" ? "Digite um nome." : "Digite um ramal.");
      return;
    }
    setSearching(true);
    try {
      const { data } = await api.get("/listinformacoessetor");
      const rows = toArray<Ramal>(data);
      const found =
        by === "name"
          ? rows.find((item) => item.usuario?.toLowerCase().includes(term.toLowerCase()))
          : rows.find((item) => item.ramal === term);
      setUsuario(found ?? null);
      if (!found) {
        toast.error(by === "name" ? "Usuário não encontrado." : "Ramal não encontrado.");
      } else if (by === "name") {
        setRamalInput(found.ramal);
      } else {
        setNameInput(found.usuario);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível pesquisar os ramais."));
    } finally {
      setSearching(false);
    }
  }

  /** Enter inside a search box searches instead of submitting the ticket. */
  function searchOnEnter(by: "name" | "ramal") {
    return (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        search(by);
      }
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!usuario) {
      toast.error("Pesquise um usuário por ramal ou nome antes de concluir.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const text = (key: string) => formData.get(key)?.toString() || undefined;

    // Kept from the old form. The API ignores it and generates its own numeroOS.
    const numeroOS = Math.floor(10000 + Math.random() * 90000);

    const payload: Record<string, unknown> = {
      numeroOS,
      name: usuario.usuario,
      descricaodoProblemaouSolicitacao: text("descricaodoProblemaouSolicitacao"),
      solucao: text("solucao"),
      statusOrdemdeServico_id: text("statusOrdemdeServico_id"),
      tipodeOrdemdeServico_id: TICKET_TYPE_ID,
      tipodeChamado_id: text("tipodeChamado_id"),
      ramal: ramalInput,
      informacoesSetorId: usuario.id,
      user_id: userId,
      // the API rejects `null` for optional ids — leave them out instead
      cliente_id: usuario.cliente?.id || undefined,
      instituicaoUnidade_id: usuario.instituicaoUnidade?.id || undefined,
    };

    setSubmitting(true);
    try {
      await api.post("/ordemdeservico", payload);
      toast.success("Ticket cadastrado com sucesso!");
      router.push("/dashboard/tickets");
      router.refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Erro ao cadastrar o ticket."));
      setSubmitting(false);
    }
  }

  const vinculo = usuario?.cliente ?? usuario?.instituicaoUnidade ?? null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {failed.length > 0 && (
        <p className="rounded-md bg-lightwarning px-4 py-3 text-sm text-warningtext">
          Algumas listas não puderam ser carregadas. Tente recarregar a página.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Pesquisar por nome" htmlFor="ticket-nome">
          <div className="flex gap-2">
            <Input
              id="ticket-nome"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              onKeyDown={searchOnEnter("name")}
              placeholder="Digite o nome do usuário..."
            />
            <Button
              variant="light"
              size="icon"
              className="h-11 w-11"
              onClick={() => search("name")}
              disabled={searching}
              aria-label="Pesquisar nome"
              title="Pesquisar nome"
            >
              <TbSearch className="h-4 w-4" />
            </Button>
          </div>
        </Field>
        <Field label="Pesquisar por ramal" htmlFor="ticket-ramal">
          <div className="flex gap-2">
            <Input
              id="ticket-ramal"
              value={ramalInput}
              onChange={(event) => setRamalInput(event.target.value)}
              onKeyDown={searchOnEnter("ramal")}
              placeholder="Digite o ramal..."
            />
            <Button
              variant="light"
              size="icon"
              className="h-11 w-11"
              onClick={() => search("ramal")}
              disabled={searching}
              aria-label="Pesquisar ramal"
              title="Pesquisar ramal"
            >
              <TbSearch className="h-4 w-4" />
            </Button>
          </div>
        </Field>

        {usuario && (
          <div className="md:col-span-2">
            <DetailGrid
              fields={[
                { label: "Usuário", value: usuario.usuario },
                { label: "Ramal", value: usuario.ramal },
                { label: "Setor", value: usuario.setor?.name },
                { label: "Andar", value: usuario.andar },
                {
                  label: usuario.cliente ? "Cliente" : "Unidade",
                  value: vinculo?.name ?? "Nenhum vínculo (cliente/unidade) encontrado",
                },
                { label: "Endereço", value: vinculo?.endereco },
              ]}
            />
          </div>
        )}

        <Field label="Descrição do problema" htmlFor="ticket-descricao" required className="md:col-span-2">
          <Textarea
            id="ticket-descricao"
            name="descricaodoProblemaouSolicitacao"
            required
            placeholder="Descrição do problema ou solicitação"
          />
        </Field>
        <Field label="Solução" htmlFor="ticket-solucao" required className="md:col-span-2">
          <Textarea id="ticket-solucao" name="solucao" required placeholder="Descreva como resolveu o problema" />
        </Field>
        <Field label="Status" htmlFor="ticket-status" required>
          <Select id="ticket-status" name="statusOrdemdeServico_id" required defaultValue="" disabled={loading}>
            <option value="" disabled>
              {loading ? "Carregando..." : "Selecione o status"}
            </option>
            {(options["/liststatusordemdeservico"] ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tipo de chamado" htmlFor="ticket-tipo" required>
          <Select id="ticket-tipo" name="tipodeChamado_id" required defaultValue="" disabled={loading}>
            <option value="" disabled>
              {loading ? "Carregando..." : "Selecione o tipo"}
            </option>
            {(options["/listtipodechamado"] ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
        <Button variant="outline" onClick={() => router.push("/dashboard/tickets")} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={submitting}
          disabled={loading || searching}
          icon={<TbDeviceFloppy className="h-4 w-4" />}
        >
          Concluir
        </Button>
      </div>
    </form>
  );
}
