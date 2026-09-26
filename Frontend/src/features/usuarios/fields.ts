import type { FormField } from "@/components/data/EntityForm";
import type { UsuariosProps } from "@/lib/getUsuario.type";

const setoresLookup = { endpoint: "/listsetores" };
const clientesLookup = { endpoint: "/listcliente" };
const instituicoesLookup = { endpoint: "/listinstuicao" };

/**
 * Edit modal only (PATCH /user/update/:id). New users are created through
 * /signup_empresa and /signup_instituicao.
 *
 * Empty selects are left out of the payload: the API validates these ids as
 * optional uuids and rejects null (the old form sent null and always got 400).
 */
export function usuarioEditFields(usuario: UsuariosProps): FormField[] {
  return [
    { name: "name", label: "Nome do usuário", required: true, initial: usuario.name },
    { name: "email", label: "E-mail", type: "email", required: true, initial: usuario.email },
    {
      name: "setor_id",
      label: "Setor",
      type: "select",
      placeholder: "Selecione um setor",
      lookup: setoresLookup,
      initial: usuario.setor?.id,
    },
    {
      name: "cliente_id",
      label: "Cliente / empresa",
      type: "select",
      placeholder: "Selecione um cliente",
      lookup: clientesLookup,
      initial: usuario.cliente?.id,
    },
    {
      name: "instituicaoUnidade_id",
      label: "Instituição / unidade",
      type: "select",
      placeholder: "Selecione uma instituição",
      lookup: instituicoesLookup,
      initial: usuario.instituicaoUnidade?.id,
      full: true,
    },
  ];
}
