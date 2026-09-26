"use client";

import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { maquinaPendenteLabFields } from "@/features/maquinasPendentesLab/fields";

export default function FormularioPendentesLab() {
  const router = useRouter();

  return (
    <FormPage
      title="Nova máquina pendente no laboratório"
      backHref="/dashboard/controles/pendentesLaboratorio"
      backLabel="Pendentes laboratório"
    >
      <EntityForm
        fields={maquinaPendenteLabFields()}
        request={{ method: "post", url: "/controledemaquinaspendenteslab" }}
        submitLabel="Cadastrar"
        successMessage="Máquina pendente cadastrada!"
        onSuccess={() => router.push("/dashboard/controles/pendentesLaboratorio")}
      />
    </FormPage>
  );
}
