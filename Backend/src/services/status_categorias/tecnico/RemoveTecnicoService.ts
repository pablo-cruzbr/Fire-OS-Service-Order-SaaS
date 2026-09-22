import redisClient from "../../../redis";
import { TecnicoRepository, tecnicoRepository } from "../../../repositories/TecnicoRepository";
import { TECNICOS_CACHE_KEY } from "./ListTecnicoService";

class RemoveTecnicoService {
  constructor(private repository: TecnicoRepository = tecnicoRepository) {}

  async execute(id: string) {
    const tecnico = await this.repository.delete(id);

    try {
      await redisClient.del(TECNICOS_CACHE_KEY);
    } catch (error) {
      console.error("Redis indisponível, não deu pra invalidar o cache de técnicos:", error);
    }

    return tecnico;
  }
}

export { RemoveTecnicoService };
