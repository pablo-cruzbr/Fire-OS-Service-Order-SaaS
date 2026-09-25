import type { FormField } from "@/components/data/EntityForm";
import type { ComprasProps } from "@/lib/getCompras.type";

const statusLookup = { endpoint: "/liststatuscompras" };

function statusId(compra?: ComprasProps) {
  const status = compra?.statusCompras;
  return typeof status === "object" && status && "id" in status ? String((status as { id: string }).id) : "";
}

/** Fields shared by the "nova compra" page and the edit modal. */
export function compraFields(compra?: ComprasProps): FormField[] {
  return [
    { name: "itemSolicitado", label: "Item solicitado", required: true, initial: compra?.itemSolicitado, full: true },
    { name: "solicitante", label: "Solicitante", required: true, initial: compra?.solicitante },
    {
      name: "preco",
      label: "Preço (R$)",
      type: "number",
      step: "0.01",
      required: true,
      initial: compra?.preco,
    },
    {
      name: "motivoDaSolicitacao",
      label: "Motivo da solicitação",
      type: "textarea",
      required: true,
      initial: compra?.motivoDaSolicitacao,
    },
    {
      name: "linkDeCompra",
      label: "Link de compra",
      type: "url",
      required: true,
      placeholder: "https://",
      initial: compra?.linkDeCompra,
      full: true,
    },
    {
      name: "statusCompras_id",
      label: "Status",
      type: "select",
      required: true,
      lookup: statusLookup,
      initial: statusId(compra),
    },
  ];
}
