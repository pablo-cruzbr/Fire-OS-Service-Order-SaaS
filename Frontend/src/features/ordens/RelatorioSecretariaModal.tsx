"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { TbFileSpreadsheet } from "react-icons/tb";
import { api } from "@/services/api";
import { apiErrorMessage } from "@/lib/apiError";
import { formatDate } from "@/lib/format";
import { toArray } from "@/lib/toArray";
import { cn } from "@/lib/cn";
import { Button, Field, Input, Modal, Spinner } from "@/components/ui";

export type Secretaria = "saude" | "educacao";

type TipoInstituicao = { id: string; name: string };

const PREFIXOS: Record<Secretaria, string[]> = {
  saude: ["USF", "SMS", "UPA", "UAPS", "UBS"],
  educacao: ["ESCOLA", "CRECHE", "SME"],
};

const TITULOS: Record<Secretaria, string> = {
  saude: "RELATÓRIO DE TAREFAS SECRETARIA DA SAÚDE",
  educacao: "RELATÓRIO DE TAREFAS SECRETARIA DA EDUCAÇÃO",
};

/** Timestamps (created_at...) in local time. */
function localDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "-";
}

function localTime(value?: string | null) {
  return value ? new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "-";
}

/** Spreadsheet of the OS opened in the units of one secretaria (saúde / educação). */
export function RelatorioSecretariaModal({ secretaria, onClose }: { secretaria: Secretaria; onClose: () => void }) {
  const [tipos, setTipos] = useState<TipoInstituicao[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [gerando, setGerando] = useState(false);

  const titulo = TITULOS[secretaria];

  useEffect(() => {
    let cancelled = false;
    setLoadingTipos(true);
    api
      .get("/listtipodeinstituicaounidade")
      .then(({ data }) => {
        if (cancelled) return;
        const all = toArray<TipoInstituicao>(data);
        setTipos(all);
        setSelecionados(
          all
            .filter((tipo) => PREFIXOS[secretaria].some((prefixo) => tipo.name.toUpperCase().startsWith(prefixo)))
            .map((tipo) => tipo.id),
        );
      })
      .catch((error) => {
        if (!cancelled) toast.error(apiErrorMessage(error, "Não foi possível carregar os tipos de instituição."));
      })
      .finally(() => {
        if (!cancelled) setLoadingTipos(false);
      });
    return () => {
      cancelled = true;
    };
  }, [secretaria]);

  function toggleTipo(id: string) {
    setSelecionados((previous) => (previous.includes(id) ? previous.filter((x) => x !== id) : [...previous, id]));
  }

  async function handleGerar() {
    if (selecionados.length === 0) {
      toast.error("Selecione ao menos um tipo de instituição.");
      return;
    }
    setGerando(true);
    try {
      const params: Record<string, string> = { tiposIds: selecionados.join(",") };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await api.get("/ordens/relatorio-secretaria", { params });
      const ordens: any[] = Array.isArray(data) ? data : [];

      // `yyyy-mm-dd` inputs are shown as UTC dates, so they don't roll back a day.
      const periodoTexto =
        startDate && endDate ? `${formatDate(startDate)} a ${formatDate(endDate)}` : "Todos os períodos";

      const rows: unknown[][] = [
        [titulo],
        [`Total de chamados: ${ordens.length}`],
        [`Período: ${periodoTexto}`],
        [],
        ["Código", "Data", "Hora", "Tipo da tarefa", "Responsável", "Cliente", "Orientação", "Endereço", "Visualização", "OS Digital"],
        ...ordens.map((os) => [
          os.numeroOS,
          localDate(os.created_at),
          localTime(os.created_at),
          os.tarefa?.name || os.tipodeChamado?.name || "-",
          os.tecnico?.name || os.nameTecnico || "-",
          os.instituicaoUnidade?.name || os.cliente?.name || "-",
          os.descricaodoProblemaouSolicitacao || "-",
          os.instituicaoUnidade?.endereco || os.cliente?.endereco || "-",
          localDate(os.updatedAt),
          `${window.location.origin}/os-digital/${os.id}`,
        ]),
      ];

      const sheet = XLSX.utils.aoa_to_sheet(rows);
      sheet["!cols"] = [
        { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 25 }, { wch: 20 },
        { wch: 30 }, { wch: 50 }, { wch: 35 }, { wch: 18 }, { wch: 60 },
      ];
      sheet["!merges"] = [0, 1, 2].map((row) => ({ s: { r: row, c: 0 }, e: { r: row, c: 9 } }));

      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, "RELATORIO DE TAREFAS");
      XLSX.writeFile(book, `Relatorio_${secretaria === "saude" ? "Saude" : "Educacao"}_${Date.now()}.xlsx`);

      toast.success(`Relatório gerado com ${ordens.length} OS!`);
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Erro ao gerar relatório."));
    } finally {
      setGerando(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={secretaria === "saude" ? "Relatório da Secretaria da Saúde" : "Relatório da Secretaria da Educação"}
      subtitle="Planilha de tarefas por tipo de instituição."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={gerando}>
            Cancelar
          </Button>
          <Button
            onClick={handleGerar}
            loading={gerando}
            disabled={selecionados.length === 0}
            icon={<TbFileSpreadsheet className="h-4 w-4" />}
          >
            {gerando ? "Gerando..." : "Gerar Excel"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <section>
          <p className="mb-3 text-sm font-semibold text-link">Tipos de instituição</p>
          {loadingTipos ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Spinner className="h-4 w-4" /> Carregando...
            </div>
          ) : tipos.length === 0 ? (
            <p className="text-sm text-muted">Nenhum tipo de instituição cadastrado.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {tipos.map((tipo) => {
                const checked = selecionados.includes(tipo.id);
                return (
                  <label
                    key={tipo.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-sm transition-colors",
                      checked ? "border-primary bg-lightprimary text-primary" : "border-border text-link hover:border-primary",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTipo(tipo.id)}
                      className="h-4 w-4 accent-primary"
                    />
                    {tipo.name}
                  </label>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <p className="mb-3 text-sm font-semibold text-link">Período (opcional)</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="De" htmlFor="secretaria-start">
              <Input id="secretaria-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="Até" htmlFor="secretaria-end">
              <Input id="secretaria-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
        </section>
      </div>
    </Modal>
  );
}
