import type { FormField } from "@/components/data/EntityForm";
import type { Lookup } from "@/components/data/useLookups";
import type { EquipamentoProps } from "@/lib/getEquipamento.type";

/** Equipment options shown as "patrimônio - nome" (also used by the pendentes forms). */
export const equipamentoLookup: Lookup = {
  endpoint: "/listequipamento",
  map: (row) => ({ value: String(row.id), label: `${row.patrimonio ?? "—"} - ${row.name ?? ""}` }),
};

export const instituicaoLookup: Lookup = { endpoint: "/listinstuicao" };

const tipoLookup: Lookup = {
  endpoint: "/list/tipo/equipamento",
  unwrap: (data) => (Array.isArray(data) ? data : Array.isArray(data?.tipos) ? data.tipos : []),
};

/**
 * Create sends `{ name, patrimonio, instituicaoUnidade_id }`; edit also sends
 * `tipodeEquipamento_id`.
 */
export function equipamentoFields(equipamento?: EquipamentoProps): FormField[] {
  const fields: FormField[] = [
    {
      name: "name",
      label: "Nome do equipamento",
      required: true,
      placeholder: "Ex.: Notebook Dell Latitude",
      initial: equipamento?.name,
    },
    {
      name: "patrimonio",
      label: "Patrimônio",
      required: true,
      placeholder: "Número do patrimônio",
      initial: equipamento?.patrimonio,
    },
    {
      name: "instituicaoUnidade_id",
      label: "Instituição / unidade",
      type: "select",
      required: !equipamento,
      lookup: instituicaoLookup,
      placeholder: "Selecione a unidade",
      initial: equipamento?.instituicaoUnidade?.id ?? "",
    },
  ];

  if (equipamento) {
    fields.push({
      name: "tipodeEquipamento_id",
      label: "Tipo do equipamento",
      type: "select",
      lookup: tipoLookup,
      placeholder: "Selecione o tipo",
      initial: equipamento.tipodeEquipamento?.id ?? "",
    });
  }

  return fields;
}
