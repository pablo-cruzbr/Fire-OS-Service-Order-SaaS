import { z } from "zod";
import { uuid, idParamSchema } from "./common.schema";

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

const listByStatusQuerySchema = z.object({
  statusOrdemdeServico_id: uuid,
});

const listByTecnicoQuerySchema = z.object({
  tecnico_id: uuid,
});

const atualizarTempoSchema = z.object({
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
});

const ordemIdParamSchema = z.object({
  ordemId: uuid,
});

const assinaturaSchema = z.object({
  assinaturaBase64: z.string().min(1, "Assinatura é obrigatória."),
});

type CreateOrdemdeServicoInput = z.infer<typeof createOrdemdeServicoSchema>;
type UpdateOrdemdeServicoInput = z.infer<typeof updateOrdemdeServicoSchema>;
type AtualizarTempoInput = z.infer<typeof atualizarTempoSchema>;
type AssinaturaInput = z.infer<typeof assinaturaSchema>;

export {
  createOrdemdeServicoSchema,
  idParamSchema,
  updateOrdemdeServicoSchema,
  listByStatusQuerySchema,
  listByTecnicoQuerySchema,
  atualizarTempoSchema,
  ordemIdParamSchema,
  assinaturaSchema,
};
export type { CreateOrdemdeServicoInput, UpdateOrdemdeServicoInput, AtualizarTempoInput, AssinaturaInput };
