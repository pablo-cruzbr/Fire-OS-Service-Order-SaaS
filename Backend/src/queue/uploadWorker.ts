import "dotenv/config";
import { Worker } from "bullmq";
import { v2 as cloudinary } from "cloudinary";
import prismaClient from "../prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// O worker roda separado da API (processo próprio, veja o script "worker"
// no package.json). Ele fica escutando a fila 'upload-imagem' e processa
// um job por vez, no tempo dele — sem travar nenhuma requisição HTTP.
const agora = () => new Date().toLocaleTimeString();

interface UploadFotoOSJob {
  ordemdeServico_id: string;
  tempFilePath: string;
}

interface UploadDemoJob {
  caminhoDoArquivo: string;
}

// Job real: veio do fotoController.ts (upload de foto de uma OS de verdade).
// Sobe pro Cloudinary e só então grava o registro no Postgres — se o worker
// cair entre as duas coisas, o job fica marcado como não concluído e o
// BullMQ tenta de novo (ver defaultJobOptions em uploadQueue.ts), então
// nunca fica um Cloudinary com arquivo e nenhum registro correspondente.
async function processarUploadFotoOS(job: { id?: string; data: UploadFotoOSJob }) {
  const { ordemdeServico_id, tempFilePath } = job.data;
  console.log(`[${agora()}] [worker] peguei o job ${job.id}, subindo foto da OS ${ordemdeServico_id}...`);

  const resultado = await cloudinary.uploader.upload(tempFilePath, {
    folder: "ordens_servico",
  });

  const foto = await prismaClient.fotoOrdemServico.create({
    data: {
      url: resultado.secure_url,
      ordemdeServico_id,
    },
  });

  console.log(`[${agora()}] [worker] foto salva no banco: ${foto.id} (${resultado.secure_url})`);
  return foto;
}

// Job de demonstração: o que o "npm run queue:demo" dispara, só pra ver o
// mecanismo da fila funcionando isolado, sem tocar no banco real.
async function processarUploadDemo(job: { id?: string; data: UploadDemoJob }) {
  console.log(`[${agora()}] [worker] peguei o job ${job.id}, subindo ${job.data.caminhoDoArquivo} pro Cloudinary...`);

  const resultado = await cloudinary.uploader.upload(job.data.caminhoDoArquivo, {
    folder: "exemplo-fila",
  });

  console.log(`[${agora()}] [worker] pronto! URL: ${resultado.secure_url}`);
  return resultado.secure_url;
}

const worker = new Worker(
  "upload-imagem",
  async (job) => {
    if (job.name === "upload-foto-os") {
      return processarUploadFotoOS(job);
    }
    return processarUploadDemo(job);
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
