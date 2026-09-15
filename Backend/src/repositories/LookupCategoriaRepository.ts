import prismaClient from "../prisma";

// União fechada de propósito (em vez de `keyof typeof prismaClient`) — evita
// passar por engano o nome de um model que não é uma tabela de lookup (ex.
// "user" ou "ordemdeServico"), e dá autocomplete de quem for usar isso.
type LookupModelName =
  | "statusCompras"
  | "statusControledeLaboratorio"
  | "statusEstabilizadores"
  | "statusMaquinasPendentesLab"
  | "statusMaquinasPendentesOro"
  | "statusOrdemdeServico"
  | "statusReparo"
  | "prioridade"
  | "tarefa"
  | "tipodeChamado"
  | "tipodeEquipamento"
  | "tipodeInstituicaoUnidade"
  | "tipodeOrdemdeServico";

const DEFAULT_SELECT = { id: true, name: true };

// Repository único e genérico pra qualquer "tabela de lookup" de
// status_categorias — todas têm o mesmo formato (só `name`), então em vez de
// 13 repositories quase idênticos, um só, parametrizado pelo nome do model
// (ex.: new LookupCategoriaRepository("tarefa")). Mesmo raciocínio do
// generalizar `authorizeOwnership.ts` a partir do `authorizeOrdemdeServico`
// original: um recurso repetido em N módulos vira uma peça só.
class LookupCategoriaRepository {
  constructor(private modelName: LookupModelName) {}

  // any de propósito: cada model do Prisma tem um tipo de delegate próprio
  // (CreateInput/UpdateInput diferentes), mas todos aceitam exatamente
  // { data: { name }, select: { id, name } } — não vale a pena escrever um
  // union type gigante só pra isso.
  private get delegate(): any {
    return prismaClient[this.modelName];
  }

  create(name: string) {
    return this.delegate.create({ data: { name }, select: DEFAULT_SELECT });
  }

  delete(id: string) {
    return this.delegate.delete({ where: { id } });
  }
}

export { LookupCategoriaRepository };
export type { LookupModelName };
