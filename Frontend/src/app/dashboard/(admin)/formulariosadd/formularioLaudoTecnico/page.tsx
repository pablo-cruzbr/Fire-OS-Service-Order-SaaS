"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { laudoTecnicoFields } from "@/features/laudoTecnico/fields";

export default function FormularioLaudoTecnico() {
  const router = useRouter();

  return (
    <FormPage title="Novo laudo técnico" backHref="/dashboard/controles/laudoTecnico" backLabel="Laudo técnico">
      <EntityForm
        fields={laudoTecnicoFields()}
        request={{ method: "post", url: "/controledelaudotecnico" }}
        submitLabel="Enviar solicitação"
        successMessage="Laudo técnico registrado!"
        onSuccess={() => router.push("/dashboard/controles/laudoTecnico")}
      />
    </FormPage>
  );
}
