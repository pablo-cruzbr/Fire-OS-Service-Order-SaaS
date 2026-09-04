import prismaClient from "../../../prisma";
import redisClient from "../../../redis";

export const TECNICOS_CACHE_KEY = "tecnicos:list";
const TECNICOS_CACHE_TTL_SECONDS = 60;

class ListTecnicoService {
  async execute() {
    try {
      const cached = await redisClient.get(TECNICOS_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error("Redis indisponível, seguindo sem cache:", error);
    }

    const tecnicos = await prismaClient.tecnico.findMany({
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        name: true,
        created_at: true, // inclua se quiser exibir no frontend
      }
    });

    const total = await prismaClient.tecnico.count();

    const resultado = {
      controles: tecnicos,
      total,
    };

    try {
      await redisClient.set(TECNICOS_CACHE_KEY, JSON.stringify(resultado), "EX", TECNICOS_CACHE_TTL_SECONDS);
    } catch (error) {
      console.error("Redis indisponível, não deu pra salvar o cache:", error);
    }

    return resultado;
  }
}

export { ListTecnicoService };
