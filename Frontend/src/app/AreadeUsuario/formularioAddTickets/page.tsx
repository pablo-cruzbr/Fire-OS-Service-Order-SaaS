"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { TbBuilding, TbSend, TbUser, TbUsers } from "react-icons/tb";
import { api } from "@/services/api";
import { apiErrorMessage } from "@/lib/apiError";
import { toArray } from "@/lib/toArray";
import type { JwtPayload } from "@/lib/JWTpayload.type";
import type { UsuariosProps } from "@/lib/getUsuario.type";
import { UserPortalShell } from "@/components/auth/UserPortalShell";
import { Button, Card, CardHeader, Field, Input, Select, Textarea } from "@/components/ui";

type Option = { id: string; name: string };

// "Ticket" type of service order — chamados opened by end users are always tickets.
const TIPO_OS_TICKET = "94e32deb-2a02-41f1-9573-b4b5c265e80a";

function gerarNumeroOS() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

function userIdFromToken() {
  const token = getCookie("session");
  if (typeof token !== "string") return undefined;
  try {
    return jwtDecode<JwtPayload>(token).sub;
  } catch {
    return undefined;
  }
}

export default function FormularioAddTickets() {
  const router = useRouter();
  const [tipos, setTipos] = useState<Option[]>([]);
  const [usuario, setUsuario] = useState<UsuariosProps | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api
      .get("/listtipodechamado")
      .then((response) => setTipos(toArray<Option>(response.data)))
      .catch(() => toast.error("Não foi possível carregar os tipos de chamado."));
    api
      .get("/users/detail")
      .then((response) => setUsuario(response.data as UsuariosProps))
      .catch(() => undefined);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = new FormData(event.currentTarget);
    const text = (key: string) => form.get(key)?.toString().trim() ?? "";

    const user_id = usuario?.id ?? userIdFromToken();
    if (!user_id) {
      toast.error("Sessão expirada. Faça login novamente.");
      router.push("/AreadeUsuario");
      return;
    }

    const payload: Record<string, unknown> = {
      numeroOS: gerarNumeroOS(),
      name: text("name"),
      tipodeChamado_id: text("tipodeChamado_id"),
      tipodeOrdemdeServico_id: TIPO_OS_TICKET,
      descricaodoProblemaouSolicitacao: text("descricaodoProblemaouSolicitacao"),
      patrimoniodoequipamento: text("patrimoniodoequipamento"),
      nomedoContatoaserProcuradonoLocal: text("nomedoContatoaserProcuradonoLocal") || null,
      user_id,
    };
    if (usuario?.cliente?.id) payload.cliente_id = usuario.cliente.id;
    if (usuario?.instituicaoUnidade?.id) payload.instituicaoUnidade_id = usuario.instituicaoUnidade.id;
    if (usuario?.tecnico?.id) payload.tecnico_id = usuario.tecnico.id;

    setSending(true);
    try {
      await api.post("/ordemdeservico", payload);
      router.push("/AreadeUsuario/formularioenviado");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Erro ao enviar. Verifique os campos e tente novamente."));
      setSending(false);
    }
  }

  const local = usuario?.instituicaoUnidade?.name ?? usuario?.cliente?.name;

  return (
    <UserPortalShell>
      <div className="relative mb-6 overflow-hidden rounded-xl bg-lightprimary px-6 py-7 sm:px-8">
        <div className="relative z-10">
          <h1 className="text-2xl font-semibold text-link">
            {usuario ? `Olá, ${usuario.name.split(" ")[0]}!` : "Bem-vindo ao Ordem Next"}
          </h1>
          <p className="mt-2 max-w-xl text-bodytext">
            Descreva o problema abaixo e nossa equipe técnica entrará em contato para o atendimento.
          </p>
        </div>
        <div aria-hidden className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-primary/10" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Nova ordem de serviço" subtitle="Campos com * são obrigatórios." />
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Nome do solicitante" htmlFor="name" required>
              <Input id="name" name="name" placeholder="Nome completo" required defaultValue={usuario?.name} key={usuario?.id} />
            </Field>
            <Field label="Tipo de chamado" htmlFor="tipodeChamado_id" required>
              <Select id="tipodeChamado_id" name="tipodeChamado_id" required defaultValue="">
                <option value="" disabled>
                  {tipos.length ? "Selecione" : "Carregando..."}
                </option>
                {tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Descrição do problema ou solicitação" htmlFor="descricao" required className="md:col-span-2">
              <Textarea
                id="descricao"
                name="descricaodoProblemaouSolicitacao"
                rows={5}
                placeholder="Descreva o problema com o máximo de detalhes possível..."
                required
              />
            </Field>
            <Field label="Patrimônio do equipamento" htmlFor="patrimonio" required hint="Número da etiqueta de patrimônio.">
              <Input id="patrimonio" name="patrimoniodoequipamento" placeholder="Ex.: 56971" required />
            </Field>
            <Field label="Contato no local" htmlFor="contato" hint="Opcional — quem o técnico deve procurar.">
              <Input id="contato" name="nomedoContatoaserProcuradonoLocal" placeholder="Nome do contato" />
            </Field>
            <div className="flex justify-end border-t border-border pt-5 md:col-span-2">
              <Button type="submit" size="lg" loading={sending} icon={<TbSend className="h-4 w-4" />}>
                Enviar chamado
              </Button>
            </div>
          </form>
        </Card>

        <Card className="h-fit">
          <CardHeader title="Seus dados" subtitle="Vinculados automaticamente ao chamado." />
          <ul className="flex flex-col gap-4">
            {[
              { icon: <TbUser />, label: "Usuário", value: usuario?.name },
              { icon: <TbUsers />, label: "Setor", value: usuario?.setor?.name },
              { icon: <TbBuilding />, label: "Local", value: local },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-lightprimary text-lg text-primary">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className="truncate text-sm font-medium text-link">{item.value ?? "—"}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </UserPortalShell>
  );
}
