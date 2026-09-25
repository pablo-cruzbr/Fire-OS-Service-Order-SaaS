"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { tecnicoFields } from "@/features/tecnicos/fields";

export default function FormularioTecnicoAdd() {
  const router = useRouter();

  return (
    <FormPage title="Novo técnico" backHref="/dashboard/controles/tecnicos" backLabel="Técnicos">
      <EntityForm
        fields={tecnicoFields()}
        request={{ method: "post", url: "/tecnico" }}
        columns={1}
        submitLabel="Cadastrar"
        successMessage="Técnico cadastrado!"
        onSuccess={() => router.push("/dashboard/controles/tecnicos")}
      />
    </FormPage>
  );
}
