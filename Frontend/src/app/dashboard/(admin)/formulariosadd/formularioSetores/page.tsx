"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { setorFields } from "@/features/setores/fields";

export default function FormularioSetores() {
  const router = useRouter();

  return (
    <FormPage title="Novo setor" backHref="/dashboard/setor" backLabel="Setores">
      <EntityForm
        fields={setorFields()}
        request={{ method: "post", url: "/categorysetor" }}
        submitLabel="Cadastrar setor"
        successMessage="Setor cadastrado!"
        columns={1}
        onSuccess={() => router.push("/dashboard/setor")}
      />
    </FormPage>
  );
}
