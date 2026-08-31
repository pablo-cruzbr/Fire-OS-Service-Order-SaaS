# Crivo — Match de Vaga em Lote

> *Pare de ler vaga por vaga. Deixa a IA dizer quais valem seu tempo.*

Documento dedicado ao Projeto 1B do `IDEIAS-PROJETOS-PLENO.md` — nome fictício **Crivo** (referência de copy em `design-references/crivo-landing-copy.md`, referência visual em `design-references/`, baseada no [usefleming.com](https://usefleming.com/)).

---

## Por que esse, e não os anteriores

As 3 ideias anteriores (entrevistador, follow-up, tutor de código) eram todas do formato "cola um texto, recebe outro texto" — no fundo, uma casca em cima de um chat de IA. O Crivo é diferente de propósito: a IA não escreve nada pra você ler, ela **julga e classifica**, devolvendo um veredito estruturado (nota + listas), e o valor do app está em processar várias dessas avaliações de uma vez, sozinho, em fila.

## O que é, em uma frase

Você salva seu perfil (skills, nível, tecnologias) uma vez, e depois vai colando descrições de vaga — uma de cada vez, ou várias seguidas. Cada vaga colada vira um job numa fila. A IA compara cada uma com seu perfil e devolve um **score de compatibilidade estruturado**: 0 a 100, o que bate, o que falta, e uma recomendação curta. Mas o resultado não para numa lista estática — cada vaga avaliada vira um **card num board estilo Kanban** (Radar → Avaliando → Aplicado → Entrevista → Oferta/Recusado), que você arrasta conforme o processo real anda. A IA só faz a triagem de entrada; o acompanhamento é seu.

## Evolução do conceito — fugindo do mecanismo genérico

Depois de mostrar o Crivo pro meu amigo (que trabalha fora), ele apontou o mesmo problema que eu já suspeitava: "cola texto, IA compara, devolve nota" é o mecanismo central de produtos que já existem no mercado (tipo Jobscan, Teal) — mesmo com fila e cache por trás, o **coração da ideia** não é novo, só a engenharia é.

A correção não foi trocar de projeto — foi parar de tratar a IA como o produto inteiro. A IA vira **uma peça de triagem** dentro de uma ferramenta maior de acompanhamento (o board Kanban), que é o que realmente falta no seu dia a dia hoje: um jeito de ver, num olhar só, em que estágio está cada vaga que você já avaliou. O diferencial não é "minha IA é melhor que a do concorrente" — é "meu sistema processa em lote, guarda o histórico organizado por estágio, e ainda faz a triagem inicial sozinho", que é uma combinação de mecanismos (fila + IA + estado de pipeline) mais rica do que qualquer um dos três isolado.

## O conceito técnico central — IA em lote, via fila, com saída estruturada mais complexa

Diferente do Extrator de Texto (1 texto → 1 objeto simples), aqui são **duas entradas comparadas** (seu perfil + a vaga) e a saída é um schema mais rico, com listas dentro do objeto — e cada avaliação vira um **job de fila** processado um por vez pelo worker, não uma chamada direta na hora:

```ts
import { generateObject } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const matchSchema = z.object({
  score: z.number().min(0).max(100),
  requisitosAtendidos: z.array(z.string()),
  requisitosFaltando: z.array(z.string()),
  recomendacao: z.enum(["aplicar", "nao_prioridade"]),
});

// Isso roda dentro do WORKER, um job por vaga — não na hora do request,
// igual já fizemos no protótipo de fila com o Cloudinary (GUIA-FILA-BULLMQ.md).
// O card nasce sempre na coluna "radar" — o usuário move o resto na mão.
const { object } = await generateObject({
  model: groq("llama-3.3-70b-versatile"),
  schema: matchSchema,
  prompt: `Compare o perfil e a vaga, avalie compatibilidade:\n\nPerfil: ${perfil}\n\nVaga: ${vaga}`,
});

await prisma.vaga.create({
  data: { ...object, status: "radar" }, // radar | avaliando | aplicado | entrevista | oferta | recusado
});
```

## Como fica pleno

- **BullMQ**, aqui de forma central (não opcional): cola 10 vagas de uma vez, 10 jobs entram na fila, o worker processa uma avaliação de IA por vez — você não fica esperando as 10 chamadas de IA travando a tela
- **Zod** valida um schema mais rico que o do Extrator (com `enum` e `array` aninhados), e ainda serve de rede de segurança contra a IA "alucinar" um formato torto
- **Rate limit de verdade**: cada avaliação é uma chamada à API da Groq com limite de uso — limite de quantas vagas por dia, pra não estourar a cota gratuita processando um lote gigante de uma vez
- **Máquina de estados simples no Kanban**: `status` é um `enum` com transições esperadas (`radar → avaliando → aplicado → entrevista → oferta/recusado`) — dá pra validar no backend que um card não pula de "radar" direto pra "oferta", por exemplo, em vez de aceitar qualquer string
- **Testes**: mockar `generateObject` devolvendo scores diferentes, testar a ordenação por score, e testar as transições de status válidas/inválidas do Kanban

## Conceitos/keywords que esse projeto cobre

`IA / LLM (Groq)` · `saída estruturada complexa (schema aninhado)` · `BullMQ (processamento em lote)` · `Zod` · `rate limiting` · `testes unitários` · `máquina de estados (status/Kanban)`

---

## Isso é muito diferente do Hone (AI Mock Interview)?

Pergunta justa, porque os dois são "IA + busca de emprego". Resposta honesta: **no tema, não muito — na engenharia por trás, sim, e é isso que importa pra portfólio.**

| | Hone (feito com os colegas) | Crivo |
|---|---|---|
| **O que a IA faz** | Conversa — gera pergunta, escuta resposta, dá feedback, num vai-e-vem de várias etapas | Julga uma vez só — compara dois textos, devolve um veredito. Sem diálogo, sem estado de conversa |
| **Padrão de IA por trás** | Agente conversacional com estado (LangGraph, memória da conversa, streaming de resposta em tempo real) | Classificador em lote (uma chamada de `generateObject`, sem memória entre chamadas) |
| **O que dispara o processamento** | Sessão ao vivo — o usuário está esperando na tela, interagindo em tempo real | Processamento assíncrono — cola 10 vagas e sai, a fila processa sem ninguém esperando |
| **Ênfase de arquitetura** | Orquestração de conversa (LangChain/LangGraph), parsing de currículo em PDF, streaming | Fila/processamento em lote (BullMQ), validação de saída estruturada (Zod) |
| **O que você pessoalmente construiu** | Frontend & Integração — o backend de IA foi o Guilherme e o Vinicius | Tudo — incluindo exatamente a parte (backend + orquestração de IA) que não foi sua no Hone |

A linha mais importante da tabela é a última. Tematicamente os dois apps "usam IA pra ajudar na carreira" — mas o Crivo não é "fazer o Hone de novo", é **construir sozinho a categoria de problema de backend que só vi meus colegas resolverem**: em vez de conversa em tempo real, é processamento em lote; em vez de orquestrar diálogo, é validar saída estruturada; em vez de streaming, é fila. São habilidades de backend genuinamente diferentes, só que aplicadas no mesmo tema geral de "carreira" porque é o que faz sentido pra mim agora.

Se alguém perguntar em entrevista "por que dois projetos de IA pra emprego?", a resposta pronta é essa tabela: temas parecidos, arquiteturas de IA completamente diferentes, e no Crivo quem construiu a parte de backend fui eu, do início ao fim.

**Esclarecimento importante:** a técnica de "forçar a IA a devolver JSON validado por um schema" (o `generateObject` + `matchSchema` do exemplo de código acima) **não é exclusiva do Crivo** — é bem provável que o Hone use algo conceitualmente parecido na feature de "geração automática de feedback e itens de revisão" (o próprio LangChain tem um `withStructuredOutput()` com o mesmo objetivo). A diferença real não está em "quem usa saída estruturada", está em **onde ela mora**: no Hone, se existir, é uma etapa pequena dentro de um pipeline de conversa bem maior orquestrado pelo LangGraph — o produto ali é o diálogo. No Crivo, não tem pipeline de conversa nenhum por trás: essa chamada estruturada **é o produto inteiro**, sem estado, sem streaming, rodando sozinha dentro de um worker de fila.

---

## Como esse projeto mostra a virada de júnior pra pleno

Não é a tecnologia sozinha que prova isso — é a decisão por trás de cada peça. Comparando as duas versões possíveis do mesmo projeto:

| Decisão | Versão Junior | Versão Pleno (o Crivo) |
|---|---|---|
| Onde chamar a IA | Direto na rota, o usuário espera a resposta | Isolada num worker, a rota só enfileira e responde na hora |
| Confiar na resposta da IA | Usa o JSON que voltou, direto | Valida com Zod antes de salvar — trata a IA como fonte não confiável |
| Custo da API | Não pensa nisso até a conta chegar | Rate limit desde o design, pensando em quem paga |
| Testes | Só o caminho feliz (IA respondeu certo) | Testa IA retornando score alto, baixo, e formato errado |
| Quando aplicar RBAC/Zod/testes/CI | "Depois que funcionar" (foi o que aconteceu no Fire OS) | Desde o primeiro commit — a lição que o retrofit do Fire OS ensinou |

Essa tabela em si é material de entrevista: "eu sei apontar a diferença entre a versão que só funciona e a versão que aguenta uso real" é exatamente o que se espera de alguém pleno.

---

## Estimativa de tempo — dia a dia

~10 a 14 dias corridos, trabalhando em blocos pequenos (nada de maratona):

**Semana 1 — backend**
- **Dia 1:** setup do projeto (Next.js + Express + Prisma + `docker-compose` com Postgres e Redis desde o primeiro commit), schema do banco (perfil, vaga, avaliação)
- **Dia 2:** CRUD simples de perfil (cadastrar/editar skills e nível)
- **Dia 3-4:** fila + worker básico, reaproveitando o padrão já testado ao vivo no `GUIA-FILA-BULLMQ.md` — rota que só enfileira, worker que só loga por enquanto
- **Dia 5:** integração real com Groq (`generateObject`) dentro do worker, salvando o resultado no banco
- **Dia 6:** Zod validando entrada (perfil, vaga) e a saída da IA
- **Dia 7:** rate limiting com Redis

**Semana 2 — qualidade e frontend**
- **Dia 8-9:** testes unitários (mock de `generateObject`, mock da fila, teste de ordenação da lista por score)
- **Dia 10-11:** frontend (2 telas, aplicando a referência visual do Crivo/Fleming documentada no `IDEIAS-PROJETOS-PLENO.md`)
- **Dia 12:** CI (GitHub Actions rodando os testes a cada push)
- **Dia 13:** README com o mesmo cuidado do Fire OS — problema real, arquitetura, decisões
- **Dia 14:** polish, revisão geral, deploy opcional

## O que estudar e revisar antes de começar

**Revisar (você já viu isso, é só reler antes de aplicar):**
- [ ] `GUIA-FILA-BULLMQ.md` — o padrão de fila + worker que você já testou ao vivo com o upload de imagem
- [ ] `ROADMAP-PLENO.md`, item 2 — Zod segue em aberto no Fire OS; o Crivo é a chance de aplicar de verdade, desde o início
- [ ] `src/Middleware/can.test.ts` e `src/permissions/ability.test.ts` (Fire OS) — o padrão de mock que você já usou, reaproveitável aqui pra mockar `generateObject`
- [ ] `src/api/ai/chat/route.ts` (Fire OS) — como o Groq já está configurado lá, mesma `GROQ_API_KEY`

**Estudar novo (conteúdo que você ainda não viu):**
- [ ] `generateObject` da Vercel AI SDK (docs oficiais) — a diferença pra `generateText`, que é o que o Fire OS usa hoje
- [ ] Zod com schema aninhado — `z.array(z.string())`, `z.enum([...])` dentro de um `z.object({...})`
- [ ] Rate limiting com Redis — conceito já explicado no `IDEIAS-PROJETOS-PLENO.md`, item "Projeto 2" (token bucket), aplicado agora num contexto diferente (custo de IA, não tráfego HTTP)
- [ ] Operações em lote no Prisma (`createMany` ou loop de `create`) pra salvar várias avaliações de uma vez

---

## Escopo

1 tela de perfil + 1 board Kanban (arrastar card entre colunas de status) + 1 worker. 1.5-2.5 semanas — o board com drag-and-drop (ex.: biblioteca `@dnd-kit`) soma uns 2-3 dias ao escopo original de lista simples, mas é o que tira o projeto do "mecanismo genérico".

## Ajustes de escopo depois do cruzamento com vaga Pleno real (25/08/2026)

Você colou um panorama real de requisitos de vaga Pleno Fullstack (SP) — análise completa cruzada com o portfólio inteiro está no `IDEIAS-PROJETOS-PLENO.md`, seção "Cruzamento com requisitos reais de vaga Pleno Fullstack (SP)". Quatro gaps reais dá pra fechar **sem virar projeto novo**, só ajustando como o Crivo é construído:

- [ ] **Estilização com Tailwind CSS** em vez de CSS/SCSS puro — a vaga pede nominalmente Tailwind/Styled Components/Shadcn, e o Fire OS usa SCSS Modules (não é o que está sendo pedido)
- [ ] **Testes de frontend com Testing Library** nas 2 telas do Crivo — hoje todo teste do portfólio é backend (Vitest); esse é o primeiro teste de frontend de verdade
- [ ] **Sentry + log estruturado básico** no backend do Crivo — algumas horas de trabalho, fecha um gap de observabilidade que hoje é zero em qualquer lugar (Fire OS só tem `console.log`)
- [ ] **Cache-aside de verdade no perfil do usuário** — Redis já está no projeto pra fila, mas ainda não é usado como cache. O perfil é lido toda vez que uma vaga é avaliada e escrito raramente (só quando você edita suas skills) — candidato clássico de cache-aside, com invalidação no update. Código de exemplo na seção "Minhas Dúvidas" do `IDEIAS-PROJETOS-PLENO.md`.

Isso não muda o escopo principal (1 tela de perfil + 1 de lista, 1 worker) nem o prazo — são decisões de **como** construir, não **o quê**, então cabem nas mesmas 1-2 semanas.

### Quanto % desses requisitos o Crivo cobre sozinho, hoje

**Contagem, não achismo:** peguei os 21 itens tecnicamente avaliáveis do panorama que você colou (exclui "inglês técnico", que não dá pra medir por código) e marquei quais o **Crivo sozinho** — sem contar o Fire OS ou os outros projetos do portfólio — cobre, já considerando os 4 ajustes acima aplicados:

**Cobertos pelo Crivo (15 de 21 ≈ 71%):** TypeScript avançado, Express, REST, Prisma, Next.js, estilização moderna (com o ajuste do Tailwind), PostgreSQL, **Redis como cache** (com o ajuste do cache de perfil), testes backend, testes frontend (com o ajuste da Testing Library), Docker, CI/CD, mensageria (BullMQ), observabilidade (com o ajuste do Sentry).

**Não cobertos só pelo Crivo:** NestJS, GraphQL, Git Flow/code review em equipe, cloud real (AWS/GCP/Azure), microsserviços/serverless — esse último não é resolvido pelo Neon (serverless de banco é coisa diferente de serverless de aplicação; ver "Minhas Dúvidas" no `IDEIAS-PROJETOS-PLENO.md` pra detalhe). SOLID/Design Patterns fica de fora da contagem — depende de quanto você documentar as decisões, não é binário (exemplos concretos também estão em "Minhas Dúvidas").

**Três ressalvas importantes, pra não tratar esse número como verdade absoluta:**
1. **Nem todo item pesa igual.** NestJS sozinho, se a vaga insiste nele, pode pesar mais que 3 itens marcados como ✅ juntos — isso aqui é uma contagem simples de itens, não uma média ponderada por importância real pro recrutador.
2. **É só o Crivo isolado.** Somado ao Fire OS (que já cobre RBAC/CASL, TypeScript, Prisma, Postgres, Docker, CI, Next.js) e à sua parte real no Hone (Tailwind/shadcn no frontend), o cálculo do **portfólio inteiro** está no `IDEIAS-PROJETOS-PLENO.md` — hoje ~57%, projetado ~71% depois do Crivo pronto com os 4 ajustes.
3. **Isso não substitui o ATS/o recrutador de verdade.** É um termômetro rápido pra decidir prioridade, não uma nota final — o cruzamento fica mais preciso a cada vaga real nova que você colar aqui.

## Custo — quanto isso vai custar de verdade

Conferi a documentação da Groq antes de responder isso, pra não chutar número (esse tipo de dado muda com frequência, vale sempre reconferir no seu próprio painel antes de assumir):

| Peça | Custo |
|---|---|
| Groq (IA) | Tem plano free — a doc não deixou claro os limites exatos nem se `llama-3.3-70b-versatile` está nele; confira em `console.groq.com` com a chave que o Fire OS já usa, não precisa criar conta nova |
| Redis | Grátis, rodando local via Docker (igual o `fireos-redis` que já criamos) |
| Postgres | Grátis, rodando local via Docker |
| BullMQ, Prisma, Zod | Open source, sem custo |

**Pra construir, testar e usar você mesmo: $0.** Onde poderia aparecer custo: (1) estourar o limite gratuito da Groq processando um lote grande de vagas rápido demais — normalmente só bloqueia a próxima chamada por um tempo, não cobra sem você ativar um plano pago; ou (2) decidir deixar o app no ar 24h pra outras pessoas usarem (deploy em Vercel/Railway) — aí entra hospedagem, que tem free tier mas com limite de uso.

## Frontend — referência visual

Você mandou um print do [usefleming.com](https://usefleming.com/) (salvar em `design-references/`, veja o README daquela pasta). Uma ressalva honesta antes da análise: estruturalmente o site **não é "simples"** — é uma landing page de marketing completa, com header fixo, hero, 4 blocos de seção (features, "how it works", roadmap institucional, comunidade) e rodapé em várias colunas. O que bate com "simples e rápido" é o **estilo visual de cada componente** (poucas cores, bordas finas, bastante espaço em branco), não a quantidade de telas — e é isso que vale aproveitar, sem copiar a estrutura de landing page inteira (o Crivo é uma ferramenta de uso pessoal, não precisa de seção de roadmap institucional nem comunidade).

**Paleta:**
- Fundo quase preto, com leve tom petróleo/azul escuro (não é preto puro)
- Cor de destaque: **teal/ciano vibrante** — usada com moderação, só em: palavra de destaque no título, ícones, botão principal, badges
- Texto: branco nos títulos, cinza-claro/médio no corpo — nunca preto puro em fundo escuro

**Componentes que valem reaproveitar no app:**
- **Badge/pill pequeno** acima de título de seção — texto uppercase pequeno dentro de uma cápsula com borda fina (ex.: usar isso pra indicar o status "ANALISANDO..." ou "CONCLUÍDO" de um job na fila)
- **Cards com borda fina translúcida** (efeito "glass" sutil) — ícone no topo, título em negrito, descrição curta em cinza — perfeito pro card de cada vaga avaliada (ícone de status, empresa, score, lista de requisitos)
- **Botão CTA**: fundo teal sólido, cantos arredondados, contraste alto — usar só num botão principal por tela (ex.: "Avaliar vagas"), não espalhar a cor em vários botões
- **Números grandes em destaque** (a seção de estatísticas do site) — aplicável ao score de compatibilidade (0-100) exibido bem grande no card de cada vaga

**O que NÃO trazer** (isso é estrutura de marketing, não de ferramenta):
- Seções de "roadmap do produto", "comunidade", múltiplos blocos de texto institucional, footer de 4 colunas — o Crivo não precisa disso, é tela de uso, não site de vendas

**Como fica, combinando com a diretriz "bem simples e rápido":**
- 1 tela de perfil + 1 tela de lista de vagas — poucas telas, herdando a paleta escura/teal e o estilo de card do Fleming
- Cada vaga processada aparece como um card (estilo Fleming: borda fina, ícone de status, score grande) assim que o job termina na fila — incremental, não uma tela de loading única

---

## Veredito: mesmo com a sobreposição com o Hone, isso atende como projeto pra vaga pleno?

**Sim, atende — com ressalvas honestas, não como "sim" cego.**

**Por que atende, olhando seu caso especificamente:**
- Fecha gaps concretos que hoje **não existem em nenhum outro lugar do seu portfólio**: fila usada de forma central (não só protótipo isolado), Zod validando de verdade (item 2 do `ROADMAP-PLENO.md`, em aberto desde o início), rate limiting, e saída estruturada de IA
- Você constrói **sozinho, do início ao fim** — diferente do Hone, onde seu papel foi frontend/integração. É a primeira peça do seu portfólio onde fila + IA + validação são 100% seus
- Escopo pequeno (1-2 semanas) cabe real no seu prazo de 3 meses, sem competir por tempo com aplicar pra vaga e estudar
- Já tem a narrativa de entrevista pronta (a tabela de comparação com o Hone, o esclarecimento sobre saída estruturada) — isso sozinho já vale mais que o código, é o que faz um projeto pequeno parecer intencional em vez de "mais um CRUD com IA"

**As ressalvas que valem manter em mente, pra não vender demais:**
- O Crivo **complementa** o Fire OS, não substitui — o Fire OS continua sendo a prova de "sistema real, usado de verdade, 47 OS processadas"; o Crivo prova fundamentos de backend específicos que o Fire OS ainda não cobre
- Nem toda vaga pleno Node/TS pede IA/LLM — se as vagas que você mirar não mencionarem isso, o Crivo pesa menos que um projeto batendo direto nas keywords delas (é por isso que ainda vale colar requisitos de vaga reais aqui quando tiver, como você já tinha planejado)
- É um app de usuário único — RBAC de propósito não entra; se alguém perguntar "cadê autorização aqui", a resposta certa é "não fazia sentido pro escopo", não silêncio
- Essa validação ainda é baseada em raciocínio geral sobre o mercado, não em vaga real cruzada — o veredito definitivo mesmo só fecha quando você colar requisitos de vaga pleno de verdade pra comparar

**Resumindo:** vale construir, mas como uma peça de um portfólio maior (Fire OS + Crivo, e talvez mais um dos Projetos 2/3/4), não como aposta única.
