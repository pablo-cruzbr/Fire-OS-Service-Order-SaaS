"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { controleEstabilizadorFields } from "@/features/estabilizadores/fields";

export default function FormularioControledeEstabilizadores() {
  const router = useRouter();

  return (
    <FormPage
      title="Novo controle de estabilizador"
      backHref="/dashboard/controles/estabilizadores"
      backLabel="Estabilizadores"
    >
      <EntityForm
        fields={controleEstabilizadorFields()}
        request={{ method: "post", url: "/controledeestabilizadores" }}
        submitLabel="Enviar solicitação"
        successMessage="Solicitação enviada com sucesso!"
        onSuccess={() => router.push("/dashboard/controles/estabilizadores")}
      />
    </FormPage>
  );
}
