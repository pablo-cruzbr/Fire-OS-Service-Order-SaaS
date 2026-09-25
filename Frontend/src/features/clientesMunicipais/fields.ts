import type { FormField } from "@/components/data/EntityForm";
import type { ClientesMunicipaisProps } from "@/lib/getClientesMunicipais.type";

const tiposLookup = { endpoint: "/listtipodeinstituicaounidade" };

/** Shared by the "nova instituição" page (POST /categoryintituicao) and the edit modal. */
export function clienteMunicipalFields(instituicao?: ClientesMunicipaisProps): FormField[] {
  return [
    { name: "name", label: "Nome da instituição / unidade", required: true, initial: instituicao?.name, full: true },
    { name: "endereco", label: "Endereço", required: true, initial: instituicao?.endereco, full: true },
    {
      name: "telefone",
      label: "Telefone",
      type: "tel",
      // the create form always required it; on edit the API treats it as optional
      required: !instituicao,
      placeholder: "(11) 0000-0000",
      initial: instituicao?.telefone,
    },
    {
      name: "tipodeInstituicaoUnidade_id",
      label: "Tipo de instituição",
      type: "select",
      required: true,
      lookup: tiposLookup,
      initial: instituicao?.tipodeinstituicaoUnidade?.id,
    },
  ];
}
