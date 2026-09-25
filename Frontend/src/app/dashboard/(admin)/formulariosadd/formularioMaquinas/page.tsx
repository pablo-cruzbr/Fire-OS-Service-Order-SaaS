"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { equipamentoFields } from "@/features/equipamentos/fields";

export default function FormularioMaquinas() {
  const router = useRouter();

  return (
    <FormPage title="Novo equipamento" backHref="/dashboard/controles/equipamentos" backLabel="Equipamentos">
      <EntityForm
        fields={equipamentoFields()}
        request={{ method: "post", url: "/equipamento" }}
        submitLabel="Cadastrar"
        successMessage="Equipamento cadastrado!"
        onSuccess={() => router.push("/dashboard/controles/equipamentos")}
      />
    </FormPage>
  );
}
