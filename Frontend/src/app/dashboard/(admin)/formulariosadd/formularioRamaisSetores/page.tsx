"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { ramalSetorFields } from "@/features/ramaisSetores/fields";

export default function FormularioRamaisSetores() {
  const router = useRouter();

  return (
    <FormPage title="Novo ramal" backHref="/dashboard/ramaisSetores" backLabel="Ramais e setores">
      <EntityForm
        fields={ramalSetorFields()}
        request={{ method: "post", url: "/informacoessetor" }}
        submitLabel="Cadastrar ramal"
        successMessage="Ramal cadastrado!"
        onSuccess={() => router.push("/dashboard/ramaisSetores")}
      />
    </FormPage>
  );
}
