import type { FormField } from "@/components/data/EntityForm";
import type { Lookup } from "@/components/data/useLookups";
import { fromDateInput, toDateInput } from "@/lib/format";
import type { EstabilizadoresProps } from "@/lib/getEstabilizadores.type";
import { instituicaoLookup } from "@/features/controleLookups";

const statusEstabilizadoresLookup: Lookup = { endpoint: "/liststatus/estabilizadores" };

/** Stabilizer devices, shown as "patrimônio - nome". */
function estabilizadorLookup(endpoint: string): Lookup {
  return {
    endpoint,
    map: (row) => ({ value: String(row.id), label: `${row.patrimonio ?? "—"} - ${row.name ?? ""}` }),
  };
}

/**
 * Control record of a stabilizer sent for repair. The create page also asks
 * for the ticket id; the edit modal sends the same keys as the old edit form
 * (no idChamado).
 */
export function controleEstabilizadorFields(controle?: EstabilizadoresProps): FormField[] {
  const creating = !controle;
  // On edit, values left empty are omitted: the API rejects "" and null for these fields.
  const optionalText = creating ? undefined : (value: string) => value || undefined;
  const optionalDate = creating ? undefined : (value: string) => (value ? fromDateInput(value) : undefined);

  const fields: FormField[] = [];
  if (creating) fields.push({ name: "idChamado", label: "ID do chamado", required: true });

  fields.push(
    { name: "problema", label: "Problema", required: true, initial: controle?.problema, serialize: optionalText },
    {
      name: "osdaAssistencia",
      label: "OS da assistência",
      required: true,
      initial: controle?.osdaAssistencia,
      serialize: optionalText,
    },
    {
      name: "datadeChegada",
      label: "Data de chegada",
      type: "date",
      required: creating,
      initial: toDateInput(controle?.datadeChegada),
      serialize: optionalDate,
    },
    {
      name: "datadeRetirada",
      label: "Data de retirada",
      type: "date",
      required: creating,
      initial: toDateInput(controle?.datadeRetirada),
      serialize: optionalDate,
    },
    {
      name: "estabilizadores_id",
      label: "Estabilizador",
      type: "select",
      required: creating,
      lookup: estabilizadorLookup(creating ? "/list/estabilizadores" : "/list/estabilizador"),
      initial: controle?.estabilizadores?.id,
    },
    {
      name: "statusEstabilizadores_id",
      label: "Status",
      type: "select",
      required: creating,
      lookup: statusEstabilizadoresLookup,
      initial: controle?.statusEstabilizadores?.id,
    },
    {
      name: "instituicaoUnidade_id",
      label: "Instituição/unidade",
      type: "select",
      required: creating,
      lookup: instituicaoLookup,
      initial: controle?.instituicaoUnidade?.id,
    },
    {
      name: "observacoes",
      label: "Observações",
      type: "textarea",
      placeholder: "Opcional",
      initial: controle?.observacoes,
    },
  );

  return fields;
}

/** Registers a new stabilizer device (name + patrimônio). */
export function novoEstabilizadorFields(): FormField[] {
  return [
    { name: "name", label: "Nome do estabilizador", required: true },
    {
      name: "patrimonio",
      label: "Patrimônio",
      type: "number",
      required: true,
      // the API stores patrimônio as text, as the old form sent it
      serialize: (value) => value,
    },
  ];
}
