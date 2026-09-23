# Como usar os docs deste projeto pra estudar pra entrevista de Pleno

Não são três versões da mesma coisa — são três camadas diferentes, e servem pra perguntas diferentes numa entrevista. Este arquivo é só o mapa de "qual doc eu abro pra qual tipo de pergunta".

---

## `LEITURAS-MEDIUM.md` → vocabulário técnico + fundamentação teórica

Ensina a **nomear** o que você já fez. Sem isso, você sabe fazer mas não sabe dizer "isso é Dependency Inversion" ou "isso é cache-aside". Treina a pergunta tipo "você conhece SOLID?" ou "explica Repository Pattern" — onde o entrevistador quer ver se você conecta teoria com prática, não só decorou definição.

12 seções, cada uma amarrando um conceito a um trecho real do código: SOLID, Repository Pattern, Zod ("parse, don't validate"), Dependency Injection, CASL/RBAC, error handling centralizado, cache-aside, BullMQ, pirâmide de testes vs. testing trophy, o bug do `this` perdido, Prisma ORM, TestContainers.

---

## `ARQUITETURA-ANTES-DEPOIS.md` → visão de sistema / raciocínio de trade-off

Esse é o "me conta sobre a arquitetura do seu projeto" resolvido — tem:
- Seção 3: fluxo de uma requisição ponta a ponta.
- Seção 6: "o que quebraria com 1000 técnicos usando ao mesmo tempo?" — pergunta clássica de system design.
- Seção 7: por que não usar S3 direto, antes de justificar arquitetura (gerar sob demanda vs. persistir).

Treina você a **defender uma decisão**, não só descrever ela — a diferença entre "usei Redis" e "usei Redis porque X, e sei quando não usaria".

---

## `GUIA-*.md` (6 arquivos, um por pilar) → histórias reais, formato STAR

O material mais valioso pra entrevista comportamental/técnica combinada — cada um narra, com data, o "antes → decisão → bug real achado → depois". Exemplos prontos:

- **`GUIA-TESTES-INTEGRACAO-E2E.md`** — a história do bug dos 48 controllers (`this` perdido). Resposta pronta pra "conte sobre um bug difícil que você encontrou".
- **`GUIA-CACHE-REDIS.md`** — tem uma seção literal chamada "A resposta correta pra entrevista", sobre por que não colapsar os 8 `count()` numa query só. Resposta pronta pra "por que você não fez X de um jeito mais simples?".
- **`GUIA-ZOD-REPOSITORY.md`** — 12 "passos" datados, cada um com um achado de produção real (rota que nunca existiu, tabela errada, etc.). Várias respostas prontas pra "me dá um exemplo de bug que você encontrou em produção".
- **`GUIA-RBAC-CASL.md`**, **`GUIA-FILA-BULLMQ.md`**, **`GUIA-CI-LINT.md`** — mesmo formato, um pilar cada.

---

## Resumindo o fluxo de estudo

**Medium te dá o nome, Arquitetura te dá o mapa, os Guias te dão as histórias.**

Numa entrevista: comece pela arquitetura (visão geral), aprofunde com o Guia do assunto que a pergunta tocar, e use o vocabulário do Medium pra soar preciso, não genérico.
