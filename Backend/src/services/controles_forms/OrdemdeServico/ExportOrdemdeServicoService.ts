import ExcelJS from "exceljs";
import { ListOrdemdeServicoService } from "./ListOrdemdeServicoService";
import { ExportOrdemdeServicoQuery } from "../../../schemas/ordemdeServico.schema";

interface OSData {
  numeroOS?: string | null;
  created_at?: Date | string;
  tarefa?: { name: string } | null;
  tipodeOrdemdeServico?: { name: string } | null;
  cliente?: { name: string } | null;
  instituicaoUnidade?: { name: string } | null;
  tecnico?: { name: string } | null;
  nameTecnico?: string | null;
  statusOrdemdeServico?: { name: string } | null;
  descricaodoProblemaouSolicitacao?: string | null;
  startedAt?: Date | string | null;
  endedAt?: Date | string | null;
  duracao?: number | null;
}

function formatDuration(minutes?: number | null): string {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function formatDate(value?: Date | string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// Constrói a planilha (dados + estilo) sem tocar em req/res — quem escreve
// a resposta HTTP e define os headers de download é o Controller.
class ExportOrdemdeServicoService {
  constructor(private listService: ListOrdemdeServicoService = new ListOrdemdeServicoService()) {}

  async buildWorkbook(user_id: string, query: ExportOrdemdeServicoQuery) {
    const { controles } = await this.listService.execute({ user_id, ...query });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Relatório de OS");

    worksheet.columns = [
      { header: "Nº OS", key: "numeroOS", width: 10 },
      { header: "DATA CADASTRO", key: "created_at", width: 20 },
      { header: "TIPO OS", key: "tipoOS", width: 18 },
      { header: "TAREFA", key: "tarefa", width: 25 },
      { header: "CLIENTE", key: "cliente", width: 30 },
      { header: "UNIDADE", key: "unidade", width: 30 },
      { header: "TÉCNICO", key: "tecnico", width: 20 },
      { header: "STATUS", key: "status", width: 18 },
      { header: "INÍCIO", key: "inicio", width: 20 },
      { header: "FIM", key: "fim", width: 20 },
      { header: "DURAÇÃO", key: "duracao", width: 14 },
      { header: "HISTÓRICO/DESCRIÇÃO", key: "descricao", width: 50 },
    ];

    controles.forEach((os: OSData) => {
      worksheet.addRow({
        numeroOS: os.numeroOS || "N/A",
        created_at: formatDate(os.created_at),
        tipoOS: os.tipodeOrdemdeServico?.name || "N/A",
        tarefa: os.tarefa?.name || "Não definida",
        cliente: os.cliente?.name || "Sem Cliente",
        unidade: os.instituicaoUnidade?.name || "Sem Unidade",
        tecnico: os.tecnico?.name || os.nameTecnico || "Não Atribuído",
        status: os.statusOrdemdeServico?.name || "N/A",
        inicio: formatDate(os.startedAt),
        fim: formatDate(os.endedAt),
        duracao: formatDuration(os.duracao),
        descricao: os.descricaodoProblemaouSolicitacao || "",
      });
    });

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4E3182" } };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFFFFFFF" } },
        left: { style: "thin", color: { argb: "FFFFFFFF" } },
        bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
        right: { style: "thin", color: { argb: "FFFFFFFF" } },
      };
    });

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFD3D3D3" } },
            left: { style: "thin", color: { argb: "FFD3D3D3" } },
            bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
            right: { style: "thin", color: { argb: "FFD3D3D3" } },
          };
          cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        });
        row.height = 22;
      }
    });

    worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

    return workbook;
  }
}

export { ExportOrdemdeServicoService };
