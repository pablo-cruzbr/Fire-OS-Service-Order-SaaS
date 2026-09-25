"use client";

import { TbBuilding, TbBuildingCommunity, TbPhone } from "react-icons/tb";
import { CellTitle, EntityList } from "@/components/data/EntityList";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import type { RamaisSetoresProps } from "@/lib/getRamaisSetores.type";

function vinculo(ramal: RamaisSetoresProps) {
  return ramal.cliente?.name ?? ramal.instituicaoUnidade?.name ?? null;
}

export default function RamaisSetoresList({ data }: { data: RamaisSetoresProps[] }) {
  const { openModal } = useGlobalModal();

  return (
    <EntityList<RamaisSetoresProps>
      title="Ramais e setores"
      breadcrumbs={[{ label: "Cadastros" }, { label: "Ramais e setores" }]}
      items={data}
      rowKey={(ramal) => ramal.id}
      stats={[
        { label: "Total de ramais", value: data.length, tone: "primary", icon: <TbPhone /> },
        {
          label: "De clientes",
          value: data.filter((ramal) => ramal.cliente?.name).length,
          tone: "secondary",
          icon: <TbBuilding />,
        },
        {
          label: "De instituições",
          value: data.filter((ramal) => ramal.instituicaoUnidade?.name).length,
          tone: "success",
          icon: <TbBuildingCommunity />,
        },
      ]}
      search={{
        placeholder: "Buscar usuário, ramal ou setor...",
        text: (ramal) => [ramal.usuario, ramal.ramal, ramal.setor?.name, vinculo(ramal)],
      }}
      filters={[
        {
          label: "Vínculo",
          options: [
            { value: "cliente", label: "Apenas clientes" },
            { value: "instituicao", label: "Apenas instituições" },
          ],
          match: (ramal, value) =>
            value === "cliente" ? Boolean(ramal.cliente?.name) : Boolean(ramal.instituicaoUnidade?.name),
        },
      ]}
      columns={[
        { header: "Usuário", cell: (ramal) => <CellTitle title={ramal.usuario} subtitle={ramal.andar} /> },
        { header: "Ramal", cell: (ramal) => ramal.ramal, className: "whitespace-nowrap" },
        { header: "Setor", cell: (ramal) => ramal.setor?.name ?? "—" },
        { header: "Cliente / instituição", cell: (ramal) => vinculo(ramal) ?? "—" },
      ]}
      add={{ href: "/dashboard/formulariosadd/formularioRamaisSetores", label: "Novo ramal" }}
      onOpen={(ramal) => openModal("ramaisSetores", ramal)}
      emptyMessage="Nenhum ramal cadastrado."
    />
  );
}
