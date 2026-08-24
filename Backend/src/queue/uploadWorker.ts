import "dotenv/config";
import { Worker } from "bullmq";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// O worker roda separado da API (processo próprio, veja o script "worker"
// no package.json). Ele fica escutando a fila 'upload-imagem' e processa
// um job por vez, no tempo dele — sem travar nenhuma requisição HTTP.
const agora = () => new Date().toLocaleTimeString();

const worker = new Worker(
  "upload-imagem",
  async (job) => {
    console.log(`[${agora()}] [worker] peguei o job ${job.id}, subindo ${job.data.caminhoDoArquivo} pro Cloudinary...`);

    const resultado = await cloudinary.uploader.upload(job.data.caminhoDoArquivo, {
      folder: "exemplo-fila",
    });

    console.log(`[${agora()}] [worker] pronto! URL: ${resultado.secure_url}`);
    return resultado.secure_url;
  },
  { connection: { url: process.env.REDIS_URL } }
);

worker.on("completed", (job) => {
  console.log(`[worker] job ${job.id} concluído.`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] job ${job?.id} falhou:`, err.message);
});

console.log("Worker rodando, esperando jobs na fila 'upload-imagem'... (Ctrl+C pra parar)");
