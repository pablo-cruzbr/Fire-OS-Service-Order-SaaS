/*
 * Date helpers shared by lists, modals and forms.
 *
 * Date-only fields (retirada, mês/ano...) are sent to the API as noon UTC so
 * they never roll back a day when rendered in Brasília (UTC-3), and are shown
 * with timeZone "UTC" for the same reason.
 */

type DateInput = string | number | Date | null | undefined;

function toDate(value: DateInput) {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 24/09/2026 — for date-only values stored as UTC. */
export function formatDate(value: DateInput, fallback = "—") {
  const date = toDate(value);
  return date ? date.toLocaleDateString("pt-BR", { timeZone: "UTC" }) : fallback;
}

/** 24/09/2026 14:05 — for timestamps such as created_at. */
export function formatDateTime(value: DateInput, fallback = "—") {
  const date = toDate(value);
  return date
    ? date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : fallback;
}

/** 09/2026 — for "mês/ano" fields. */
export function formatMonthYear(value: DateInput, fallback = "—") {
  const date = toDate(value);
  return date
    ? date.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric", timeZone: "UTC" })
    : fallback;
}

/** ISO string → value for <input type="date">. */
export function toDateInput(value: DateInput) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : "";
}

/** ISO string → value for <input type="month">. */
export function toMonthInput(value: DateInput) {
  return toDateInput(value).slice(0, 7);
}

/** <input type="date"> value → ISO string at noon UTC. */
export function fromDateInput(value: string) {
  return value ? `${value.slice(0, 10)}T12:00:00.000Z` : null;
}

/** <input type="month"> value → ISO string on the 1st at noon UTC. */
export function fromMonthInput(value: string) {
  return value ? `${value.slice(0, 7)}-01T12:00:00.000Z` : null;
}

export function formatCurrency(value: number | string | null | undefined, fallback = "—") {
  const number = typeof value === "string" ? Number(value) : value;
  if (number === null || number === undefined || Number.isNaN(number)) return fallback;
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
