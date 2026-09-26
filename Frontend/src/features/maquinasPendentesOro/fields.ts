import type { FormField } from "@/components/data/EntityForm";
import { fromDateInput, toDateInput } from "@/lib/format";
import type { MaquinasPendentesOroProps } from "@/lib/getMaquinasPendentesOro.type";
import { equipamentoLookup, instituicaoLookup } from "@/features/equipamentos/fields";

const statusLookup = { endpoint: "/liststatusMaquinasPendentesOro" };

/** Same payload keys on create (POST) and edit (PATCH). */
export function maquinaPendenteOroFields(maquina?: MaquinasPendentesOroProps): FormField[] {
  const editing = Boolean(maquina);
  return [
    {
      name: "equipamento_id",
      label: "Equipamento",
      type: "select",
      required: !editing,
      lookup: equipamentoLookup,
      placeholder: "Selecione o equipamento",
      initial: maquina?.equipamento?.id ?? "",
      full: true,
    },
    {
      name: "datadaInstalacao",
      label: "Data da instalação",
      type: "date",
      required: !editing,
      initial: toDateInput(maquina?.datadaInstalacao),
      // On edit an empty date is left out: the API coerces null to 01/01/1970.
      serialize: editing ? (raw) => (raw ? fromDateInput(raw) : undefined) : undefined,
    },
    {
      name: "statusMaquinasPendentesOro_id",
      label: "Status",
      type: "select",
      required: !editing,
      lookup: statusLookup,
      placeholder: "Selecione o status",
      initial: maquina?.statusMaquinasPendentesOro?.id ?? "",
    },
    {
      name: "osInstalacao",
      label: "OS de instalação",
      required: true,
      placeholder: "OS de instalação",
      initial: maquina?.osInstalacao,
    },
    {
      name: "osRetirada",
      label: "OS de retirada",
      required: true,
      placeholder: "OS de retirada",
      initial: maquina?.osRetirada,
    },
    {
      name: "instituicaoUnidade_id",
      label: "Instituição / unidade",
      type: "select",
      required: !editing,
      lookup: instituicaoLookup,
      placeholder: "Selecione a instituição",
      initial: maquina?.instituicaoUnidade?.id ?? "",
      full: true,
    },
  ];
}
