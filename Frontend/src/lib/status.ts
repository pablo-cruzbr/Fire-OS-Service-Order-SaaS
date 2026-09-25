export type Tone = "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

/** Picks a badge colour from a free-text status name coming from the API. */
export function statusTone(name?: string | null): Tone {
  if (!name) return "neutral";
  const status = normalize(name);

  if (/(CONCLU|FINALIZ|ENTREGUE|RESOLVID|ATIV|DISPONIVEL|OK\b|APROVAD|PRONTO)/.test(status)) return "success";
  if (/(CANCEL|RECUS|DEFEIT|INATIV|ERRO|URGENTE|ALTA|CRITIC|REPROV)/.test(status)) return "error";
  if (/(ANDAMENTO|DESLOCAMENTO|REPARO|EM USO|EXECU)/.test(status)) return "primary";
  if (/(AGUARD|PENDENT|ABERT|RESERV|MEDIA|ANALISE)/.test(status)) return "warning";
  if (/(BAIXA)/.test(status)) return "info";
  return "secondary";
}

/** Relations sometimes arrive as `{ name }` and sometimes as a plain string. */
export function relationName(value: unknown, fallback = "—"): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "name" in value && typeof value.name === "string") return value.name;
  return fallback;
}
