import { Prisma } from "@prisma/client";
import prismaClient from "../../../../prisma";
import { UpdateInformacoesSetorInput } from "../../../../schemas/informacoesSetor.schema";
import {
  InformacoesSetorRepository,
  informacoesSetorRepository,
} from "../../../../repositories/InformacoesSetorRepository";

class UpdateInformacoesSetorService {
  constructor(private repository: InformacoesSetorRepository = informacoesSetorRepository) {}

  async execute(id: string, data: UpdateInformacoesSetorInput) {
    const patchData: Prisma.InformacoesSetorUncheckedUpdateInput = {
      setorId: data.setorId,
      usuario: data.usuario,
      andar: data.andar,
      ramal: data.ramal,
    };

    // Só mexe em cliente_id/instituicaoUnidade_id quando o campo veio no
    // payload — antes do Zod, o Service resolvia os dois sempre, e se o
    // formulário não mandasse o campo (undefined), o update apagava a
    // associação existente sem querer. `null` explícito (usuário limpou o
    // dropdown) continua limpando de propósito.
    if (data.clienteId !== undefined) {
      patchData.cliente_id = data.clienteId ? await this.validarCliente(data.clienteId) : null;
    }

    if (data.instituicaoUnidadeId !== undefined) {
      patchData.instituicaoUnidade_id = data.instituicaoUnidadeId
        ? await this.validarInstituicao(data.instituicaoUnidadeId)
        : null;
    }

    // Sem checagem manual de existência do id — se não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    return this.repository.update(id, patchData);
  }

  private async validarCliente(clienteId: string) {
    const cliente = await prismaClient.cliente.findUnique({ where: { id: clienteId } });
    return cliente ? cliente.id : null;
  }

  private async validarInstituicao(instituicaoUnidadeId: string) {
    const instituicao = await prismaClient.instituicaoUnidade.findUnique({
      where: { id: instituicaoUnidadeId },
    });
    return instituicao ? instituicao.id : null;
  }
}

export { UpdateInformacoesSetorService };
