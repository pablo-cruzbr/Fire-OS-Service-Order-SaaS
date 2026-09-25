import { FormPage } from "@/components/data/FormPage";
import { getSessionUser } from "@/lib/session";
import { OrdemForm } from "@/features/ordens/OrdemForm";

export const dynamic = "force-dynamic";

export default async function FormularioOrdemdeServicoPage() {
  const user = await getSessionUser();

  return (
    <FormPage title="Nova ordem de serviço" backHref="/dashboard/tickets" backLabel="Chamados" cardTitle="Dados da OS">
      <OrdemForm userId={user?.id ?? ""} />
    </FormPage>
  );
}
