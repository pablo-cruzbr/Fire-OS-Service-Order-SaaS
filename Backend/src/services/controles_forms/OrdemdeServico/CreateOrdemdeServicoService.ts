import { connect } from "http2";
import prismaClient from "../../../prisma";

interface FormOrdemdeServicoRequest {
  name: string;
  descricaodoProblemaouSolicitacao: string;
  nomedoContatoaserProcuradonoLocal?: string;
  patrimoniodoequipamento?: string;
  cliente_id?: string;
  tecnico_id?: string;
  tarefa_id?: string;
  statusOrdemdeServico_id?: string;
  tipodeChamado_id: string;
  tipodeOrdemdeServico_id: string;
  instituicaoUnidade_id?: string;
  user_id: string;
  equipamento_id: string;
  assinante?: string; 
  nameTecnico?: string;
  diagnostico?: string;
  solucao?: string;
  bannerassinatura?: string;
  fotos?: string[];
}

class CreateOrdemdeServicoService {
  async execute({
    name,
    descricaodoProblemaouSolicitacao,
    patrimoniodoequipamento,
    nomedoContatoaserProcuradonoLocal,
    assinante,
    cliente_id,
    tecnico_id,
    tarefa_id,
    statusOrdemdeServico_id,
    tipodeChamado_id,
    instituicaoUnidade_id,
    user_id,
    equipamento_id,
    tipodeOrdemdeServico_id,
    nameTecnico,
    diagnostico,
    solucao,
    bannerassinatura,
    fotos
  }: FormOrdemdeServicoRequest) {

    if (!name || !descricaodoProblemaouSolicitacao || !tipodeChamado_id || !user_id || !patrimoniodoequipamento) {
      throw new Error("Campos obrigatórios não informados.");
    }

    try {
      // gera número aleatório de OS (5 dígitos, por exemplo)
      const numeroOS = Math.floor(10000 + Math.random() * 90000);

      const ordem = await prismaClient.ordemdeServico.create({
        data: {
          numeroOS,
          name,
          assinante,
          descricaodoProblemaouSolicitacao,
          patrimoniodoequipamento,
          nomedoContatoaserProcuradonoLocal,

          tipodeChamado: {
            connect: { id: tipodeChamado_id }
          },

          tipodeOrdemdeServico:{
            connect: {id: tipodeOrdemdeServico_id}
          },

          user: {
            connect: { id: user_id }
          },

          ...(cliente_id && {
            cliente: { connect: { id: cliente_id } }
          }),

          ...(tecnico_id && {
            tecnico: { connect: { id: tecnico_id } }
          }),

          ...(statusOrdemdeServico_id && {
            statusOrdemdeServico: { connect: { id: statusOrdemdeServico_id } }
          }),

          ...(instituicaoUnidade_id && {
            instituicaoUnidade: { connect: { id: instituicaoUnidade_id } }
          }),

          ...(equipamento_id && {
            equipamento: {connect: {id: equipamento_id }}
          }),

          ...(tarefa_id && {
           tarefa: {connect: {id: tarefa_id }}
          }),

          nameTecnico,
          diagnostico,
          solucao,
          bannerassinatura,

          ...(Array.isArray(fotos) && fotos.length > 0 && {
            fotos: {
              create: fotos.map((url) => ({ url }))
            }
          })
        },

        select: {
          id: true,
          numeroOS: true, 
          name: true,
          descricaodoProblemaouSolicitacao: true,
          patrimoniodoequipamento: true,
          cliente: { select: { name: true, endereco: true } },
          tarefa: {select: {name: true}},
          tecnico: { select: { name: true } },
          tipodeChamado: { select: { name: true } },
          tipodeOrdemdeServico: {select:{name: true}},
          instituicaoUnidade: { select: { name: true, endereco: true } },
          statusOrdemdeServico: { select: { name: true } },
          user: { select: { name: true } },
          fotos: true,
          assinante: true
        },
      });

      return ordem;

    } catch (error) {
      console.error("Erro ao criar ordem de serviço no banco:", error);
      throw new Error("Erro ao salvar no banco de dados.");
    }
  }
}

export { CreateOrdemdeServicoService };
