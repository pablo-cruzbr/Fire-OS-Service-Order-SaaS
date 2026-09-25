"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { laboratorioFields } from "@/features/laboratorio/fields";

export default function FormularioLaboratorio() {
  const router = useRouter();

  return (
    <FormPage title="Novo registro de laboratório" backHref="/dashboard/controles/laboratorio" backLabel="Laboratório">
      <EntityForm
        fields={laboratorioFields()}
        request={{ method: "post", url: "/controledelaboratorio" }}
        submitLabel="Enviar solicitação"
        successMessage="Registro de laboratório criado!"
        onSuccess={() => router.push("/dashboard/controles/laboratorio")}
      />
    </FormPage>
  );
}
