import { FormPage } from "@/components/data/FormPage";
import { getSessionUser } from "@/lib/session";
import { TicketForm } from "@/features/ordens/TicketForm";

export const dynamic = "force-dynamic";

export default async function FormularioTicketPage() {
  const user = await getSessionUser();

  return (
    <FormPage
      title="Novo ticket"
      backHref="/dashboard/tickets"
      backLabel="Chamados"
      cardTitle="Dados do ticket"
      description="Pesquise o usuário pelo nome ou ramal e registre o atendimento."
    >
      <TicketForm userId={user?.id ?? ""} />
    </FormPage>
  );
}
