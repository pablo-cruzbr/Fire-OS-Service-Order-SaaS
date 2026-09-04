import prismaClient from "../../../prisma";
import redisClient from "../../../redis";
import { TECNICOS_CACHE_KEY } from "./ListTecnicoService";

interface TecnicoRequest{
    tecnico_id: string;
}

class RemoveTecnicoService{
    async execute({tecnico_id}: TecnicoRequest){
        const tecnico = await prismaClient.tecnico.delete({
            where:{
                id: tecnico_id,
            }
        })

        try {
            await redisClient.del(TECNICOS_CACHE_KEY);
        } catch (error) {
            console.error("Redis indisponível, não deu pra invalidar o cache de técnicos:", error);
        }

        return tecnico;
    }
}

export {RemoveTecnicoService}