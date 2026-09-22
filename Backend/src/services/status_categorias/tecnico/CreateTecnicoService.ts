import redisClient from "../../../redis";
import { TecnicoRepository, tecnicoRepository } from "../../../repositories/TecnicoRepository";
import { CreateTecnicoInput } from "../../../schemas/tecnico.schema";
import { TECNICOS_CACHE_KEY } from "./ListTecnicoService";

class CreateTecnicoService {
  constructor(private repository: TecnicoRepository = tecnicoRepository) {}

  async execute(data: CreateTecnicoInput) {
    const tecnico = await this.repository.create(data);

    try {
      await redisClient.del(TECNICOS_CACHE_KEY);
    } catch (error) {
      console.error("Redis indisponível, não deu pra invalidar o cache de técnicos:", error);
    }

    return tecnico;
  }
}

export { CreateTecnicoService };
