import { CreateLookupCategoriaInput } from "../../schemas/lookupCategoria.schema";
import { LookupCategoriaRepository } from "../../repositories/LookupCategoriaRepository";

// Service único e genérico — todo módulo de lookup faz exatamente a mesma
// coisa (recebe um name já validado pelo Zod, cria, devolve). Reaproveitado
// pelos 13 controllers desse grupo, cada um só passando o Repository já
// configurado com o model certo.
class CreateLookupCategoriaService {
  constructor(private repository: LookupCategoriaRepository) {}

  async execute(data: CreateLookupCategoriaInput) {
    return this.repository.create(data.name);
  }
}

export { CreateLookupCategoriaService };
