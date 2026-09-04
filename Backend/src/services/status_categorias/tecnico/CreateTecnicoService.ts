import prismaClient from "../../../prisma";
import redisClient from "../../../redis";
import { TECNICOS_CACHE_KEY } from "./ListTecnicoService";

interface TecnicoCategoryRequest{
    name: string;
}
class CreateTecnicoService{
    async execute(name){
        if(name === ''){
            throw new Error('Name Invalid');
        }

        const tecnicoCategory = await prismaClient.tecnico.create({
            data: {
                name: name,
            },

            select:{
                id: true,
                name: true,
            }
        })

        try {
            await redisClient.del(TECNICOS_CACHE_KEY);
        } catch (error) {
            console.error("Redis indisponível, não deu pra invalidar o cache de técnicos:", error);
        }

        return tecnicoCategory
    }
}

export {CreateTecnicoService}