import { TbCircleCheck, TbPlus } from "react-icons/tb";
import { UserPortalShell } from "@/components/auth/UserPortalShell";
import { ButtonLink, Card } from "@/components/ui";

export default function FormularioEnviado() {
  return (
    <UserPortalShell>
      <Card className="mx-auto max-w-lg py-12 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lightsuccess text-3xl text-successtext">
          <TbCircleCheck />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-link">Chamado enviado!</h1>
        <p className="mx-auto mt-2 max-w-sm text-bodytext">
          Recebemos sua solicitação e em breve entraremos em contato para o atendimento. Obrigado!
        </p>
        <ButtonLink href="/AreadeUsuario/formularioAddTickets" className="mt-8" icon={<TbPlus className="h-4 w-4" />}>
          Abrir outro chamado
        </ButtonLink>
      </Card>
    </UserPortalShell>
  );
}
