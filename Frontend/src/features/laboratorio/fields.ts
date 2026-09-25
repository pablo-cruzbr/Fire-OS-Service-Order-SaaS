import type { FormField, Payload } from "@/components/data/EntityForm";
import { fromDateInput, toDateInput } from "@/lib/format";
import type { LaboratorioProps } from "@/lib/getLaboratorio.type";
import { clienteLookup, equipamentoLookup, instituicaoLookup, tecnicoLookup } from "@/features/controleLookups";

const statusLaboratorioLookup = { endpoint: "/listcontrolledeLaboratorio" };

/**
 * Create page: every field is required and técnico/cliente are chosen.
 * Edit modal: técnico/cliente are not editable (the old edit form had no
 * input for them) and are sent back unchanged by `laboratorioEditTransform`.
 */
export function laboratorioFields(laboratorio?: LaboratorioProps): FormField[] {
  const creating = !laboratorio;
  // On edit, optional values left empty are omitted: the API rejects "" and would read null as 1970.
  const optionalText = creating ? undefined : (value: string) => value || undefined;
  const optionalDate = creating ? undefined : (value: string) => (value ? fromDateInput(value) : undefined);

  const fields: FormField[] = [
    { name: "nomedoEquipamento", label: "Nome do equipamento", required: true, initial: laboratorio?.nomedoEquipamento },
    { name: "marca", label: "Marca", required: true, initial: laboratorio?.marca },
    { name: "osDeAbertura", label: "OS de abertura", required: true, initial: laboratorio?.osDeAbertura },
    {
      name: "osDeDevolucao",
      label: "OS de devolução",
      required: creating,
      initial: laboratorio?.osDeDevolucao,
      serialize: optionalText,
    },
    {
      name: "data_de_Chegada",
      label: "Data de chegada",
      type: "date",
      required: creating,
      initial: toDateInput(laboratorio?.data_de_Chegada),
      serialize: optionalDate,
    },
    {
      name: "data_de_Finalizacao",
      label: "Data de finalização",
      type: "date",
      required: creating,
      initial: toDateInput(laboratorio?.data_de_Finalizacao),
      serialize: optionalDate,
    },
    {
      name: "equipamento_id",
      label: "Equipamento",
      type: "select",
      required: true,
      lookup: equipamentoLookup,
      initial: laboratorio?.equipamento?.id,
    },
    {
      name: "statusControledeLaboratorio_id",
      label: "Status",
      type: "select",
      required: true,
      lookup: statusLaboratorioLookup,
      initial: laboratorio?.statusControledeLaboratorio?.id,
    },
    {
      name: "instituicaoUnidade_id",
      label: "Instituição/unidade",
      type: "select",
      required: true,
      lookup: instituicaoLookup,
      initial: laboratorio?.instituicaoUnidade?.id,
    },
  ];

  if (creating) {
    fields.push(
      { name: "tecnico_id", label: "Técnico", type: "select", required: true, lookup: tecnicoLookup },
      { name: "cliente_id", label: "Cliente", type: "select", required: true, lookup: clienteLookup },
    );
  }

  fields.push({ name: "defeito", label: "Defeito", type: "textarea", required: true, initial: laboratorio?.defeito });
  return fields;
}

/** Keeps sending the current técnico/cliente on edit, like the old form did. */
export function laboratorioEditTransform(laboratorio: LaboratorioProps) {
  return (payload: Payload): Payload => ({
    ...payload,
    ...(laboratorio.cliente?.id ? { cliente_id: laboratorio.cliente.id } : {}),
    ...(laboratorio.tecnico?.id ? { tecnico_id: laboratorio.tecnico.id } : {}),
  });
}
