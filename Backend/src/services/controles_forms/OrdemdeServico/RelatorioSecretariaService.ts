import prismaClient from "../../../prisma";

interface RelatorioRequest {
  tiposIds: string[];
  startDate?: string;
  endDate?: string;
}

class RelatorioSecretariaService {
  async execute({ tiposIds, startDate, endDate }: RelatorioRequest) {
    const where: any = {
      instituicaoUnidade: {
        tipodeinstituicaoUnidade_id: { in: tiposIds },
      },
    };

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        where.created_at.lte = end;
      }
    }

    const ordens = await prismaClient.ordemdeServico.findMany({
      where,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        numeroOS: true,
        descricaodoProblemaouSolicitacao: true,
        created_at: true,
        updatedAt: true,
        tipodeChamado: { select: { id: true, name: true } },
        tarefa: { select: { id: true, name: true } },
        tecnico: { select: { id: true, name: true } },
        nameTecnico: true,
        instituicaoUnidade: {
          select: {
            id: true,
            name: true,
            endereco: true,
            tipodeinstituicaoUnidade: { select: { id: true, name: true } },
          },
        },
        cliente: { select: { id: true, name: true, endereco: true } },
        statusOrdemdeServico: { select: { id: true, name: true } },
      },
    });

    return ordens;
  }
}

export { RelatorioSecretariaService };
