# Encurtador de URL — Rumo ao Nível Sênior

> *O mesmo projeto clássico de entrevista, construído com as decisões que separam quem sabe codar de quem sabe arquitetar.*

Revive a ideia original de "Encurtador de URL" (trocada por "Validador de Ingressos" no `IDEIAS-PROJETOS-PLENO.md`), agora aprofundada — inspirada nos tópicos de uma página que você encontrou, adaptada e construída com conhecimento próprio pro seu caso específico.

## Bate exatamente com a nossa ideia original, ou não?

**É o mesmo projeto central (encurtador de URL, cache pra escala), mas em duas profundidades diferentes** — e esse documento aqui já é a fusão das duas. Comparando lado a lado:

| | Nossa ideia original (Project 2, antes de virar Ingressos) | Encurtador do curso | Esse documento (2B) |
|---|---|---|---|
| API + Postgres + geração de código curto | ✅ | ✅ | ✅ |
| Cache-aside (Redis) | ✅ | ✅ | ✅ |
| Rate limiting na criação de link | ✅ | Não mencionado | ✅ (mantido) |
| Fila pra contagem assíncrona de clique | ✅ (BullMQ) | ✅ (RabbitMQ) | ✅ (BullMQ) |
| Resiliência — o que fazer se o Redis cair | ❌ Não tinha | ✅ (uma das 7 perguntas centrais) | ✅ **adicionado** (seção "Camada de resiliência") |
| Observabilidade / tracing | ❌ Não tinha | ✅ | ✅ **adicionado** |
| Deploy real em cloud (AWS) | ❌ Não tinha | ✅ | ✅ **adicionado** (Lambda + API Gateway) |
| Escopo estimado | 1 semana | 4 noites (curso guiado) | 1.5-2.5 semanas (sozinho, sem guia) |

**Resumindo:** nossa ideia original já cobria a metade "clássica de entrevista" (cache, rate limit, fila) — o que faltava, e é exatamente o que separa pleno de sênior na página do curso, é a metade "produção de verdade" (resiliência, observabilidade, cloud real). Foi isso que eu incorporei quando reescrevi esse documento — não é coincidência bater, é porque eu especificamente preenchi o gap entre as duas quando você mandou o link.

---

## Por que isso bateu com o seu caso

Você compartilhou essa página não pelo curso em si, mas porque o **problema que ela descreve é literalmente o seu agora**. Vale registrar por quê, com precisão:

- **"Saber codar é só uma parte do trabalho" / "o gap entre saber programar e saber construir software"** — é exatamente a distância entre o Fire OS "funcionando" (47 OS processadas, uso real) e o Fire OS que a gente foi destrinchando nesse roadmap inteiro: RBAC escrito mas nunca ligado, Zod ainda em aberto, `routes.ts` com 80 rotas sem estrutura. Você já sabe fazer o sistema **funcionar**; o que estamos treinando há semanas é o próximo degrau, fazer ele **aguentar crescer**.
- **"Talvez você já saiba criar componentes, APIs, integrar banco de dados e colocar projetos no ar. Mas quando a aplicação fica maior, você sente que ainda está apenas juntando peças"** — é a mesma sensação por trás de perguntas suas nessa conversa como "isso é muito diferente do Hone?" ou "consigo fugir dessa ideia genérica?": não é dúvida técnica pura, é o instinto de que peça-por-peça funcionando não é a mesma coisa que sistema bem arquitetado.
- **"É júnior e quer aumentar sua maturidade técnica. É pleno e quer fortalecer fundamentos de arquitetura"** — a página descreve os dois perfis como o mesmo público, porque a transição não é um degrau único, é a mesma direção continuada. Bate direto com a sua situação: ~10 meses de experiência, mirando pleno em 3 meses.
- **"Framework muda, biblioteca muda, ferramenta de IA muda — mas entender problema, avaliar trade-off e tomar decisão técnica continua valendo"** — é por isso que esse portfólio inteiro (Crivo, Bússola de Stack, Ingressos, Encurtador) importa menos pela tecnologia específica de cada um e mais pelo hábito que você está construindo: nomear decisão, considerar alternativa, aceitar trade-off, documentar por quê.

O motivo desse projeto (e desse documento) existir não é "seguir o curso de graça" — é que a dor descrita na página é real e é sua, curso pago ou não.

---

## Aviso de transparência sobre a fonte

O link que você mandou (`iarq.feliperochafsc.com.br`) **não é um tutorial gratuito** — é a página de vendas de uma imersão paga (R$47, 4 noites ao vivo, upsell de um curso de SOLID avaliado em R$497). Você mandou o PDF da página inteira depois, e confirma o que a primeira leitura já indicava: a página é só framing e perguntas — as respostas técnicas de verdade ficam dentro da imersão paga, não na página.

O que fiz: separei o que é **framing genérico de engenharia** (útil, não é segredo de ninguém, pode ficar) do que é **pitch de venda** (não entra aqui). Fiquei com as perguntas-guia e o mapa de tópicos, e construí o conteúdo técnico de verdade eu mesmo, adaptado ao seu `ROADMAP-PLENO.md`.

**Curiosidade que vale registrar:** o curso usa **RabbitMQ**, não BullMQ. São dois brokers de mensageria diferentes (RabbitMQ é mais "enterprise", usado com o protocolo AMQP; BullMQ é mais simples, feito especificamente pra Node.js sobre Redis). Você já tem BullMQ coberto — se algum dia quiser diversificar ainda mais o portfólio, aprender RabbitMQ seria um adicional, não uma correção.

**Do FAQ da página, uma reasseguração que vale registrar pro seu caso:** *"Preciso dominar RabbitMQ, Redis, Docker ou AWS? Não — as tecnologias serão ensinadas dentro do contexto do projeto."* Isso confirma exatamente a lógica que você já vem seguindo nesse roadmap inteiro: você não precisa saber AWS/observabilidade antes de começar o Projeto 2B — aprende fazendo, no contexto, do jeito que já aprendeu fila e Redis com o Fire OS.

---

## As perguntas que valem mais que a resposta paga

A página lista 7 perguntas como o que "separa o dev que recebe tarefa do profissional que participa da decisão técnica". Essas perguntas não são segredo nenhum — são as perguntas certas de qualquer engenheiro sênior, curso nenhum é dono delas. Valem como checklist pra qualquer projeto do seu portfólio, não só esse:

- [ ] Onde essa responsabilidade deveria ficar?
- [ ] Quando vale a pena usar uma fila?
- [ ] Onde cache realmente faz sentido?
- [ ] Como evitar que uma falha derrube todo o sistema?
- [ ] Como descobrir o que aconteceu quando algo quebra em produção?
- [ ] Como estruturar o código pra ele não virar um caos?
- [ ] Como usar IA sem terceirizar pra ela as decisões que você deveria saber tomar?

**A última é a mais importante pro seu momento específico.** Você está usando IA (eu, nessa conversa inteira) pra planejar, mas quem decide o que entra no roadmap, o que faz sentido pro seu caso, o que rejeitar (já rejeitou 3 ideias de Projeto 1B até chegar no Crivo) é você. Isso já é, na prática, a resposta pra essa pergunta — vale nomear isso conscientemente numa entrevista.

**A página também lista o que você deve conseguir defender sobre qualquer decisão técnica** — e isso é literalmente o "molde da narrativa" que já está documentado no `ROADMAP-PLENO.md` desde o início:

| Pergunta da página | Onde já existe no seu roadmap |
|---|---|
| Por que fizeram daquela maneira | "O que escolhi e o que aceitei perder" (molde da narrativa) |
| Quais alternativas existiam | "As opções que considerei" (molde da narrativa) |
| Quais trade-offs estavam envolvidos | A seção inteira "O que é trade-off" do `ROADMAP-PLENO.md` |
| O que mudaria com mais usuários | A pergunta de system design do item "Minhas Dúvidas" ("o que quebraria com 1000 técnicos usando o Fire OS ao mesmo tempo") |
| Como aquela decisão impacta o resto do sistema | O rastreamento de fluxo que você já praticou (item "System Design" do glossário) |

Você não precisa pagar pela imersão pra treinar esse raciocínio — já está treinando, há semanas, neste conjunto de documentos.

---

## O problema de escala (recapitulando, com mais profundidade)

Um link curto de um post que viraliza recebe rajadas enormes de clique **no mesmo registro**. Isso já está documentado no `IDEIAS-PROJETOS-PLENO.md` — a diferença aqui é ir além de "usa cache" e pensar em **o que acontece quando a própria peça de infraestrutura que resolve isso (o Redis) falha**. É essa pergunta — "e se a solução também quebrar?" — que separa pleno de sênior.

---

## Arquitetura, camada por camada

O mapa de tópicos do curso organiza o projeto em 6 camadas. Vou pelas mesmas 6, com o conteúdo de verdade:

### 1. Camada de API — onde a responsabilidade deveria ficar

A pergunta "onde essa responsabilidade deveria ficar?" tem uma resposta prática: a rota (`controller`) só orquestra — recebe a requisição, chama o `service`, devolve a resposta. Toda decisão (gerar código, checar cache, validar) mora no `service`, nunca na rota. É a mesma separação que você já pratica no Fire OS (`CreateUserController` chamando `CreateUserService`) — aqui é só nomear conscientemente: isso é **Single Responsibility Principle** aplicado na fronteira HTTP.

### 2. Camada de banco (PostgreSQL)

Tabela `links` com `codigo` (índice único, é por ele que toda leitura acontece), `url_destino`, `criado_em`, `expira_em`. O índice único no `codigo` é o que torna o lookup rápido mesmo sem cache — cache é a camada de cima, não substitui um índice bem pensado embaixo.

### 3. Camada de cache (Redis) — cache-aside, igual ao Crivo, aplicado num contexto diferente

```ts
async function buscarDestino(codigo: string) {
  const cacheKey = `link:${codigo}`;
  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  const link = await prisma.link.findUnique({ where: { codigo } });
  if (!link) return null;

  await redis.set(cacheKey, link.urlDestino, "EX", 86400); // 24h
  return link.urlDestino;
}
```

Mesma lógica que você já vai aplicar no Crivo (cache do perfil) — aqui reforça o padrão num segundo contexto, o que é bom pra portfólio: mostra que você entende o **princípio** (cache-aside), não decorou um exemplo só.

### 4. Camada de mensageria (fila) — contagem de clique assíncrona

Igual já desenhamos antes: o clique é registrado, mas a contagem/estatística acontece em background, via BullMQ — o redirect nunca espera por isso.

### 5. Camada de resiliência — o conceito novo que nenhum outro projeto do portfólio cobre ainda

**A pergunta central do curso** ("como evitar que uma falha derrube todo o sistema?") é sobre isso: **o que acontece quando o Redis, que existe pra deixar tudo rápido, fica fora do ar?** Sem tratamento, `redis.get()` lança uma exceção e o redirect inteiro quebra — o cache, que deveria ser uma otimização, virou um ponto único de falha.

```ts
async function buscarDestinoComFallback(codigo: string) {
  try {
    const cacheKey = `link:${codigo}`;
    const cached = await redis.get(cacheKey);
    if (cached) return cached;
  } catch (err) {
    console.error("Redis indisponível, caindo pro Postgres direto:", err);
    // não relança o erro — o cache é opcional, o banco é a fonte da verdade
  }

  const link = await prisma.link.findUnique({ where: { codigo } });
  return link?.urlDestino ?? null;
}
```

Isso é um **fallback** simples — a versão mais avançada disso é um **circuit breaker** (depois de N falhas seguidas do Redis, para de tentar por um tempo, em vez de esperar o timeout de cada tentativa) — mais complexo, mas dá pra citar como "próximo passo" mesmo sem implementar.

### 6. Camada de observabilidade

Sentry (já planejado pro Crivo) + log estruturado, mas aqui com um detalhe a mais: logar especificamente **toda vez que o fallback do item 5 é acionado** — isso vira um alerta de "o cache caiu, o sistema seguiu funcionando mais devagar" — é a diferença entre "quebrou" e "degradou", que é exatamente o tipo de coisa que observabilidade existe pra mostrar.

### 7. Camada de infraestrutura — AWS de verdade

Aqui mora o gap que nenhum projeto do portfólio fecha ainda. Proposta com escopo pequeno: deploy da API como **função AWS Lambda** (via Serverless Framework ou AWS SAM, com `serverless-http` envolvendo o Express) + **API Gateway** na frente. Isso fecha **dois gaps de uma vez**: "cloud real (AWS)" e "arquitetura serverless" — que antes exigiam dois projetos diferentes.

---

## O que isso fecha, cruzando com os documentos já existentes

| Gap (do `IDEIAS-PROJETOS-PLENO.md`) | Situação antes | Depois desse projeto |
|---|---|---|
| Cloud real (AWS) | ❌ Nenhum projeto cobre | ✅ Lambda + API Gateway de verdade |
| Microsserviços/Serverless | ❌ Não coberto (Neon não conta, ver "Minhas Dúvidas") | ✅ Serverless de aplicação, não só de banco |
| Resiliência / fallback | Nunca nomeado em lugar nenhum | ✅ Fallback explícito quando o Redis cai |
| Cache-aside | Só no Crivo (planejado) | Reforçado num segundo contexto — prova que é princípio, não decoreba |
| Observabilidade | Planejada pro Crivo | Reforçada com um caso de uso específico (alerta de degradação) |

---

## Estimativa de tempo — dia a dia

**Semana 1 — núcleo funcional**
- **Dia 1:** setup (Express + Prisma + Postgres + Redis via Docker), schema com índice único no código
- **Dia 2:** geração de código curto (base62) + rota de criação + rota de redirect síncrona, sem cache ainda
- **Dia 3:** cache-aside no redirect (item 3)
- **Dia 4:** fallback quando o Redis falha (item 5) — inclusive testando isso de propósito (derrubar o Redis local e ver o sistema continuar)
- **Dia 5:** fila pra contagem de clique assíncrona (reaproveita `GUIA-FILA-BULLMQ.md`)

**Semana 2 — observabilidade e infraestrutura real**
- **Dia 6:** Sentry + log estruturado, com alerta específico pro evento de fallback
- **Dia 7-8:** testes (cache hit, cache miss, fallback do Redis, geração de código sem colisão)
- **Dia 9-10:** empacotar como função Lambda (`serverless-http`), configurar API Gateway
- **Dia 11:** deploy real na AWS, testar em produção
- **Dia 12:** README documentando as 7 camadas e as decisões — o mesmo nível de cuidado do Fire OS

~12 dias, um pouco mais enxuto que o Crivo porque não tem frontend nem IA.

## O que estudar antes de começar

- [ ] Índices em Postgres — por que um índice único no `codigo` importa mesmo com cache na frente
- [ ] Padrão de fallback / circuit breaker — o nível básico (try/catch com log) é suficiente pra esse projeto; circuit breaker completo é leitura extra, não implementação obrigatória
- [ ] `serverless-http` (ou similar) — como envolver uma API Express pra rodar dentro de uma Lambda sem reescrever tudo
- [ ] Conceitos básicos de API Gateway + Lambda na AWS — não precisa ser especialista, precisa entender o suficiente pra fazer o deploy e explicar por que funciona

### Dá pra aprender sozinho, sem o curso? Sim — com essa ressalva

Nenhuma das 3 peças que faltavam (resiliência, observabilidade, AWS) é conhecimento exclusivo do curso — é engenharia padrão, documentada de graça. A diferença real de pagar é ter alguém corrigindo erro **ao vivo**; sozinho, espera mais fricção, principalmente no deploy AWS (é onde a maioria trava — permissão de IAM, configuração de API Gateway). Não é motivo pra desistir, é motivo pra não subestimar o tempo.

**Recursos gratuitos concretos, um por peça** (confira a doc atual antes de seguir — link/versão de ferramenta muda com frequência):

- **Resiliência/fallback:** o artigo clássico do Martin Fowler sobre Circuit Breaker (referência histórica do padrão, gratuito) — pro nível básico desse projeto, o try/catch com log já documentado acima é suficiente, o artigo é só pra entender o próximo degrau
- **Observabilidade:** a documentação oficial do Sentry pra Node.js (quickstart gratuito, é literalmente "instale o pacote, configure a chave, pronto") — mesma ferramenta já planejada pro Crivo, então é conhecimento reaproveitado, não peça nova
- **Deploy AWS Lambda:** a documentação oficial do **Serverless Framework** (tem tutorial "getting started" gratuito, é a forma mais direta de rodar uma API Express numa Lambda sem aprender toda a AWS de uma vez) — alternativa mais crua é o AWS SAM CLI direto, mais controle, mais fricção

## Conceitos/keywords que esse projeto cobre

`Redis (cache-aside)` · `resiliência / fallback` · `BullMQ` · `AWS Lambda` · `API Gateway` · `arquitetura serverless` · `observabilidade (Sentry + log de degradação)` · `SOLID (SRP na fronteira HTTP)` · `testes unitários`

## Escopo — continua pequeno, mesmo com AWS de verdade

Só 2 rotas (criar link, redirecionar) + 1 worker de contagem. A complexidade nova está nas **decisões** (fallback, deploy serverless), não na quantidade de código — é o mesmo princípio dos outros projetos do portfólio: pequeno de propósito, pra terminar de verdade dentro dos 3 meses.

---

## Junior, Pleno e Sênior — a mesma feature, três profundidades

O material que inspirou esse documento vende a ideia de "pleno pra sênior" — vale registrar a régua completa, já que você está documentando essa progressão:

| Decisão | Junior | Pleno | Sênior |
|---|---|---|---|
| Cache | Não usa, ou usa sem pensar em quando invalidar | Cache-aside com TTL, sabe explicar por quê | Sabe o que fazer quando o **cache em si** falha (item 5) |
| Fila | Chama tudo direto na rota | Usa fila pra não travar a resposta | Pensa em o que fazer se um job falhar repetidamente (dead-letter, retry com limite) |
| Deploy | "Funciona na minha máquina" | Docker + CI/CD | Escolhe entre serverless/container conscientemente, sabendo o trade-off de cada um |
| Observabilidade | `console.log` | Sentry capturando erros | Log de **degradação**, não só de erro — sabe diferenciar "quebrou" de "está mais lento" |

Você não precisa provar "sênior" agora — mas saber nomear essa régua, e mostrar que pelo menos pensou no próximo degrau (mesmo sem implementar tudo), já é sinal de maturidade acima de pleno júnior.
