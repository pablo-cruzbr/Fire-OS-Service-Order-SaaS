"use client";

import { TbCircleCheck, TbShoppingCart, TbTruckDelivery, TbHourglass } from "react-icons/tb";
import { CellTitle, EntityList, optionsFrom } from "@/components/data/EntityList";
import { StatusBadge } from "@/components/ui";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { relationName } from "@/lib/status";
import type { ComprasProps, ComprasResponse } from "@/lib/getCompras.type";

export default function ComprasList({ data }: { data: ComprasResponse }) {
  const { openModal } = useGlobalModal();

  return (
    <EntityList<ComprasProps>
      title="Compras"
      breadcrumbs={[{ label: "Controles" }, { label: "Compras" }]}
      items={data.controles}
      rowKey={(compra) => compra.id}
      stats={[
        { label: "Total", value: data.total, tone: "primary", icon: <TbShoppingCart /> },
        { label: "Aguardando compra", value: data.totalAguardandoCompra, tone: "warning", icon: <TbHourglass /> },
        { label: "Aguardando entrega", value: data.totalAguardandoEntrega, tone: "secondary", icon: <TbTruckDelivery /> },
        { label: "Compra finalizada", value: data.totalCompraFinalizada, tone: "success", icon: <TbCircleCheck /> },
      ]}
      search={{
        placeholder: "Buscar item ou solicitante...",
        text: (compra) => [compra.itemSolicitado, compra.solicitante],
      }}
      filters={[
        {
          label: "Status",
          options: (items) => optionsFrom(items, (compra) => relationName(compra.statusCompras, "")),
          match: (compra, value) => relationName(compra.statusCompras) === value,
        },
      ]}
      columns={[
        {
          header: "Item",
          cell: (compra) => <CellTitle title={compra.itemSolicitado} subtitle={compra.motivoDaSolicitacao} />,
        },
        { header: "Solicitante", cell: (compra) => compra.solicitante },
        { header: "Preço", cell: (compra) => formatCurrency(compra.preco), className: "whitespace-nowrap" },
        { header: "Status", cell: (compra) => <StatusBadge status={relationName(compra.statusCompras, "")} /> },
        { header: "Data", cell: (compra) => formatDateTime(compra.created_at), className: "whitespace-nowrap" },
      ]}
      add={{ href: "/dashboard/compras/formularioCompras", label: "Fazer um pedido" }}
      onOpen={(compra) => openModal("compras", compra)}
      remove={{
        request: (compra) => ({
          url: `/deletedesolicitacaodecompras/${compra.id}`,
          params: { compra_id: compra.id },
        }),
        describe: (compra) => compra.itemSolicitado,
      }}
      emptyMessage="Nenhuma solicitação de compra ainda."
    />
  );
}
