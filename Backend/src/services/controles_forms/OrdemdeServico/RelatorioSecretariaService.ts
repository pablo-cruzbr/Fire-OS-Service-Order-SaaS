import { Prisma } from "@prisma/client";
import {
  OrdemdeServicoRepository,
  ordemdeServicoRepository,
} from "../../../repositories/OrdemdeServicoRepository";
import { RelatorioSecretariaQuery } from "../../../schemas/ordemdeServico.schema";

class RelatorioSecretariaService {
  constructor(private repository: OrdemdeServicoRepository = ordemdeServicoRepository) {}

  execute({ tiposIds, startDate, endDate }: RelatorioSecretariaQuery) {
    const where: Prisma.OrdemdeServicoWhereInput = {
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

    return this.repository.findForRelatorioSecretaria(where);
  }
}

export { RelatorioSecretariaService };
