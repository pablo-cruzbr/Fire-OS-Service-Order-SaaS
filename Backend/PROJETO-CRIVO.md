# Crivo — Match de Vaga em Lote

> *Pare de ler vaga por vaga. Deixa a IA dizer quais valem seu tempo.*

Documento dedicado ao Projeto 1B do `IDEIAS-PROJETOS-PLENO.md` — nome fictício **Crivo** (referência de copy em `design-references/crivo-landing-copy.md`, referência visual em `design-references/`, baseada no [usefleming.com](https://usefleming.com/)).

---

## Por que esse, e não os anteriores

As 3 ideias anteriores (entrevistador, follow-up, tutor de código) eram todas do formato "cola um texto, recebe outro texto" — no fundo, uma casca em cima de um chat de IA. O Crivo é diferente de propósito: a IA não escreve nada pra você ler, ela **julga e classifica**, devolvendo um veredito estruturado (nota + listas), e o valor do app está em processar várias dessas avaliações de uma vez, sozinho, em fila.

## O que é, em uma frase

Você salva seu perfil (skills, nível, tecnologias) uma vez, e depois vai colando descrições de vaga — uma de cada vez, ou várias seguidas. Cada vaga colada vira um job numa fila. A IA compara cada uma com seu perfil e devolve um **score de compatibilidade estruturado**: 0 a 100, o que bate, o que falta, e uma recomendação curta (vale a pena aplicar ou não é prioridade agora). No fim, uma lista ordenada por score — você olha só as vagas que realmente valem seu tempo.

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
const { object } = await generateObject({
  model: groq("llama-3.3-70b-versatile"),
  schema: matchSchema,
  prompt: `Compare o perfil e a vaga, avalie compatibilidade:\n\nPerfil: ${perfil}\n\nVaga: ${vaga}`,
});
```

## Como fica pleno

- **BullMQ**, aqui de forma central (não opcional): cola 10 vagas de uma vez, 10 jobs entram na fila, o worker processa uma avaliação de IA por vez — você não fica esperando as 10 chamadas de IA travando a tela
- **Zod** valida um schema mais rico que o do Extrator (com `enum` e `array` aninhados), e ainda serve de rede de segurança contra a IA "alucinar" um formato torto
- **Rate limit de verdade**: cada avaliação é uma chamada à API da Groq com limite de uso — limite de quantas vagas por dia, pra não estourar a cota gratuita processando um lote gigante de uma vez
- **Testes**: mockar `generateObject` devolvendo scores diferentes, e testar que a lista final fica ordenada certo — um teste que já mistura lógica de negócio com IA mockada

## Conceitos/keywords que esse projeto cobre

`IA / LLM (Groq)` · `saída estruturada complexa (schema aninhado)` · `BullMQ (processamento em lote)` · `Zod` · `rate limiting` · `testes unitários`

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

1 tela de perfil + 1 tela de lista de vagas avaliadas, 1 worker. 1-2 semanas.

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
