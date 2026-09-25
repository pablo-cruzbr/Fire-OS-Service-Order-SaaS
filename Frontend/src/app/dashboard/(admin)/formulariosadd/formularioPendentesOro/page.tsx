"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { maquinaPendenteOroFields } from "@/features/maquinasPendentesOro/fields";

export default function FormularioPendentesOro() {
  const router = useRouter();

  return (
    <FormPage title="Nova máquina pendente ORO" backHref="/dashboard/controles/pendentesOro" backLabel="Pendentes ORO">
      <EntityForm
        fields={maquinaPendenteOroFields()}
        request={{ method: "post", url: "/controledemaquinaspendentesoro" }}
        submitLabel="Cadastrar"
        successMessage="Máquina pendente cadastrada!"
        onSuccess={() => router.push("/dashboard/controles/pendentesOro")}
      />
    </FormPage>
  );
}
