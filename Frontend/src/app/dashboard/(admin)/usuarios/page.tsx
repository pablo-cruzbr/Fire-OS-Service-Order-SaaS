import { serverGet } from "@/lib/serverApi";
import type { UsuariosProps, UsuariosPropsResponse } from "@/lib/getUsuario.type";
import UsuarioList from "@/features/usuarios/UsuarioList";

export const dynamic = "force-dynamic";

type ListUsersResponse = {
  users?: UsuariosProps[];
  controles?: UsuariosProps[];
  total?: number;
  count?: number;
};

export default async function UsuariosPage() {
  const response = await serverGet<ListUsersResponse>("/listusers", {});
  const usuarios = response.users ?? response.controles ?? [];
  const data: UsuariosPropsResponse = {
    controles: usuarios,
    total: response.total ?? response.count ?? usuarios.length,
  };
  return <UsuarioList data={data} />;
}
