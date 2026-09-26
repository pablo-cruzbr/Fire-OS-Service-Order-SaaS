import type { FormField } from "@/components/data/EntityForm";

/** Create only: the API has no update route for técnicos. */
export function tecnicoFields(): FormField[] {
  return [{ name: "name", label: "Nome do técnico", required: true, placeholder: "Nome completo", full: true }];
}
