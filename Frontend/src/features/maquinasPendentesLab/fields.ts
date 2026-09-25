import type { FormField } from "@/components/data/EntityForm";
import type { MaquinasPendentesLabProps } from "@/lib/getMaquinasPendentesLab.type";
import { equipamentoLookup, instituicaoLookup } from "@/features/equipamentos/fields";

const statusLookup = { endpoint: "/liststatusMaquinasPendentesLab" };

/** Same payload keys on create (POST) and edit (PATCH). */
export function maquinaPendenteLabFields(maquina?: MaquinasPendentesLabProps): FormField[] {
  return [
    {
      name: "equipamento_id",
      label: "Equipamento",
      type: "select",
      required: true,
      lookup: equipamentoLookup,
      placeholder: "Selecione o equipamento",
      initial: maquina?.equipamento?.id ?? "",
      full: true,
    },
    {
      name: "numeroDeSerie",
      label: "Número de série",
      required: true,
      placeholder: "Número de série",
      initial: maquina?.numeroDeSerie,
    },
    { name: "ssd", label: "SSD", required: true, placeholder: "Possui SSD? (Sim/Não)", initial: maquina?.ssd },
    { name: "idDaOs", label: "ID da OS", required: true, placeholder: "ID da OS", initial: maquina?.idDaOs },
    {
      name: "statusMaquinasPendentesLab_id",
      label: "Status",
      type: "select",
      required: true,
      lookup: statusLookup,
      placeholder: "Selecione o status",
      initial: maquina?.statusMaquinasPendentesLab?.id ?? "",
    },
    {
      name: "instituicaoUnidade_id",
      label: "Instituição / unidade",
      type: "select",
      required: true,
      lookup: instituicaoLookup,
      placeholder: "Selecione a instituição",
      initial: maquina?.instituicaoUnidade?.id ?? "",
      full: true,
    },
    {
      name: "obs",
      label: "Observações",
      type: "textarea",
      required: !maquina,
      placeholder: "Observações",
      initial: maquina?.obs,
    },
  ];
}
