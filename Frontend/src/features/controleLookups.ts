import type { Lookup } from "@/components/data/useLookups";

/** Lookups shared by the "controles" forms (assistência, laudo, laboratório, estabilizadores). */

/** Equipments are shown as "patrimônio - nome", like the old selects. */
export const equipamentoLookup: Lookup = {
  endpoint: "/listequipamento",
  map: (row) => ({ value: String(row.id), label: `${row.patrimonio ?? "—"} - ${row.name ?? ""}` }),
};

export const instituicaoLookup: Lookup = { endpoint: "/listinstuicao" };
export const tecnicoLookup: Lookup = { endpoint: "/listtecnico" };
export const clienteLookup: Lookup = { endpoint: "/listcliente" };
