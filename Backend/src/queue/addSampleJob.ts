import "dotenv/config";
import { uploadQueue } from "./uploadQueue";

// Simula o que a rota da API faria: só adiciona os jobs na fila e
// responde na hora. Não faz upload nenhum aqui, isso é trabalho do worker.
// Aceita mais de um arquivo, igual o fotoController.ts recebe várias fotos.
async function main() {
  const caminhos = process.argv.slice(2);

  if (caminhos.length === 0) {
    console.error("Uso: npm run queue:demo -- <imagem1> <imagem2> <imagem3> ...");
    process.exit(1);
  }

  const inicio = Date.now();

  for (const caminhoDoArquivo of caminhos) {
    const job = await uploadQueue.add("upload-imagem", { caminhoDoArquivo });
    console.log(`Job ${job.id} adicionado na fila (${caminhoDoArquivo})`);
  }

  console.log(`\n${caminhos.length} job(s) enfileirados em ${Date.now() - inicio}ms.`);
  console.log("Numa API de verdade, a resposta HTTP (202) já teria voltado pro cliente agora.");
  console.log("Olha o terminal do worker pra ver ele processando um por um.");

  process.exit(0);
}

main();
