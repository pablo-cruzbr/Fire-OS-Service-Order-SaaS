import type { FormField } from "@/components/data/EntityForm";
import type { DocumentacaoTecnicaProps } from "@/lib/getDocumentacaoTecnica.type";

const tecnicosLookup = { endpoint: "/listtecnico" };
const clientesLookup = { endpoint: "/listcliente" };
const instituicoesLookup = { endpoint: "/listinstuicao" };

/**
 * Shared by the create page (POST /documentacaotecnica) and the edit modal
 * (PATCH /documentacaotecnica/update/:id). Optional relations left empty are
 * omitted from the payload — the API validates them as optional uuids and
 * rejects both null and "".
 */
export function documentacaoFields(doc?: DocumentacaoTecnicaProps): FormField[] {
  return [
    { name: "titulo", label: "Título", required: true, initial: doc?.titulo, full: true },
    {
      name: "descricao",
      label: "Descrição",
      type: "textarea",
      required: true,
      placeholder: "Adicione suas anotações",
      initial: doc?.descricao,
    },
    {
      name: "tecnico_id",
      label: "Técnico",
      type: "select",
      required: true,
      lookup: tecnicosLookup,
      initial: doc?.tecnico?.id,
    },
    {
      name: "cliente_id",
      label: "Cliente",
      type: "select",
      placeholder: "Nenhum (opcional)",
      lookup: clientesLookup,
      initial: doc?.cliente?.id,
    },
    {
      name: "instituicaoUnidade_id",
      label: "Instituição / unidade",
      type: "select",
      placeholder: "Nenhuma (opcional)",
      lookup: instituicoesLookup,
      initial: doc?.instituicaoUnidade?.id,
    },
  ];
}
