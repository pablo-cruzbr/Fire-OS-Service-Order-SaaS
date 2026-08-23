import { Queue } from "bullmq";

// A fila é só uma lista de "recados" guardada no Redis.
// Quem adiciona um job aqui não sabe (nem precisa saber) quem vai
// processar, nem quando. Só entrega o recado e segue a vida.
export const uploadQueue = new Queue("upload-imagem", {
  connection: { url: process.env.REDIS_URL },
});
