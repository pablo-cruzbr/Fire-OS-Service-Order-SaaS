"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { clienteCreateFields } from "@/features/clientes/fields";

export default function FormularioClientesPrivados() {
  const router = useRouter();

  return (
    <FormPage title="Novo cliente privado" backHref="/dashboard/clientesprivados" backLabel="Clientes privados">
      <EntityForm
        fields={clienteCreateFields()}
        request={{ method: "post", url: "/categorycliente" }}
        submitLabel="Cadastrar cliente"
        successMessage="Cliente cadastrado!"
        onSuccess={() => router.push("/dashboard/clientesprivados")}
      />
    </FormPage>
  );
}
