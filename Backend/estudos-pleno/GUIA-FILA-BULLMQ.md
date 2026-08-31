# Guia de Filas e Mensageria (BullMQ + Redis) no Fire OS

Documento separado do `ROADMAP-PLENO.md`, só pra explicar esse assunto de fila/mensageria do zero, num lugar só, sem misturar com o resto do roadmap. Primeira vez mexendo nisso — no Hone (hackathon) quem implementou essa parte foi um colega de equipe, não eu.

---

## 1. O que é cada peça, sem assumir que você já viu isso

- **Redis**: banco de dados que guarda tudo em memória (RAM), não em disco — por isso é absurdamente rápido. Sozinho, ele não sabe o que é "fila" ou "job", é só um armazenamento genérico tipo dicionário gigante chave-valor, compartilhado entre processos diferentes.
- **BullMQ**: biblioteca Node.js que usa o Redis por baixo dos panos pra implementar o conceito de **fila de jobs** — adicionar um "recado" numa lista, e ter "trabalhadores" (workers) tirando recados dessa lista e processando.
- **Por isso os dois sempre aparecem juntos**: Redis é o armazenamento, BullMQ é a lógica de fila em cima dele. Sem Redis rodando, o BullMQ não tem onde guardar nada.

**Analogia:** pensa no Redis como uma **prateleira**. Um processo só sabe colocar coisa nela (o "produtor"), outro processo só sabe tirar coisa dela (o "consumidor" / worker). Nenhum dos dois se conhece diretamente — eles só concordam em usar o nome da mesma prateleira.

---

## 2. Por que isso importa de verdade no Fire OS

Rastreei o fluxo real do app mobile (`FireOS-App/src/components/modalDetailOrder/index.tsx`) pra achar onde isso se aplica:

- **Fotos** (achado confirmado): quando o técnico aperta "CONCLUIR OS", `uploadImages()` manda uma foto de cada vez pro backend, **esperando cada uma terminar antes de mandar a próxima**. No backend, `fotoController.handle` sobe cada foto pro Cloudinary **dentro do request**, antes de responder. Com 5 fotos e internet ruim, isso trava a tela 5 vezes seguidas.
- **Assinatura** (achado à parte): o técnico desenha a assinatura, mas rastreando o código, ela fica só numa prévia local — a função que mandaria pro backend (`enviarAssinatura`) existe mas nunca é chamada. Não é problema de fila (sem chamada de rede não trava nada), é um gap funcional separado.

**Antes (síncrono, o que o código faz hoje) — enviando 3 fotos:**

```
0s      → técnico aperta "CONCLUIR OS"
0s      → app manda a foto 1
0s–3s   → tela TRAVADA esperando o Cloudinary aceitar a foto 1
3s      → só então manda a foto 2 (o for só avança depois do await)
3s–6s   → tela TRAVADA esperando a foto 2
6s      → manda a foto 3
6s–9s   → tela TRAVADA esperando a foto 3
9s      → SÓ ENTÃO "Operação concluída"
```

**Depois (com fila):**

```
0s       → técnico aperta "CONCLUIR OS"
0s       → app manda as 3 fotos de uma vez
0–15ms   → backend só avisa a fila "tem 3 fotos pra subir" (rápido — é
           escrever um recado no Redis, não é o upload de verdade)
15ms     → backend responde 202 — tela destrava quase na hora
(em paralelo, sem o técnico esperar)
           → o worker sobe as 3 fotos, uma de cada vez, no tempo dele
```

Detalhes completos, com os trechos de código reais e os dois achados extras, estão no `ROADMAP-PLENO.md`, item "1. Fila / Mensageria".

---

## 3. As peças que existem no projeto (`src/queue/`)

Ainda é um **protótipo isolado** — não está ligado ao `fotoController.ts`/`saveAssinatura.ts` reais, de propósito, pra aprender o mecanismo sem misturar com a complexidade de multipart/Prisma/Cloudinary de uma vez.

### `uploadQueue.ts` — o produtor

```ts
import { Queue } from "bullmq";

export const uploadQueue = new Queue("upload-imagem", {
  connection: { url: process.env.REDIS_URL },
});
```

Só declara a prateleira `"upload-imagem"` e sabe colocar coisa nela.

### `uploadWorker.ts` — o consumidor

```ts
const worker = new Worker(
  "upload-imagem",
  async (job) => {
    const resultado = await cloudinary.uploader.upload(job.data.caminhoDoArquivo, {
      folder: "exemplo-fila",
    });
    return resultado.secure_url;
  },
  { connection: { url: process.env.REDIS_URL } }
);
```

Roda como **processo separado** (`npm run worker`), fica em loop olhando a mesma prateleira `"upload-imagem"`. A string do nome é **a única coisa que conecta** os dois arquivos — nenhum importa o outro.

### `addSampleJob.ts` — simula o que a API faria

Aceita um ou mais caminhos de arquivo, e enfileira um job por arquivo — do jeito que `fotoController.ts` real receberia várias fotos:

```ts
for (const caminhoDoArquivo of caminhos) {
  const job = await uploadQueue.add("upload-imagem", { caminhoDoArquivo });
}
```

### `dashboard.ts` — painel visual (Bull Board)

```ts
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(uploadQueue)],
  serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());
app.listen(3001);
```

Sobe uma paginazinha web (`@bull-board/express`) só de desenvolvimento, sem nada a ver com a API principal do Fire OS, mostrando os jobs da fila em tempo real: quantos estão esperando, ativos, concluídos ou falhados.

---

## 4. Como rodar tudo você mesmo

Precisa de 3 terminais abertos ao mesmo tempo (mais o Docker rodando):

```bash
# 1. Sobe o Redis (uma vez só, ele fica rodando em background)
docker compose up -d fireos-redis

# Terminal 1 — deixa rodando, é quem processa os jobs
npm run worker

# Terminal 2 — deixa rodando, é o painel visual
npm run queue:dashboard
# abre http://localhost:3001/admin/queues no navegador

# Terminal 3 — dispara jobs de verdade, um ou vários de uma vez
npm run queue:demo -- caminho/foto1.png caminho/foto2.png caminho/foto3.png
```

---

## 5. O teste ao vivo que já rodei (não é "deveria funcionar", rodou de verdade)

Mandei 4 fotos de teste de uma vez só. Log real do `addSampleJob.ts`:

```
Job 1 adicionado na fila (...foto-1.png)
Job 2 adicionado na fila (...foto-2.png)
Job 3 adicionado na fila (...foto-3.png)
Job 4 adicionado na fila (...foto-4.png)

4 job(s) enfileirados em 36ms.
```

**36 milissegundos pra enfileirar as 4** — é basicamente instantâneo, porque só está escrevendo recados no Redis, não fazendo upload nenhum ainda.

Log real do worker, processando um por vez, com horário:

```
[16:43:15] [worker] peguei o job 1, subindo foto-1.png pro Cloudinary...
[16:43:18] [worker] pronto! URL: https://res.cloudinary.com/.../acip9slktwetlxnrxref.png
[worker] job 1 concluído.
[16:43:18] [worker] peguei o job 2, subindo foto-2.png pro Cloudinary...
[16:43:19] [worker] pronto! URL: https://res.cloudinary.com/.../fpszxjwusdleqgnrhfri.png
[worker] job 2 concluído.
[16:43:19] [worker] peguei o job 3, ...
[16:43:19] [worker] peguei o job 4, ...
```

Do job 1 sendo pego (16:43:15) até o job 4 terminar (16:43:20) foram **5 segundos** de processamento real — mas isso aconteceu **depois** da API já ter "respondido" (os 36ms lá em cima). E confirmei via `curl` no painel (`/admin/queues/api/queues`) o resultado batendo com a realidade:

```json
"counts": { "active": 0, "completed": 4, "waiting": 0, "failed": 0 }
```

Isso prova as peças todas funcionando juntas de verdade: Redis guardando os jobs, BullMQ organizando a fila, o worker processando um de cada vez (não em paralelo — é o comportamento padrão), Cloudinary recebendo os arquivos, e o painel mostrando o estado real.

---

## 6. Glossário rápido

| Termo | O que é |
|---|---|
| **Queue (fila)** | A lista de jobs pendentes, guardada no Redis, identificada por um nome (`"upload-imagem"`) |
| **Job** | Um "recado" na fila — os dados de uma tarefa a fazer (aqui, o caminho de um arquivo) |
| **Producer (produtor)** | Quem adiciona jobs na fila (`uploadQueue.add(...)`) — no Fire OS, seria a rota da API |
| **Worker (consumidor)** | Processo separado que tira jobs da fila e processa, um de cada vez |
| **Connection** | Como o BullMQ acha o Redis (`REDIS_URL` no `.env`) |
| **Concurrency** | Quantos jobs um worker processa ao mesmo tempo — por padrão é 1 (por isso os 4 jobs do teste rodaram em sequência, não em paralelo) |

---

## 7. O que ainda falta (próximos passos)

- [ ] Ligar de verdade no `fotoController.ts` — trocar o `cloudinary.uploader.upload(...)` síncrono por `uploadQueue.add(...)`.
- [ ] Resolver o gap da assinatura (`enviarAssinatura()` nunca é chamada) antes de pensar em fila pra ela.
- [ ] Configurar `concurrency` no worker se algum dia fizer sentido processar mais de uma foto ao mesmo tempo.

Checklist completo, com o "molde" de narrativa pra entrevista e os achados extras, está no `ROADMAP-PLENO.md`.
