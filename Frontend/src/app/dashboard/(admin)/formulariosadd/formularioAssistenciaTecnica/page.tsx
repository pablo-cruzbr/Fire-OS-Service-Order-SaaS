"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { assistenciaTecnicaFields } from "@/features/assistenciaTecnica/fields";

export default function FormularioAssistenciaTecnica() {
  const router = useRouter();

  return (
    <FormPage
      title="Nova assistência técnica"
      backHref="/dashboard/controles/assistenciaTecnica"
      backLabel="Assistência técnica"
    >
      <EntityForm
        fields={assistenciaTecnicaFields()}
        request={{ method: "post", url: "/controledeassistenciatecnica" }}
        submitLabel="Enviar solicitação"
        successMessage="Assistência técnica registrada!"
        onSuccess={() => router.push("/dashboard/controles/assistenciaTecnica")}
      />
    </FormPage>
  );
}
