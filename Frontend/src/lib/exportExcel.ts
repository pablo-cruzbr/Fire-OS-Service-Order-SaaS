import axios from "axios";
import { toast } from "sonner";
import { api } from "@/services/api";
import { apiErrorMessage } from "@/lib/apiError";

export interface ExportParams {
  startDate?: string;
  endDate?: string;
  tarefa_id?: string;
  cliente_id?: string;
  instituicao_id?: string;
  status_id?: string;
  tipoOS_id?: string;
}

const FALLBACK_ERROR = "Erro ao exportar relatório. Verifique sua conexão.";

/** With `responseType: "blob"` the API error body arrives as a Blob — read it back as JSON. */
async function exportErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
    try {
      const body = JSON.parse(await error.response.data.text());
      if (typeof body?.error === "string") return body.error;
      if (typeof body?.message === "string") return body.message;
    } catch {
      // not JSON — fall through
    }
    return FALLBACK_ERROR;
  }
  return apiErrorMessage(error, FALLBACK_ERROR);
}

/**
 * Downloads the OS spreadsheet from `/ordens/exportar`. Never throws: shows a
 * toast and resolves to `false` on failure, so callers only handle loading.
 */
export async function exportOrdemServicoExcel(params: ExportParams): Promise<boolean> {
  try {
    const response = await api.get("/ordens/exportar", {
      params,
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Relatorio_OS_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Excel gerado com sucesso!");
    return true;
  } catch (error) {
    toast.error(await exportErrorMessage(error));
    return false;
  }
}
