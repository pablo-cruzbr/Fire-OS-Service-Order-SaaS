"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { novoEstabilizadorFields } from "@/features/estabilizadores/fields";

export default function FormularioEstabilizadorAdd() {
  const router = useRouter();

  return (
    <FormPage
      title="Cadastro de estabilizador"
      description="Registra um novo aparelho para ser usado nos controles de estabilizadores."
      backHref="/dashboard/controles/estabilizadores"
      backLabel="Estabilizadores"
    >
      <EntityForm
        fields={novoEstabilizadorFields()}
        request={{ method: "post", url: "/equipamento/esbilizadores" }}
        submitLabel="Cadastrar"
        successMessage="Estabilizador cadastrado!"
        onSuccess={() => router.push("/dashboard/controles/estabilizadores")}
      />
    </FormPage>
  );
}
