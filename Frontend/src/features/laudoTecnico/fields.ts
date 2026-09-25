import type { FormField } from "@/components/data/EntityForm";
import { toDateInput } from "@/lib/format";
import type { LaudoTecnicoProps } from "@/lib/getLaudoTecnico.type";
import { equipamentoLookup, instituicaoLookup, tecnicoLookup } from "@/features/controleLookups";

/** Fields shared by the "novo laudo técnico" page and the edit modal. */
export function laudoTecnicoFields(laudo?: LaudoTecnicoProps): FormField[] {
  const creating = !laudo;

  return [
    { name: "osLab", label: "OS do laboratório", required: true, initial: laudo?.osLab },
    // The old forms used a full date picker for "mês/ano", so the day is kept.
    { name: "mesAno", label: "Data (mês/ano)", type: "date", required: true, initial: toDateInput(laudo?.mesAno) },
    {
      name: "equipamento_id",
      label: "Equipamento",
      type: "select",
      required: creating,
      lookup: equipamentoLookup,
      initial: laudo?.equipamento?.id,
    },
    {
      name: "instituicaoUnidade_id",
      label: "Instituição/unidade",
      type: "select",
      required: true,
      lookup: instituicaoLookup,
      initial: laudo?.instituicaoUnidade?.id,
    },
    {
      name: "tecnico_id",
      label: "Técnico",
      type: "select",
      required: true,
      lookup: tecnicoLookup,
      initial: laudo?.tecnico?.id,
    },
    {
      name: "descricaodoProblema",
      label: "Descrição do problema",
      type: "textarea",
      required: true,
      initial: laudo?.descricaodoProblema,
    },
  ];
}
