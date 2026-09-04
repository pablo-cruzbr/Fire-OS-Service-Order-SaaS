# Checklist — Refatoração Backend Pleno (Fire OS)

Checklist único e vivo do que falta pra deixar o backend do Fire OS num nível pleno. O `ROADMAP-PLENO.md` tem o raciocínio, os exemplos de código e o "porquê" de cada item — este arquivo é só o estado atual, pra não se perder no meio de tudo. Atualizar aqui toda vez que alguma coisa mudar de status.

**Legenda:** ✅ feito e testado · 🟡 piloto/parcial (funciona, mas não cobre tudo ainda) · ⬜ pendente

---

## 1. Reorganização de arquitetura (Controller → Service → Prisma)

> Resposta da pergunta "existe uma forma mais pleno de reorganizar isso?": sim — ver `ROADMAP-PLENO.md`, item 2, seção "O que foi implementado".

- 🟡 Piloto aplicado em **Create + Update de OrdemdeServico**: Controller virou camada fina (só fala com Express), Service só recebe dado e devolve resultado — sem `req`/`res` dentro da lógica de negócio.
- ✅ Repository pattern implementado (`src/repositories/OrdemdeServicoRepository.ts`) — isola as chamadas `prismaClient.ordemdeServico.*`, injetado via construtor no Service. Testes agora usam um repository fake em vez de mockar o módulo do Prisma.
- ⬜ Replicar esse padrão (Controller fino + Service + Repository + Zod) pros outros ~100 controllers, módulo por módulo (decidido: um de cada vez, com check-in antes de seguir pro próximo — confirmado de novo em 31/08).

## 2. RBAC / Autorização

- ✅ `can.ts` (RBAC por role) wired em `routes.ts` nas rotas críticas.
- ✅ CASL (`src/permissions/ability.ts`) — ownership de OrdemdeServico: técnico só edita a que é dele.
- ✅ `authorizeOrdemdeServico` middleware testado (`authorizeOrdemdeServico.test.ts`).

## 3. Zod nos controllers

- 🟡 Piloto: `createOrdemdeServicoSchema`, `updateOrdemdeServicoSchema`, `idParamSchema` — aplicados via `validate()` em `POST /ordemdeservico`, `PATCH /ordemdeservico/update/:id` e `GET /ordemdeservico/:id`.
- ⬜ Replicar pros módulos restantes: `user`, `cliente`, `setor`, `equipamento`, `instituicao`, `controles_forms` (os outros formulários além de OrdemdeServico), etc.
- ⬜ Validar variáveis de ambiente no boot com um schema Zod (`DATABASE_URL`, `JWT_SECREATE`, `CLOUDINARY_*`) — falha de config aparecer no start, não em runtime.

## 4. Tratamento de erros global

- ✅ `AppError` / `ValidationError` / `NotFoundError` / `ConflictError` (`src/errors/AppError.ts`).
- ✅ Middleware global `errorHandler` (`src/Middleware/errorHandler.ts`), plugado uma vez em `server.ts` — trata `ZodError`, `AppError` e erros conhecidos do Prisma (`P2002`→409, `P2025`→404, `P2003`→400), resto vira 500 padronizado.
- ✅ `try/catch` removido dos dois controllers já refatorados (Create/Update de OrdemdeServico) — erro sobe sozinho via `express-async-errors`.
- ⬜ Continua pendente **apenas** nos ~100 controllers que ainda não passaram pelo item 3 — a infraestrutura já está pronta pra eles, só falta trocar o `try/catch` de cada um por "deixa subir".

## 5. Filas — BullMQ + Redis (+ AWS)

- ✅ Protótipo isolado testado ao vivo (`src/queue/uploadQueue.ts`, `uploadWorker.ts`, `addSampleJob.ts`, `dashboard.ts` com Bull Board) — Redis rodando via `docker-compose.yml`.
- ⬜ **Ainda não ligado ao fluxo real** — `fotoController.ts` e `saveAssinatura.ts` continuam síncronos, batendo direto no Cloudinary. Ligar a fila de verdade nesses dois é o próximo passo quando fizer sentido.
- ⬜ AWS: decidido deixar **fora do Fire OS por enquanto** — o projeto que cobre AWS de verdade (Lambda + API Gateway) é o Encurtador (`PROJETO-ENCURTADOR.md`, item 7), não faz sentido duplicar esforço aqui. Revisitar só se a decisão mudar.

## 6. Cache

- ✅ Cache-aside com Redis implementado em `ListOrdemdeServicoService.ts` — os 8 `count()` de status agora ficam guardados 30s (`src/redis/index.ts` + método `getTotais()`), com fallback se o Redis cair (não derruba a rota). 50 testes passando, 3 novos cobrindo miss/hit/fallback.
- ✅ Replicado em `ListTecnicoService.ts` — TTL de 60s (maior que o de OS, porque a lista de técnicos muda com frequência bem menor) + invalidação ativa: `CreateTecnicoService`/`RemoveTecnicoService` chamam `redisClient.del()` na chave assim que criam/removem um técnico, pra não deixar a lista velha até o TTL expirar sozinho. 58 testes passando (6 novos: miss/hit/fallback da listagem + invalidação no create/remove).
- ⬜ **Ideia descartada por ora:** colapsar os 8 `count()` num único `GROUP BY` via SQL bruto — tecnicamente possível, mas o ganho fica pequeno já que o cache faz a query rodar só a cada 30s em vez de a cada request.

## 7. Testes automatizados

- ✅ 52 testes unitários passando (Vitest) — cobrindo auth, RBAC/CASL, Create/Update de OrdemdeServico (agora com repository fake em vez de mock do Prisma), a infra de validação/erro, e o cache-aside da listagem.
- ⬜ Testes de integração reais (Postgres do Docker, não só mock do Prisma) — pelo menos no fluxo de autenticação pra começar.
- ⬜ TestContainers — subir Postgres em container isolado por rodada de teste, sem depender do Docker Compose local já estar de pé.
- ⬜ E2E (ponta a ponta, API real respondendo a requests HTTP de verdade).
- ⬜ `coverage` configurado no `vitest.config.ts` com piso mínimo (ex. 60%) e número exposto no README.

## 8. TSC + Linter

- 🟡 `tsc --noEmit` já é usado como checagem manual a cada mudança (limpo hoje), mas **não é um step do CI** ainda — só `npm run test` roda no `test.yml`.
- ⬜ Nenhum linter configurado no projeto (sem ESLint instalado, sem config).
- ⬜ Adicionar `tsc --noEmit` e lint como steps separados no `test.yml`, antes do `test` — falha mais rápido e mais barato.

## 9. Docker

- ✅ Postgres e Redis já rodavam isolados via `docker-compose.yml`.
- ✅ `Dockerfile` multi-stage novo pra própria API (`Backend/Dockerfile`) + `.dockerignore` + serviço `fireos-api` adicionado ao compose, com `depends_on` do banco e do Redis.
- 🟡 Sintaxe validada (`docker compose config` rodou limpo), mas **build real não testado** — Docker Desktop não estava ativo neste ambiente. Rodar `docker compose up --build` numa máquina com Docker rodando pra confirmar de ponta a ponta.
- ✅ Achado à parte: `.env.local` não estava no `.gitignore` — corrigido; conferido que nunca foi commitado.

---

## O que já foi resolvido nesta rodada (referência rápida)

1. **Reorganização de estrutura** — respondido e piloto aplicado, incluindo Repository pattern (item 1).
2. **Zod em cada controller** — piloto aplicado em OrdemdeServico (item 3); rollout pros ~100 restantes é o próximo passo, módulo por módulo.
3. **Tratamento de erros global** — fechado por completo, reaproveitável por qualquer módulo futuro (item 4).
4. **Cache** — cache-aside com Redis implementado nos totais de OS, com fallback testado (item 6).
5. **Docker da API** — Dockerfile multi-stage + compose atualizado; falta só validar o build numa máquina com Docker rodando (item 9).

## Ordem sugerida pro que falta

1. Continuar o rollout de Zod + arquitetura Controller/Service/Repository pros outros módulos (item 1 e 3 andam juntos).
2. Replicar o cache em `ListTecnicoController.ts` (item 6) — mesmo padrão já pronto, só aplicar de novo.
3. Ligar a fila BullMQ no fluxo real de upload (item 5) — já está prototipada, falta só conectar.
4. TSC + Lint no CI (item 8) — barato, alto sinal de disciplina.
5. Testes de integração / TestContainers / E2E (item 7) — mais caro em tempo, deixar por último.

O porquê de cada posição nessa ordem (não é só "mais fácil primeiro") está detalhado em `GUIA-PRIORIZACAO-PROXIMOS-PASSOS.md`.
