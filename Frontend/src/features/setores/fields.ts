import type { FormField } from "@/components/data/EntityForm";

/** POST /categorysetor. There is no update route for setores, so no edit modal. */
export function setorFields(): FormField[] {
  return [{ name: "name", label: "Nome do setor", required: true, full: true, placeholder: "Ex.: Financeiro" }];
}
