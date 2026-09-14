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

Nasceu como **protótipo isolado** — não ligado ao `fotoController.ts`/`saveAssinatura.ts` reais, de propósito, pra aprender o mecanismo sem misturar com a complexidade de multipart/Prisma/Cloudinary de uma vez. **Atualização 14/09:** o `fotoController.ts` já está ligado de verdade nessas mesmas peças (ver seção 6) — o que muda é só quem chama `uploadQueue.add(...)` e o que o worker faz com o job; as peças abaixo continuam as mesmas.

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

## 6. Ligado ao fluxo real — 14/09/2026

O protótipo (seções acima) provava que Redis + BullMQ funcionavam juntos, isolado, sem tocar em produção. Esta seção é a parte que faltava: o `fotoController.ts` de verdade parou de subir foto pro Cloudinary dentro do request. Em pedaços pequenos:

### Pedaço 1 — o que mudou no `fotoController.ts`, exatamente

```ts
// ANTES — cada foto trava o request até o Cloudinary responder
for (const file of files) {
  const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, { folder: "ordens_servico" });
  const foto = await prismaClient.fotoOrdemServico.create({ data: { url: uploadResult.secure_url, ordemdeServico_id } });
  fotos.push(foto);
}
return res.json(fotos); // só responde depois de TODAS terminarem
```

```ts
// DEPOIS — só entrega o recado pra fila e responde na hora
for (const file of files) {
  await uploadQueue.add("upload-foto-os", { ordemdeServico_id, tempFilePath: file.tempFilePath });
}
return res.status(202).json({ message: `${files.length} foto(s) recebida(s), processando em segundo plano.` });
```

`202 Accepted` (em vez de `200 OK`) é o código HTTP que existe exatamente pra isso: "recebi seu pedido, é válido, mas ainda não terminei de processar — não espere o resultado final nessa resposta". É um detalhe pequeno, mas é o tipo de coisa que sinaliza que você conhece o protocolo, não só "funciona".

### Pedaço 2 — quem faz o trabalho de verdade agora: o worker aprendeu 2 tarefas

O `uploadWorker.ts` do protótipo só sabia fazer uma coisa (subir pro Cloudinary e logar). Agora ele reconhece **dois tipos de job** na mesma fila, pelo nome do job (`job.name`):

```ts
const worker = new Worker("upload-imagem", async (job) => {
  if (job.name === "upload-foto-os") {
    return processarUploadFotoOS(job);   // job de verdade: sobe + salva no Postgres
  }
  return processarUploadDemo(job);       // job do "npm run queue:demo": só loga, não toca no banco
}, ...);
```

Por que não criei um worker separado só pro fluxo real? Porque os dois compartilham a mesma infraestrutura (mesma fila, mesma conexão Redis) — dividir por `job.name` dentro de **um** worker é mais simples do que rodar dois processos escutando a mesma prateleira. O protótipo de estudo (`npm run queue:demo`) continua funcionando exatamente igual, sem tocar no banco, útil pra você testar o mecanismo isolado de novo se precisar.

A diferença real entre os dois: `processarUploadFotoOS` faz **duas coisas em sequência**, não uma — sobe pro Cloudinary, e só depois disso dá certo, grava o registro no Postgres. Se o worker morresse bem no meio (entre as duas), o job fica marcado como não concluído no Redis, e o próximo pedaço explica o que acontece a seguir.

### Pedaço 3 — o que acontece se o Cloudinary falhar (retry automático)

Antes, se `cloudinary.uploader.upload` falhasse, o `catch` do controller devolvia um erro pro app e a foto se perdia — o técnico precisaria tentar de novo manualmente. Agora, configurei a fila pra tentar sozinha:

```ts
// uploadQueue.ts
export const uploadQueue = new Queue("upload-imagem", {
  connection: { url: process.env.REDIS_URL },
  defaultJobOptions: {
    attempts: 3,                                    // tenta até 3 vezes
    backoff: { type: "exponential", delay: 2000 },   // espera mais a cada tentativa
  },
});
```

"Exponential backoff" é só isso: em vez de tentar de novo imediatamente (o que provavelmente falharia pelo mesmo motivo, ex.: internet de campo instável), a espera dobra a cada tentativa (2s, 4s, 8s...) — dá tempo da causa da falha (rede, Cloudinary fora do ar por um instante) se resolver sozinha antes da próxima tentativa.

### Pedaço 4 — o bug que eu quase deixei passar: containers têm sistema de arquivo separado

Isso é o achado mais valioso desse item, então vale contar como cheguei nele. Adicionei um serviço `fireos-worker` novo no `docker-compose.yml` (mesma imagem da API, só troca o comando pra rodar o worker em vez do servidor HTTP). Só que, pensando melhor sobre **onde** cada peça roda:

- `fotoController.ts` roda dentro do container `fireos-api` e escreve a foto temporária em `/tmp/` **desse container**.
- O job que ele manda pra fila carrega só o **caminho** do arquivo (`tempFilePath`), não o arquivo em si.
- O worker roda no container `fireos-worker` — **um container diferente**, com seu próprio `/tmp/` isolado, que não tem nada a ver com o `/tmp/` do container da API.

Sem correção, o worker receberia um caminho tipo `/tmp/abc123.jpg` e tentaria abrir um arquivo que, do ponto de vista dele, **nunca existiu** — o job falharia sempre, todas as 3 tentativas, mesmo sem nada de errado com o Cloudinary. Corrigi criando um volume Docker compartilhado, montado no mesmo caminho nos dois containers:

```yaml
# docker-compose.yml
fireos-api:
  volumes:
    - tmp_uploads:/tmp
fireos-worker:
  volumes:
    - tmp_uploads:/tmp
```

Um **volume nomeado** no Compose é uma pasta que o Docker gerencia e pode "plugar" em mais de um container ao mesmo tempo — os dois passam a enxergar o mesmo `/tmp/` de verdade, não uma cópia cada um. Isso é system design pequeno, mas é exatamente o tipo de coisa que só aparece quando você para pra desenhar "que processo roda onde" em vez de assumir que vai funcionar porque funcionou local.

**Limite que não tentei resolver agora, por ser fora do escopo desse item:** mesmo com o volume, isso ainda é "dois containers no mesmo host compartilhando disco" — não escala pra vários hosts diferentes (ex.: API e worker em máquinas físicas separadas, ou em serviços gerenciados tipo AWS ECS com discos não compartilhados). A solução que escala de verdade seria mandar o **conteúdo** do arquivo pro job (base64) ou subir pra um storage intermediário (ex.: o próprio Cloudinary, direto do controller, só que teria que ser síncrono de novo) — decisão que só vale a pena tomar se/quando o projeto precisar rodar em mais de uma máquina.

### Pedaço 5 — o bug que quase escapou no Frontend, achado revisando quem consome essa rota

Antes de considerar isso pronto, chequei quem no projeto chama `POST /foto` — e achei um consumidor real que ia quebrar silenciosamente. O `ViewCardFoto.tsx` (painel web) fazia isto depois do upload:

```tsx
// ANTES — supõe que a resposta do POST já é a foto pronta
const res = await api.post("/foto", formData, {...});
const novas = Array.isArray(res.data) ? res.data : [res.data];
setFotos((prev) => [...novas, ...prev]);
```

Isso funcionava porque, antes, `POST /foto` respondia com a foto já criada (`{ id, url, ordemdeServico_id }`). Com a fila, a resposta virou `{ message: "..." }` — sem `id` nem `url`. Se eu não tivesse corrigido esse arquivo, o painel web continuaria "funcionando" sem erro nenhum no console, só que empurrando um objeto quebrado pra dentro da lista de fotos — um card de foto sem imagem, com key do React undefined. Um bug silencioso, o pior tipo.

```tsx
// DEPOIS — não tenta adivinhar a foto a partir da resposta do POST;
// busca a lista atualizada de verdade depois do upload
await api.post("/foto", formData, {...});
// ...
const fotosRes = await api.get(`/foto/${ordemdeServico.id}`, {...});
setFotos(fotosRes.data);
```

**Limite honesto que fica em aberto:** se o worker ainda não tiver processado a foto no exato momento desse `GET` (ele roda em paralelo, sem garantia de estar pronto em milissegundos), a foto mais nova só aparece da próxima vez que a lista for recarregada — não tem WebSocket nem polling automático ainda. Pra maioria dos casos (upload de imagem pequena, Cloudinary responde rápido) isso passa despercebido; documentando aqui pra não fingir que está 100% resolvido.

**Não mexi (por enquanto, de propósito) no app mobile:** o `FireOS-App/index.tsx` ainda manda as fotos **uma de cada vez**, esperando cada `POST` responder antes de mandar a próxima (`for` com `await` dentro). Isso significa que o ganho de performance de ligar a fila (não travar mais esperando o Cloudinary) só aparece de verdade se o app também parar de esperar sequencialmente — hoje ele ainda espera N respostas HTTP em sequência, só que cada uma delas agora é rápida (202 quase instantâneo) em vez de lenta (esperando o Cloudinary). É uma melhoria real mesmo assim, só que parcial — paralelizar o `uploadImages()` do app é o próximo passo natural, fora do escopo desse item.

### Resultado

- `fotoController.handle` não fala mais com o Cloudinary — só enfileira e responde `202`.
- `uploadWorker.ts` faz o trabalho de verdade (upload + grava no Postgres), com retry automático (3 tentativas, backoff exponencial).
- `docker-compose.yml` ganhou o serviço `fireos-worker` (mesma imagem, comando diferente) e um volume compartilhado (`tmp_uploads`) pros dois containers enxergarem o mesmo arquivo temporário.
- `ViewCardFoto.tsx` (painel web) corrigido pra não quebrar com a resposta assíncrona nova.
- 4 testes novos em `fotoController.test.ts` (mockando a fila, sem precisar de Redis nem Cloudinary de verdade pra rodar), `tsc --noEmit` limpo, 62 testes passando no total.

**Preenchendo o molde da narrativa:**

> O upload de foto travava a resposta HTTP até o Cloudinary terminar, um de cada vez. Já tinha um protótipo isolado de fila (BullMQ + Redis) rodando, então liguei ele no fluxo real: o controller agora só enfileira e responde 202. No caminho, achei dois problemas que não eram óbvios até eu pensar em "onde cada peça roda": (1) o worker ia rodar num container Docker diferente da API, e os dois têm sistema de arquivo isolado por padrão — sem um volume compartilhado, todo job falharia sempre; (2) o painel web já lia a resposta do POST como se fosse a foto pronta, e ia quebrar silenciosamente com o novo formato de resposta assíncrona. Corrigi os dois antes de considerar terminado. Acrescentei retry automático (3 tentativas, backoff exponencial) porque throw-away de uma falha de rede em campo era exatamente o cenário que motivou usar fila, então deixar sem retry seria resolver só metade do problema original.

---

## 7. Glossário rápido

| Termo | O que é |
|---|---|
| **Queue (fila)** | A lista de jobs pendentes, guardada no Redis, identificada por um nome (`"upload-imagem"`) |
| **Job** | Um "recado" na fila — os dados de uma tarefa a fazer (aqui, o caminho de um arquivo) |
| **Producer (produtor)** | Quem adiciona jobs na fila (`uploadQueue.add(...)`) — no Fire OS, seria a rota da API |
| **Worker (consumidor)** | Processo separado que tira jobs da fila e processa, um de cada vez |
| **Connection** | Como o BullMQ acha o Redis (`REDIS_URL` no `.env`) |
| **Concurrency** | Quantos jobs um worker processa ao mesmo tempo — por padrão é 1 (por isso os 4 jobs do teste rodaram em sequência, não em paralelo) |

---

## 8. O que ainda falta (próximos passos)

- [x] ~~Ligar de verdade no `fotoController.ts` — trocar o `cloudinary.uploader.upload(...)` síncrono por `uploadQueue.add(...)`.~~ Feito em 14/09 — ver seção 6 acima.
- [ ] Resolver o gap da assinatura (`enviarAssinatura()` nunca é chamada) antes de pensar em fila pra ela.
- [ ] Configurar `concurrency` no worker se algum dia fizer sentido processar mais de uma foto ao mesmo tempo.
- [ ] Paralelizar `uploadImages()` no app mobile (`FireOS-App`) — hoje ainda manda uma foto de cada vez, esperando cada `POST` responder; só assim o ganho de performance da fila aparece de ponta a ponta (ver seção 6, "não mexi por enquanto").

Checklist completo, com o "molde" de narrativa pra entrevista e os achados extras, está no `ROADMAP-PLENO.md`.
