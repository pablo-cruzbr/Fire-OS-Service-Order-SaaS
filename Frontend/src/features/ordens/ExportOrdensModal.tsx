"use client";

import { useState } from "react";
import { TbFileSpreadsheet } from "react-icons/tb";
import { Button, Field, Input, Modal } from "@/components/ui";
import { useLookups } from "@/components/data/useLookups";
import { exportOrdemServicoExcel } from "@/lib/exportExcel";
import { SearchableSelect } from "./SearchableSelect";

const lookups = [
  { endpoint: "/liststatustarefa" },
  { endpoint: "/listinstuicao" },
  { endpoint: "/listcliente" },
  { endpoint: "/liststatusordemdeservico" },
  { endpoint: "/listtipodeordemdeservico" },
];

const empty = {
  startDate: "",
  endDate: "",
  tarefa_id: "",
  instituicao_id: "",
  cliente_id: "",
  status_id: "",
  tipoOS_id: "",
};

/**
 * "Gerar relatório de OS" (Excel). Keeps its own filter state — it used to
 * share tarefa/instituição/cliente with the list filters.
 */
export function ExportOrdensModal({ onClose }: { onClose: () => void }) {
  const { options, loading } = useLookups(lookups);
  const [filters, setFilters] = useState(empty);
  const [exporting, setExporting] = useState(false);

  function set(key: keyof typeof empty, value: string) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    const params = Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value || undefined]));
    await exportOrdemServicoExcel(params);
    setExporting(false);
  }

  const selects: { key: keyof typeof empty; label: string; endpoint: string; placeholder: string }[] = [
    { key: "tarefa_id", label: "Tarefa", endpoint: "/liststatustarefa", placeholder: "Todas as tarefas" },
    { key: "instituicao_id", label: "Instituição", endpoint: "/listinstuicao", placeholder: "Todas as instituições" },
    { key: "cliente_id", label: "Cliente", endpoint: "/listcliente", placeholder: "Todos os clientes" },
    { key: "status_id", label: "Status", endpoint: "/liststatusordemdeservico", placeholder: "Todos os status" },
    { key: "tipoOS_id", label: "Tipo de OS", endpoint: "/listtipodeordemdeservico", placeholder: "Todos os tipos" },
  ];

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Gerar relatório de OS"
      subtitle="Exporta as ordens de serviço filtradas para Excel."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={exporting}>
            Cancelar
          </Button>
          <Button onClick={handleExport} loading={exporting} icon={<TbFileSpreadsheet className="h-4 w-4" />}>
            {exporting ? "Processando..." : "Exportar Excel"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Início" htmlFor="export-start">
          <Input id="export-start" type="date" value={filters.startDate} onChange={(e) => set("startDate", e.target.value)} />
        </Field>
        <Field label="Fim" htmlFor="export-end">
          <Input id="export-end" type="date" value={filters.endDate} onChange={(e) => set("endDate", e.target.value)} />
        </Field>
        {selects.map((select) => (
          <Field
            key={select.key}
            label={select.label}
            htmlFor={`export-${select.key}`}
            className={select.key === "tipoOS_id" ? "sm:col-span-2" : undefined}
          >
            <SearchableSelect
              inputId={`export-${select.key}`}
              options={options[select.endpoint] ?? []}
              loading={loading}
              value={filters[select.key]}
              onChange={(value) => set(select.key, value)}
              placeholder={select.placeholder}
            />
          </Field>
        ))}
      </div>
    </Modal>
  );
}
