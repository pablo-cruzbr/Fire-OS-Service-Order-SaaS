import type { FormField } from "@/components/data/EntityForm";
import { toDateInput, toMonthInput } from "@/lib/format";
import type { AssistenciaTecnicaProps } from "@/lib/getAssistenciaTecnica.type";
import { clienteLookup, equipamentoLookup, instituicaoLookup, tecnicoLookup } from "@/features/controleLookups";

const statusReparoLookup = { endpoint: "/liststatusreparo" };

/**
 * Fields of the "nova assistência técnica" page (no argument) and of the edit
 * modal (with the record). Both send the same keys.
 */
export function assistenciaTecnicaFields(assistencia?: AssistenciaTecnicaProps): FormField[] {
  const creating = !assistencia;

  return [
    { name: "name", label: "Nome do registro", required: true, initial: assistencia?.name, full: true },
    { name: "mesAno", label: "Mês/ano", type: "month", required: true, initial: toMonthInput(assistencia?.mesAno) },
    {
      name: "dataDeRetirada",
      label: "Data de retirada",
      type: "date",
      required: true,
      initial: toDateInput(assistencia?.dataDeRetirada),
    },
    { name: "idChamado", label: "ID do chamado", required: true, initial: assistencia?.idChamado },
    { name: "assistencia", label: "Assistência", required: true, initial: assistencia?.assistencia },
    { name: "osDaAssistencia", label: "OS da assistência", required: true, initial: assistencia?.osDaAssistencia },
    {
      name: "statusReparo_id",
      label: "Status do reparo",
      type: "select",
      required: creating,
      lookup: statusReparoLookup,
      initial: assistencia?.statusReparo?.id,
    },
    {
      name: "equipamento_id",
      label: "Equipamento",
      type: "select",
      required: creating,
      lookup: equipamentoLookup,
      initial: assistencia?.equipamento?.id,
    },
    {
      name: "instituicaoUnidade_id",
      label: "Instituição/unidade",
      type: "select",
      required: creating,
      lookup: instituicaoLookup,
      initial: assistencia?.instituicaoUnidade?.id,
    },
    {
      name: "tecnico_id",
      label: "Técnico",
      type: "select",
      required: true,
      lookup: tecnicoLookup,
      initial: assistencia?.tecnico?.id,
    },
    {
      name: "cliente_id",
      label: "Cliente",
      type: "select",
      required: true,
      lookup: clienteLookup,
      initial: assistencia?.cliente?.id,
    },
    {
      name: "observacoes",
      label: "Observações",
      type: "textarea",
      placeholder: "Opcional",
      initial: assistencia?.observacoes,
    },
  ];
}
