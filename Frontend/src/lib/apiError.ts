import axios from "axios";

/** Best human-readable message from an API error. */
export function apiErrorMessage(error: unknown, fallback = "Não foi possível concluir a operação.") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.message === "string") return data.message;
    if (!error.response) return "Sem conexão com o servidor.";
  }
  return fallback;
}
