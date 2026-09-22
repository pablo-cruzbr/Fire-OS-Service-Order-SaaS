import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

// Achado no rollout (22/09): o Create antigo gravava em prismaClient.equipamento
// (a tabela errada) enquanto o List sempre leu de prismaClient.estabilizadores —
// um estabilizador criado pelo formulário nunca aparecia na própria listagem.
// Corrigido aqui: as duas operações batem na mesma tabela agora.
class EstabilizadorRepository {
  findAll() {
    return prismaClient.estabilizadores.findMany({
      orderBy: { created_at: "desc" },
      select: { id: true, name: true, patrimonio: true, created_at: true },
    });
  }

  create(data: Prisma.estabilizadoresCreateInput) {
    return prismaClient.estabilizadores.create({
      data,
      select: { id: true, name: true, patrimonio: true },
    });
  }
}

const estabilizadorRepository = new EstabilizadorRepository();

export { EstabilizadorRepository, estabilizadorRepository };
