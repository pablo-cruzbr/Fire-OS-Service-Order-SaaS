import { z } from "zod";

const uuid = z.string().uuid({ message: "ID inválido." });

const createOrdemdeServicoSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  descricaodoProblemaouSolicitacao: z.string().min(1, "Descrição do problema é obrigatória."),
  patrimoniodoequipamento: z.string().min(1, "Patrimônio do equipamento é obrigatório."),
  tipodeChamado_id: uuid,
  user_id: uuid,

  nomedoContatoaserProcuradonoLocal: z.string().optional(),
  tipodeOrdemdeServico_id: uuid.optional(),
  statusOrdemdeServico_id: uuid.optional(),
  cliente_id: uuid.optional(),
  tarefa_id: uuid.optional(),
  prioridade_id: uuid.optional(),
  instituicaoUnidade_id: uuid.optional(),
  tecnico_id: uuid.optional(),
  nameTecnico: z.string().optional(),
  diagnostico: z.string().optional(),
  solucao: z.string().optional(),
  bannerassinatura: z.string().optional(),
  informacoesSetorId: uuid.optional(),
});

const idParamSchema = z.object({
  id: uuid,
});

const updateOrdemdeServicoSchema = z.object({
  prioridade_id: uuid.optional(),
  tecnico_id: uuid.optional(),
  statusOrdemdeServico_id: uuid.optional(),
  tipodeChamado_id: uuid.optional(),
  tipodeOrdemdeServico_id: uuid.optional(),
  informacoesSetorId: uuid.optional(),
  instituicaoUnidade_id: uuid.optional(),
  cliente_id: uuid.optional(),
  equipamento_id: uuid.optional(),
  tarefa_id: uuid.optional(),
  nameTecnico: z.string().optional(),
  diagnostico: z.string().optional(),
  solucao: z.string().optional(),
  assinante: z.string().optional(),
  descricaodoProblemaouSolicitacao: z.string().optional(),
  assinatura: z.string().optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  duracao: z.coerce.number().optional(),
  atividades_ids: z.string().optional(),
  agendadoEm: z.string().optional(),
});

type CreateOrdemdeServicoInput = z.infer<typeof createOrdemdeServicoSchema>;
type UpdateOrdemdeServicoInput = z.infer<typeof updateOrdemdeServicoSchema>;

export { createOrdemdeServicoSchema, idParamSchema, updateOrdemdeServicoSchema };
export type { CreateOrdemdeServicoInput, UpdateOrdemdeServicoInput };
