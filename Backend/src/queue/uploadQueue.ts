import { Queue } from "bullmq";

// A fila é só uma lista de "recados" guardada no Redis.
// Quem adiciona um job aqui não sabe (nem precisa saber) quem vai
// processar, nem quando. Só entrega o recado e segue a vida.
export const uploadQueue = new Queue("upload-imagem", {
  connection: { url: process.env.REDIS_URL },
  defaultJobOptions: {
    // Se o Cloudinary falhar (rede ruim em campo, por exemplo), tenta de
    // novo até 3 vezes, esperando um pouco mais a cada tentativa — em vez
    // de a foto simplesmente se perder por uma falha passageira.
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  },
});
