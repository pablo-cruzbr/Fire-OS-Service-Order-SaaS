"use client";

import { useState } from "react";
import { EntityForm } from "@/components/data/EntityForm";
import { FormPage } from "@/components/data/FormPage";
import { clienteMunicipalFields } from "@/features/clientesMunicipais/fields";

export default function FormularioClientesMunicipais() {
  // The old page stayed here after saving and cleared the form, so several
  // institutions can be registered in a row. Remounting the form resets it.
  const [formKey, setFormKey] = useState(0);

  return (
    <FormPage title="Novo cliente municipal" backHref="/dashboard/clientesMunicipais" backLabel="Clientes municipais">
      <EntityForm
        key={formKey}
        fields={clienteMunicipalFields()}
        request={{ method: "post", url: "/categoryintituicao" }}
        submitLabel="Cadastrar instituição"
        successMessage="Cliente municipal cadastrado com sucesso!"
        onSuccess={() => setFormKey((key) => key + 1)}
      />
    </FormPage>
  );
}
