import prismaClient from "../../../prisma";

interface ListRequest {
  user_id: string;
  startDate?: string;    
  endDate?: string;      
  cliente_id?: string;   
  instituicao_id?: string; 
  tarefa_id?: string; 
}

class ListOrdemdeServicoService {
  async execute({ 
    user_id, 
    startDate, 
    endDate, 
    cliente_id, 
    instituicao_id, 
    tarefa_id 
  }: ListRequest) {
    
    const user = await prismaClient.user.findFirst({
      where: { id: user_id },
      select: {
        role: true,
        tecnico_id: true,
      }
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // 1. Inicia o objeto de filtros vazio
    let whereCondition: any = {};

    // 2. Aplica restrição por Role (Segurança)
    if (user.role === "TECNICO") {
      // RESTRIÇÃO 1: O usuário deve estar vinculado a um técnico. Se não estiver, o sistema bloqueia o acesso.
      if (!user.tecnico_id) {
        return { 
          controles: [], total: 0, totalAberta: 0, totalEmAndamento: 0, 
          totalConcluida: 0, totalPausada: 0, totalTicket: 0, totalOrdemdeServico: 0, totalEmDeslocamento: 0
        }; 
      }
      
      // RESTRIÇÃO 2: O técnico só visualiza ordens atribuídas especificamente ao ID dele.
      // RESTRIÇÃO 3: O sistema exclui automaticamente qualquer OS com status "CONCLUIDA" (ID específico).
      whereCondition = {
        tecnico_id: user.tecnico_id,
        statusOrdemdeServico_id: {
          not: "fa69ed32-20b2-4d3a-9a6d-e61c5b45efea"
        }
      };
    }

    // 3. Aplica filtros de Período (created_at)
    // RESTRIÇÃO 4: Se datas forem fornecidas, o sistema filtra apenas o que foi criado dentro deste intervalo.
    if (startDate || endDate) {
      whereCondition.created_at = {};
      
      if (startDate) {
        whereCondition.created_at.gte = new Date(startDate);
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999); 
        whereCondition.created_at.lte = end;
      }
    }

    // 4. Aplica filtros de Entidade (Cliente/Unidade/Tarefa)
    // RESTRIÇÃO 5: Se um ID de entidade for fornecido, a busca é reduzida apenas aos registros que correspondem exatamente a esse ID.
    if (cliente_id) {
      whereCondition.cliente_id = cliente_id;
    }

    if (instituicao_id) {
      whereCondition.instituicaoUnidade_id = instituicao_id;
    }

    if (tarefa_id) {
      whereCondition.tarefa_id = tarefa_id;
    }

    // Busca principal com os filtros acumulados
    const controles = await prismaClient.ordemdeServico.findMany({
      where: whereCondition,
      orderBy: {
        created_at: "desc",
      },
      // ... select mantido
    });

    // Os contadores abaixo também respeitam rigorosamente todas as restrições (tecnico_id, status, período, etc.) aplicadas no whereCondition.
    const [
      total, 
      totalAberta,
      totalEmDeslocamento, 
      totalEmAndamento, 
      totalPausada, 
      totalConcluida, 
      totalTicket, 
      totalOrdemdeServico
    ] = await Promise.all([
      prismaClient.ordemdeServico.count({ where: whereCondition }),
      prismaClient.ordemdeServico.count({ where: { ...whereCondition, statusOrdemdeServico: { name: "ABERTA" } } }),
      prismaClient.ordemdeServico.count({ where: { ...whereCondition, statusOrdemdeServico: { name: "EM DESLOCAMENTO" } } }),
      prismaClient.ordemdeServico.count({ where: { ...whereCondition, statusOrdemdeServico: { name: "EM ANDAMENTO" } } }),
      prismaClient.ordemdeServico.count({ where: { ...whereCondition, statusOrdemdeServico: { name: "PAUSADA" } } }),
      prismaClient.ordemdeServico.count({ where: { ...whereCondition, statusOrdemdeServico: { name: "CONCLUIDA" } } }),
      prismaClient.ordemdeServico.count({ where: { ...whereCondition, tipodeOrdemdeServico: { name: "TICKET" } } }),
      prismaClient.ordemdeServico.count({ where: { ...whereCondition, tipodeOrdemdeServico: { name: "ORDEM DE SERVICO" } } }),
    ]);

    return {
      controles,
      total,
      totalAberta,
      totalEmDeslocamento,
      totalEmAndamento,
      totalConcluida,
      totalPausada,
      totalTicket,
      totalOrdemdeServico
    };
  }
}

export { ListOrdemdeServicoService };