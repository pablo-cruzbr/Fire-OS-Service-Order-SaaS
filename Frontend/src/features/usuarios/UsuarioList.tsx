"use client";

import { TbUsersGroup } from "react-icons/tb";
import { CellTitle, EntityList } from "@/components/data/EntityList";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatDateTime } from "@/lib/format";
import type { UsuariosProps, UsuariosPropsResponse } from "@/lib/getUsuario.type";

function vinculo(usuario: UsuariosProps) {
  return usuario.cliente?.name ?? usuario.instituicaoUnidade?.name ?? null;
}

export default function UsuarioList({ data }: { data: UsuariosPropsResponse }) {
  const { openModal } = useGlobalModal();
  const usuarios = data.controles ?? [];

  return (
    <EntityList<UsuariosProps>
      title="Usuários"
      description="Usuários cadastrados na plataforma."
      breadcrumbs={[{ label: "Administração" }, { label: "Usuários" }]}
      items={usuarios}
      rowKey={(usuario) => usuario.id}
      stats={[
        { label: "Usuários cadastrados", value: data.total ?? usuarios.length, tone: "primary", icon: <TbUsersGroup /> },
      ]}
      search={{
        placeholder: "Buscar nome, e-mail, empresa ou instituição...",
        text: (usuario) => [usuario.name, usuario.email, usuario.cliente?.name, usuario.instituicaoUnidade?.name],
      }}
      filters={[
        {
          label: "Vínculo",
          options: [
            { value: "cliente", label: "Clientes" },
            { value: "instituicao", label: "Instituições" },
          ],
          match: (usuario, value) =>
            value === "cliente" ? Boolean(usuario.cliente?.name) : Boolean(usuario.instituicaoUnidade?.name),
        },
      ]}
      columns={[
        { header: "Usuário", cell: (usuario) => <CellTitle title={usuario.name} subtitle={usuario.email} /> },
        { header: "Setor", cell: (usuario) => usuario.setor?.name ?? "Sem setor" },
        { header: "Empresa / instituição", cell: (usuario) => vinculo(usuario) ?? "—" },
        { header: "Cadastrado em", cell: (usuario) => formatDateTime(usuario.created_at), className: "whitespace-nowrap" },
      ]}
      add={{ href: "/signup_empresa", label: "Novo usuário" }}
      onOpen={(usuario) => openModal("usuarios", usuario)}
      emptyMessage="Nenhum usuário cadastrado."
    />
  );
}
