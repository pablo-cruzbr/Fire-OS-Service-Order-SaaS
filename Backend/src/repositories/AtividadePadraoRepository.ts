import { CategoriaAtividade } from "@prisma/client";
import prismaClient from "../prisma";

class AtividadePadraoRepository {
  findAll(categoria?: CategoriaAtividade) {
    return prismaClient.atividadePadrao.findMany({
      where: { categoria },
      select: { id: true, descricao: true, categoria: true },
    });
  }
}

const atividadePadraoRepository = new AtividadePadraoRepository();

export { AtividadePadraoRepository, atividadePadraoRepository };
