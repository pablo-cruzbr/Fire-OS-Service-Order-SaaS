import { LookupCategoriaRepository } from "../../repositories/LookupCategoriaRepository";

// Service único e genérico pra listar qualquer "tabela de lookup" —
// mesmo raciocínio do Create/DeleteLookupCategoriaService: os 13 List
// antigos faziam exatamente a mesma query (`findMany({ select: { id, name } })`),
// um por módulo, nunca generalizados quando o Create/Delete foram.
class ListLookupCategoriaService {
  constructor(private repository: LookupCategoriaRepository) {}

  execute() {
    return this.repository.findAll();
  }
}

export { ListLookupCategoriaService };
