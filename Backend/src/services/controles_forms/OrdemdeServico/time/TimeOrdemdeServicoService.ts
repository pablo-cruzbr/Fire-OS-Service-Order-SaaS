import prismaClient from "../../../../prisma";
import { OrdemdeServico } from "@prisma/client";
import { AppError, NotFoundError } from "../../../../errors/AppError";

interface UpdateTempoInput {
  ordemId: string;
  startedAt?: Date;
  endedAt?: Date;
}

type OrdemdeServicoComPausa = OrdemdeServico & {
  pausaIniciadaEm: Date | null;
  statusOrdemdeServico_id: string;
};

export const TimeOrdemdeServicoService = {
  async getStatusOrThrow(statusName: string) {
    const status = await prismaClient.statusOrdemdeServico.findFirst({
      where: { name: statusName },
    });
    if (!status) throw new Error(`Status '${statusName}' não encontrado.`);
    return status;
  },

  async getStatusId(statusName: string) {
    const status = await prismaClient.statusOrdemdeServico.findFirst({
      where: { name: statusName },
      select: { id: true },
    });
    return status?.id;
  },

 async iniciarOrdem(ordemId: string) {
  const ordem = await prismaClient.ordemdeServico.findUnique({
    where: { id: ordemId },
  }) as OrdemdeServicoComPausa | null;

  if (!ordem) throw new NotFoundError("Ordem não encontrada.");
  if (ordem.startedAt) return ordem;

  const statusEmAndamento = await this.getStatusOrThrow("EM ANDAMENTO");

  return prismaClient.ordemdeServico.update({
    where: { id: ordemId },
    data: {
      startedAt: new Date(),
      // ❌ removido o reset de duracao e endedAt
      statusOrdemdeServico: { connect: { id: statusEmAndamento.id } },
    },
    include: { statusOrdemdeServico: true },
  });
},


 async pausarOrdem(ordemId: string) {
  const ordem = await prismaClient.ordemdeServico.findUnique({
    where: { id: ordemId },
  }) as OrdemdeServicoComPausa | null;

  if (!ordem) throw new NotFoundError("Ordem não encontrada.");

  const statusEmAndamentoId = await this.getStatusId("EM ANDAMENTO");

  if (ordem.statusOrdemdeServico_id !== statusEmAndamentoId) {
    throw new AppError("A OS não está EM ANDAMENTO e não pode ser pausada.");
  }

  const statusPausada = await this.getStatusOrThrow("PAUSADA");
  const now = new Date();

  return prismaClient.ordemdeServico.update({
    where: { id: ordemId },
    data: {
      statusOrdemdeServico: { connect: { id: statusPausada.id } },
      pausaIniciadaEm: now,
      endedAt: now,
    },
    include: { statusOrdemdeServico: true },
  });
},


  async retomarOrdem(ordemId: string) {
    const ordem = await prismaClient.ordemdeServico.findUnique({
      where: { id: ordemId },
    }) as OrdemdeServicoComPausa | null;

    if (!ordem) throw new NotFoundError("Ordem não encontrada.");

    const statusPausadaId = await this.getStatusId("PAUSADA");
    if (ordem.statusOrdemdeServico_id !== statusPausadaId) {
      throw new AppError("A OS não está PAUSADA e não pode ser retomada.");
    }

    if (!ordem.pausaIniciadaEm || !ordem.startedAt) {
      throw new AppError(
        "Não foi possível calcular o tempo de pausa. OS ainda não foi iniciada ou o registro de pausa está incompleto."
      );
    }

    const now = new Date();
    const tempoDePausaMs = now.getTime() - ordem.pausaIniciadaEm.getTime();
    const novoStartedAt = new Date(ordem.startedAt.getTime() + tempoDePausaMs);

    const statusEmAndamento = await this.getStatusOrThrow("EM ANDAMENTO");

    return prismaClient.ordemdeServico.update({
      where: { id: ordemId },
      data: {
        statusOrdemdeServico: { connect: { id: statusEmAndamento.id } },
        startedAt: novoStartedAt,
        pausaIniciadaEm: null,
      },
      include: { statusOrdemdeServico: true },
    });
  },

  async concluirOrdem(ordemId: string) {
    const ordem = await prismaClient.ordemdeServico.findUnique({
      where: { id: ordemId },
    }) as OrdemdeServicoComPausa | null;

    if (!ordem) throw new NotFoundError("Ordem não encontrada.");
    if (!ordem.startedAt) throw new AppError("A OS ainda não foi iniciada.");

    const now = new Date();
    const duracaoTotal = Math.floor((now.getTime() - ordem.startedAt.getTime()) / 1000);

    const statusConcluida = await this.getStatusOrThrow("CONCLUIDA");

    return prismaClient.ordemdeServico.update({
      where: { id: ordemId },
      data: {
        endedAt: now,
        duracao: duracaoTotal,
        pausaIniciadaEm: null,
        statusOrdemdeServico: { connect: { id: statusConcluida.id } },
      },
      include: { statusOrdemdeServico: true },
    });
  },

  async atualizarTempo({ ordemId, startedAt, endedAt }: UpdateTempoInput) {
    const ordem = await prismaClient.ordemdeServico.findUnique({
      where: { id: ordemId },
    }) as OrdemdeServicoComPausa | null;

    if (!ordem) throw new NotFoundError("Ordem não encontrada.");

    let duracaoTotal = 0;
    const start = startedAt ?? ordem.startedAt;
    const end = endedAt ?? ordem.endedAt ?? new Date();

    if (start) {
      duracaoTotal = Math.floor((end.getTime() - start.getTime()) / 1000);
    }

    return prismaClient.ordemdeServico.update({
      where: { id: ordemId },
      data: {
        startedAt: start,
        endedAt: endedAt ?? ordem.endedAt,
        duracao: duracaoTotal,
      },
    });
  },

  async lerTempo(ordemId: string) {
    const ordem = await prismaClient.ordemdeServico.findUnique({
      where: { id: ordemId },
      select: { startedAt: true, endedAt: true, duracao: true },
    });

    if (!ordem) throw new NotFoundError("Ordem não encontrada.");
    return ordem;
  },
};
