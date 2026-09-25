import type { FormField } from "@/components/data/EntityForm";
import type { ClientesProps } from "@/lib/getCliente.type";

/** "Novo cliente" page: the old form only sent name, endereco and cnpj. */
export function clienteCreateFields(): FormField[] {
  return [
    { name: "name", label: "Nome da empresa", required: true, full: true, placeholder: "Ex.: Nome da Empresa Ltda" },
    { name: "endereco", label: "Endereço", required: true, full: true, placeholder: "Rua, número, bairro, cidade - UF" },
    // text, not number: a numeric input drops leading zeros and rejects the mask
    { name: "cnpj", label: "CNPJ", required: true, placeholder: "00.000.000/0000-00" },
  ];
}

/** Edit modal: PATCH /cliente/:id with name, cnpj, endereco and telefone. */
export function clienteEditFields(cliente: ClientesProps): FormField[] {
  return [
    { name: "name", label: "Nome do cliente / razão social", required: true, initial: cliente.name, full: true },
    { name: "cnpj", label: "CNPJ", required: true, placeholder: "00.000.000/0000-00", initial: cliente.cnpj },
    { name: "telefone", label: "Telefone", type: "tel", placeholder: "(11) 0000-0000", initial: cliente.telefone },
    {
      name: "endereco",
      label: "Endereço completo",
      type: "textarea",
      placeholder: "Rua, número, bairro, cidade - UF",
      initial: cliente.endereco,
    },
  ];
}
