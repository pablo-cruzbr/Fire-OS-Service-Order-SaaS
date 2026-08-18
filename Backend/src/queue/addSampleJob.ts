import "dotenv/config";
import { uploadQueue } from "./uploadQueue";

// Simula o que a rota da API faria: só adiciona o job na fila e
// responde na hora. Não faz upload nenhum aqui, isso é trabalho do worker.
async function main() {
  const caminhoDoArquivo = process.argv[2];

  if (!caminhoDoArquivo) {
    console.error("Uso: npm run queue:demo -- <caminho-da-imagem>");
    process.exit(1);
  }

  const job = await uploadQueue.add("upload-imagem", { caminhoDoArquivo });

  console.log(`Job ${job.id} adicionado na fila.`);
  console.log("Numa API de verdade, a resposta HTTP (202) já teria voltado pro cliente agora.");
  console.log("Olha o terminal do worker pra ver ele processando.");

  process.exit(0);
}

main();
