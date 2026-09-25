"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { EntityForm } from "@/components/data/EntityForm";
import { formatDateTime } from "@/lib/format";
import type { UsuariosProps } from "@/lib/getUsuario.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { usuarioEditFields } from "./fields";

export function UsuarioModal({ data: usuario, onClose }: EntityModalProps<UsuariosProps>) {
  return (
    <DetailModal
      title={usuario.name}
      subtitle={usuario.email}
      onClose={onClose}
      fields={[
        { label: "E-mail", value: usuario.email },
        { label: "Setor", value: usuario.setor?.name },
        { label: "Empresa / cliente", value: usuario.cliente?.name },
        { label: "Vínculo unidade", value: usuario.instituicaoUnidade?.name ?? "Nenhum vínculo" },
        { label: "Técnico responsável", value: usuario.tecnico?.name ?? "Não atribuído" },
        { label: "Cadastrado em", value: formatDateTime(usuario.created_at) },
        {
          label: "Localização",
          value: usuario.cliente?.endereco ?? usuario.instituicaoUnidade?.endereco,
          full: true,
        },
      ]}
      renderEdit={(done, cancel) => (
        <EntityForm
          fields={usuarioEditFields(usuario)}
          request={{ method: "patch", url: `/user/update/${usuario.id}` }}
          submitLabel="Salvar alterações"
          successMessage="Usuário atualizado!"
          onSuccess={done}
          onCancel={cancel}
        />
      )}
    />
  );
}
