"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { documentacaoFields } from "@/features/documentacaoTecnica/fields";

export default function FormularioDocumentacaoTecnica() {
  const router = useRouter();

  return (
    <FormPage
      title="Nova documentação técnica"
      backHref="/dashboard/documentacaoTecnica"
      backLabel="Documentação técnica"
    >
      <EntityForm
        fields={documentacaoFields()}
        request={{ method: "post", url: "/documentacaotecnica" }}
        submitLabel="Salvar documentação"
        successMessage="Documentação criada!"
        onSuccess={() => router.push("/dashboard/documentacaoTecnica")}
      />
    </FormPage>
  );
}
