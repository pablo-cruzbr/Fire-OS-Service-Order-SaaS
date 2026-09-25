"use client";

import { TbSitemap } from "react-icons/tb";
import { EntityList } from "@/components/data/EntityList";
import type { SetoresProps } from "@/lib/getSetores.type";

export default function SetoresList({ data }: { data: SetoresProps[] }) {
  return (
    <EntityList<SetoresProps>
      title="Setores"
      breadcrumbs={[{ label: "Cadastros" }, { label: "Setores" }]}
      items={data}
      rowKey={(setor) => setor.id}
      stats={[{ label: "Total de setores", value: data.length, tone: "primary", icon: <TbSitemap /> }]}
      search={{ placeholder: "Buscar setor...", text: (setor) => [setor.name] }}
      columns={[{ header: "Setor", cell: (setor) => <span className="font-semibold text-link">{setor.name}</span> }]}
      add={{ href: "/dashboard/formulariosadd/formularioSetores", label: "Novo setor" }}
      remove={{
        request: (setor) => ({ url: "/deletesetor", params: { setor_id: setor.id } }),
        describe: (setor) => setor.name,
      }}
      emptyMessage="Nenhum setor cadastrado."
    />
  );
}
