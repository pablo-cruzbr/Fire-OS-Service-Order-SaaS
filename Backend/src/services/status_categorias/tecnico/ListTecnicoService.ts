import redisClient from "../../../redis";
import { TecnicoRepository, tecnicoRepository } from "../../../repositories/TecnicoRepository";

export const TECNICOS_CACHE_KEY = "tecnicos:list";
const TECNICOS_CACHE_TTL_SECONDS = 60;

// Cache-aside: olha o Redis primeiro, só bate no banco se não achar nada lá
// ou se o Redis estiver fora do ar. TTL de 60s (maior que o de OS, item 6)
// porque a lista de técnicos muda com frequência bem menor.
class ListTecnicoService {
  constructor(private repository: TecnicoRepository = tecnicoRepository) {}

  async execute() {
    try {
      const cached = await redisClient.get(TECNICOS_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error("Redis indisponível, seguindo sem cache:", error);
    }

    const [tecnicos, total] = await Promise.all([
      this.repository.findAll(),
      this.repository.count(),
    ]);

    const resultado = { controles: tecnicos, total };

    try {
      await redisClient.set(TECNICOS_CACHE_KEY, JSON.stringify(resultado), "EX", TECNICOS_CACHE_TTL_SECONDS);
    } catch (error) {
      console.error("Redis indisponível, não deu pra salvar o cache:", error);
    }

    return resultado;
  }
}

export { ListTecnicoService };
