"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { compraFields } from "@/features/compras/fields";

export default function FormularioCompras() {
  const router = useRouter();

  return (
    <FormPage title="Nova solicitação de compra" backHref="/dashboard/compras" backLabel="Compras">
      <EntityForm
        fields={compraFields()}
        request={{ method: "post", url: "/solicitacaodecompras" }}
        submitLabel="Enviar solicitação"
        successMessage="Solicitação enviada!"
        onSuccess={() => router.push("/dashboard/compras")}
      />
    </FormPage>
  );
}
