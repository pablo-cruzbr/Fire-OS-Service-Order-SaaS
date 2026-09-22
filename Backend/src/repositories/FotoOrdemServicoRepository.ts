import prismaClient from "../prisma";

// Isola as chamadas prismaClient.fotoOrdemServico.* num único lugar, mesmo
// padrão usado no resto do rollout.
class FotoOrdemServicoRepository {
  findByOrdem(ordemdeServico_id: string) {
    return prismaClient.fotoOrdemServico.findMany({
      where: { ordemdeServico_id },
      orderBy: { created_at: "desc" },
    });
  }

  findById(id: string) {
    return prismaClient.fotoOrdemServico.findUnique({ where: { id } });
  }

  delete(id: string) {
    return prismaClient.fotoOrdemServico.delete({ where: { id } });
  }
}

const fotoOrdemServicoRepository = new FotoOrdemServicoRepository();

export { FotoOrdemServicoRepository, fotoOrdemServicoRepository };
