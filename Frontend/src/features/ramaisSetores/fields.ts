import type { FormField } from "@/components/data/EntityForm";
import type { RamaisSetoresProps } from "@/lib/getRamaisSetores.type";

const setoresLookup = { endpoint: "/listsetores" };
const clientesLookup = { endpoint: "/listcliente" };
const instituicoesLookup = { endpoint: "/listinstuicao" };

/** "Nenhum" is sent as null, which unlinks the relation (the API accepts null). */
const nullable = (value: string) => value || null;

/**
 * Shared by the create page (POST /informacoessetor) and the edit modal
 * (PATCH /informacoessetor/:id). Both send the same keys.
 */
export function ramalSetorFields(ramal?: RamaisSetoresProps): FormField[] {
  return [
    { name: "usuario", label: "Usuário responsável", required: true, initial: ramal?.usuario },
    { name: "ramal", label: "Ramal", required: true, initial: ramal?.ramal },
    { name: "andar", label: "Andar", required: true, initial: ramal?.andar },
    {
      name: "setorId",
      label: "Setor",
      type: "select",
      required: true,
      lookup: setoresLookup,
      initial: ramal?.setor?.id,
    },
    {
      name: "clienteId",
      label: "Cliente",
      type: "select",
      placeholder: "Nenhum cliente",
      lookup: clientesLookup,
      initial: ramal?.cliente?.id,
      serialize: nullable,
    },
    {
      name: "instituicaoUnidadeId",
      label: "Instituição / unidade",
      type: "select",
      placeholder: "Nenhuma instituição",
      lookup: instituicoesLookup,
      initial: ramal?.instituicaoUnidade?.id,
      serialize: nullable,
    },
  ];
}
