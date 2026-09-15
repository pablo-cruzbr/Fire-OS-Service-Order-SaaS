import prismaClient from "../../../../prisma";
import { CreateInformacoesSetorInput } from "../../../../schemas/informacoesSetor.schema";
import {
  InformacoesSetorRepository,
  informacoesSetorRepository,
} from "../../../../repositories/InformacoesSetorRepository";

class CreateInformacoesSetorService {
  constructor(private repository: InformacoesSetorRepository = informacoesSetorRepository) {}

  async execute(data: CreateInformacoesSetorInput) {
    const validClienteId = data.clienteId ? await this.validarCliente(data.clienteId) : null;
    const validInstituicaoId = data.instituicaoUnidadeId
      ? await this.validarInstituicao(data.instituicaoUnidadeId)
      : null;

    return this.repository.create({
      setorId: data.setorId,
      usuario: data.usuario,
      andar: data.andar,
      ramal: data.ramal,
      cliente_id: validClienteId,
      instituicaoUnidade_id: validInstituicaoId,
    });
  }

  // Cliente/InstituicaoUnidade não são o "dono" deste Repository — é só um
  // lookup auxiliar. Regra de negócio já existia antes do Zod: um id que não
  // existe mais vira null em vez de travar o cadastro inteiro.
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

export { CreateInformacoesSetorService };
