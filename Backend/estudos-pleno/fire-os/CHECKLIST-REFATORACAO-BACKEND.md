# Checklist — Refatoração Backend Pleno (Fire OS)

Checklist único e vivo do que falta pra deixar o backend do Fire OS num nível pleno. O `ROADMAP-PLENO.md` tem o raciocínio, os exemplos de código e o "porquê" de cada item — este arquivo é só o estado atual, pra não se perder no meio de tudo. Atualizar aqui toda vez que alguma coisa mudar de status.

**Legenda:** ✅ feito e testado · 🟡 piloto/parcial (funciona, mas não cobre tudo ainda) · ⬜ pendente

## Estado atual, resumo (atualizado 15/09/2026, depois do módulo `user`)

**Ainda não está tudo terminado** — mas o item de maior risco de segurança do projeto (pior que os já corrigidos) foi achado e fechado nesta rodada.

✅ **Fechado por completo:** item 2 (RBAC/CASL, incluindo os 4 recursos com ownership **e** o achado novo em `user/update`), item 4 (tratamento de erros global, incluindo `UnauthorizedError` novo), item 6 (cache), item 8 (TSC + Linter), item 9 (Docker, build real validado).

🟡 **Piloto em 2 módulos agora, rollout pendente nos outros ~98:** item 1 (Repository pattern em OrdemdeServico + `user`), item 3 (Zod em OrdemdeServico + `user`, ~9 rotas de ~100+), item 4 (o `try/catch` antigo ainda existe em **28 arquivos** — ver item 4 abaixo pro porquê esse número mudou de 36 pra 28).

⬜ **Ainda em zero:** item 7 (testes de integração, TestContainers, E2E, `coverage` no `vitest.config.ts`). Fora do checklist mas ainda pendente no `ROADMAP-PLENO.md`: `.env.example` não existe, `JWT_SECREATE` continua com o nome torto.

**Maior item que falta, em uma frase:** replicar Controller-fino + Service + Repository + Zod + "deixa o erro subir" pros ~98 controllers restantes — análise de qual módulo priorizar (e por quê) já está em `GUIA-PRIORIZACAO-PROXIMOS-PASSOS.md`.

---

## 1. Reorganização de arquitetura (Controller → Service → Prisma)

> Resposta da pergunta "existe uma forma mais pleno de reorganizar isso?": sim — ver `ROADMAP-PLENO.md`, item 2, seção "O que foi implementado".

- 🟡 Piloto aplicado em **Create + Update de OrdemdeServico** e **Create + Update + Auth de `user`** (15/09): Controller virou camada fina (só fala com Express), Service só recebe dado e devolve resultado — sem `req`/`res` dentro da lógica de negócio.
- ✅ Repository pattern implementado (`src/repositories/OrdemdeServicoRepository.ts`, `src/repositories/UserRepository.ts`) — isola as chamadas `prismaClient.*`, injetado via construtor no Service. Testes agora usam um repository fake em vez de mockar o módulo do Prisma.
- ⬜ Replicar esse padrão (Controller fino + Service + Repository + Zod) pros outros ~98 controllers restantes, módulo por módulo (decidido: um de cada vez, com check-in antes de seguir pro próximo — confirmado de novo em 31/08). Análise de prioridade (quais módulos primeiro, e por quê) em `GUIA-PRIORIZACAO-PROXIMOS-PASSOS.md`.

## 2. RBAC / Autorização

- ✅ `can.ts` (RBAC por role) wired em `routes.ts` nas rotas críticas.
- ✅ CASL (`src/permissions/ability.ts`) — ownership de OrdemdeServico: técnico só edita a que é dele.
- ✅ `authorizeOrdemdeServico` middleware testado (`authorizeOrdemdeServico.test.ts`).
- ✅ **Gap de ownership nos 3 módulos técnicos, fechado (15/09).** `authorizeOwnership.ts` novo generaliza a regra pra qualquer recurso com um `tecnico_id` — aplicado em `PATCH /assistenciatecnica/update/:id`, `/laudotecnico/update/:id` e `/documentacaotecnica/update/:id`. Detalhe em `GUIA-RBAC-CASL.md`, seção "O que foi implementado (generalizado pros 3 módulos)".
- ✅ **Achado novo e mais grave, fechado no mesmo dia (15/09):** `PATCH /user/update/:id` não tinha `can()` nem ownership nenhum — qualquer usuário autenticado trocava senha/email/instituição de **qualquer outro usuário**, sequestro de conta. Corrigido com `can(['ADMIN'])`, confirmando antes no Frontend que a rota é mesmo usada por uma tela de gestão de usuários. Detalhe em `GUIA-ZOD-REPOSITORY.md`, seção "Quarto passo: módulo user".

## 3. Zod nos controllers

- 🟡 Piloto: `createOrdemdeServicoSchema`, `updateOrdemdeServicoSchema`, `idParamSchema` (movido pra `common.schema.ts`, compartilhado) — aplicados via `validate()` em `POST /ordemdeservico`, `PATCH /ordemdeservico/update/:id` e `GET /ordemdeservico/:id`.
- ✅ **`user` fechado (15/09)** — `createUserSchema`, `updateUserSchema`, `authUserSchema` aplicados em `POST /users`, `PATCH /user/update/:id` e `POST /session`.
- ⬜ Replicar pros módulos restantes: `cliente`, `setor`, `equipamento`, `instituicao`, `controles_forms` (os outros formulários além de OrdemdeServico), etc.
- ⬜ Validar variáveis de ambiente no boot com um schema Zod (`DATABASE_URL`, `JWT_SECREATE`, `CLOUDINARY_*`) — falha de config aparecer no start, não em runtime.

## 4. Tratamento de erros global

- ✅ `AppError` / `ValidationError` / `NotFoundError` / `ConflictError` / `UnauthorizedError` (novo, 15/09) em `src/errors/AppError.ts`.
- ✅ Middleware global `errorHandler` (`src/Middleware/errorHandler.ts`), plugado uma vez em `server.ts` — trata `ZodError`, `AppError` e erros conhecidos do Prisma (`P2002`→409, `P2025`→404, `P2003`→400), resto vira 500 padronizado.
- ✅ `try/catch` removido dos controllers já refatorados (Create/Update de OrdemdeServico, Create/Update/Auth de `user`) — erro sobe sozinho via `express-async-errors`. Bug real corrigido no caminho: login com senha errada devolvia `500` (o `Error` genérico não caía em nenhum tipo que o `errorHandler` reconhecia) — com `UnauthorizedError`, agora devolve `401` de verdade.
- ⬜ Continua pendente **apenas** nos controllers que ainda não passaram pelo item 3 — a infraestrutura já está pronta pra eles, só falta trocar o `try/catch` de cada um por "deixa subir".

**Correção 15/09 (revisão do próprio número):** o `grep "try {"` que eu tinha usado antes contava **36** arquivos, mas isso incluía try/catch que já é código bom, não dívida — o retry de `numeroOS` em `CreateOrdemdeServicoController.ts`, o `JSON.parse` de `atividades_ids` em `UpdateOrdemdeServicoService.ts`, e o fallback do Redis nos 4 services de cache (`ListOrdemdeServicoService.ts`, `ListTecnicoService.ts`, `CreateTecnicoService.ts`, `RemoveTecnicoService.ts`). Nenhum desses tem `res.status()` dentro do `catch` — eles relançam o erro ou só logam, que é o padrão certo. Contando só quem realmente tem o padrão antigo (`catch (error) { return res.status(400)... }`), o número real é **28 arquivos**, agrupados assim:

| Grupo | Arquivos | Módulos |
|---|---|---|
| `controles_forms` — 5 módulos sem Zod ainda | 10 | Estabilizadores, Laboratorio, MaquinasPendentesLab, MaquinasPendentesOro, SolicitacaodeCompras (Update+Delete cada) |
| `controles_forms` — 3 módulos técnicos (já têm ownership, falta Zod) | 6 | AssistenciaTecnica, LaudoTecnico, DocumentacaoTecnica (Update+Delete cada) |
| OrdemdeServico — rotas fora do piloto Create/Update | 7 | 3 `ListBy*Controller`, `time/TimeOrdemdeServicoController`, 3 de assinatura (`CreateAssinatura`, `GetAssinatura`, `saveAssinatura`) |
| `status_categorias` — entidades reais | 3 | `equipamento`, `informacoessetor`, `tipodeInstituicaoUnidade` (Update) |
| Misc | 2 | `Eventos/EventosControllers.ts`, `fotoController.ts` (métodos `delete`/`listByOrdem` — só `handle` foi refeito pra fila) |

Essa tabela é literalmente a lista de próximos alvos do rollout (item 1/3/4 juntos) — bate com a análise de prioridade do `GUIA-PRIORIZACAO-PROXIMOS-PASSOS.md`.

## 5. Filas — BullMQ + Redis (+ AWS)

- ✅ Protótipo isolado testado ao vivo (`src/queue/uploadQueue.ts`, `uploadWorker.ts`, `addSampleJob.ts`, `dashboard.ts` com Bull Board) — Redis rodando via `docker-compose.yml`.
- ✅ **Ligado ao fluxo real (14/09)** — `fotoController.handle` enfileira (`uploadQueue.add("upload-foto-os", ...)`) e responde `202` em vez de subir pro Cloudinary dentro do request; `uploadWorker.ts` faz o upload + grava no Postgres, com retry automático (3 tentativas, backoff exponencial). Serviço `fireos-worker` novo no `docker-compose.yml` + volume `tmp_uploads` compartilhado com a API (sem isso o worker não enxergaria o arquivo temporário, containers diferentes = disco isolado). Detalhe completo em `GUIA-FILA-BULLMQ.md`, seção 6.
- ⬜ `saveAssinatura.ts` continua fora do escopo — a assinatura nem chega a ser enviada pelo app hoje (achado separado, ver item de assinatura no `ROADMAP-PLENO.md`).
- ⬜ AWS: decidido deixar **fora do Fire OS por enquanto** — o projeto que cobre AWS de verdade (Lambda + API Gateway) é o Encurtador (`../projeto-encurtador/PROJETO-ENCURTADOR.md`, item 7), não faz sentido duplicar esforço aqui. Revisitar só se a decisão mudar.

## 6. Cache

- ✅ Cache-aside com Redis implementado em `ListOrdemdeServicoService.ts` — os 8 `count()` de status agora ficam guardados 30s (`src/redis/index.ts` + método `getTotais()`), com fallback se o Redis cair (não derruba a rota). 50 testes passando, 3 novos cobrindo miss/hit/fallback.
- ✅ Replicado em `ListTecnicoService.ts` — TTL de 60s (maior que o de OS, porque a lista de técnicos muda com frequência bem menor) + invalidação ativa: `CreateTecnicoService`/`RemoveTecnicoService` chamam `redisClient.del()` na chave assim que criam/removem um técnico, pra não deixar a lista velha até o TTL expirar sozinho. 58 testes passando (6 novos: miss/hit/fallback da listagem + invalidação no create/remove).
- ⬜ **Ideia descartada por ora:** colapsar os 8 `count()` num único `GROUP BY` via SQL bruto — tecnicamente possível, mas o ganho fica pequeno já que o cache faz a query rodar só a cada 30s em vez de a cada request.

## 7. Testes automatizados

- ✅ 92 testes unitários passando (Vitest) — cobrindo auth (`UnauthorizedError` incluso), RBAC/CASL (incluindo os 3 módulos técnicos, 12 testes novos com `it.each`), Create/Update de OrdemdeServico e de `user` (ambos com repository fake em vez de mock do Prisma), a infra de validação/erro, o cache-aside da listagem, a fila (`fotoController.test.ts`, mockando `uploadQueue`), o middleware genérico de ownership (`authorizeOwnership.test.ts`), e os schemas de `user`/`common` novos.
- ⬜ Testes de integração reais (Postgres do Docker, não só mock do Prisma) — pelo menos no fluxo de autenticação pra começar.
- ⬜ TestContainers — subir Postgres em container isolado por rodada de teste, sem depender do Docker Compose local já estar de pé.
- ⬜ E2E (ponta a ponta, API real respondendo a requests HTTP de verdade).
- ⬜ `coverage` configurado no `vitest.config.ts` com piso mínimo (ex. 60%) e número exposto no README.

## 8. TSC + Linter

- ✅ **ESLint instalado e configurado (14/09)** — `eslint.config.mjs`, com `@prisma/**` (client gerado) ignorado (achado: sem isso, mais de 1400 "erros" eram só o código gerado do Prisma, não o projeto). 0 erros reais, 36 avisos conhecidos (`no-unused-vars`, deixados como `warn` de propósito — rollout incremental, não travar CI por dívida antiga).
- ✅ `tsc --noEmit` e `eslint .` agora são steps separados no `test.yml`, antes do `test` (fail-fast) — scripts `typecheck` e `lint` no `package.json`.

## 9. Docker

- ✅ Postgres e Redis já rodavam isolados via `docker-compose.yml`.
- ✅ `Dockerfile` multi-stage novo pra própria API (`Backend/Dockerfile`) + `.dockerignore` + serviço `fireos-api` adicionado ao compose, com `depends_on` do banco e do Redis.
- ✅ **Build real validado (15/09)** — `docker compose build fireos-api` completou sem erro (stage de build: `npm ci` + `prisma generate` + `tsc`; stage de runtime: `COPY --from=build` do `dist/`). Faltava só isso pra fechar o item.
- ✅ Achado à parte: `.env.local` não estava no `.gitignore` — corrigido; conferido que nunca foi commitado.

---

## O que já foi resolvido nesta rodada (referência rápida)

1. **Reorganização de estrutura** — respondido e piloto aplicado, incluindo Repository pattern (item 1).
2. **Zod em cada controller** — piloto aplicado em OrdemdeServico (item 3); rollout pros ~100 restantes é o próximo passo, módulo por módulo.
3. **Tratamento de erros global** — fechado por completo, reaproveitável por qualquer módulo futuro (item 4).
4. **Cache** — cache-aside com Redis implementado nos totais de OS, com fallback testado (item 6).
5. **Docker da API** — Dockerfile multi-stage + compose atualizado; falta só validar o build numa máquina com Docker rodando (item 9).

## Ordem sugerida pro que falta

0. ~~Fechar o gap de ownership nos 3 módulos achados na revisão de 14/09~~ (item 2) — ✅ feito (15/09).
1. Continuar o rollout de Zod + arquitetura Controller/Service/Repository pros outros módulos (item 1 e 3 andam juntos). **Ainda pendente — é o que resta desta lista, junto com testes de integração.**
2. ~~Replicar o cache em `ListTecnicoController.ts` (item 6)~~ — ✅ feito (04/09).
3. ~~Ligar a fila BullMQ no fluxo real de upload (item 5)~~ — ✅ feito (14/09).
4. ~~TSC + Lint no CI (item 8)~~ — ✅ feito (14/09).
5. Testes de integração / TestContainers / E2E (item 7) — mais caro em tempo, deixar por último. **Ainda pendente — é o que resta desta lista.**

O porquê de cada posição nessa ordem (não é só "mais fácil primeiro") está detalhado em `GUIA-PRIORIZACAO-PROXIMOS-PASSOS.md`.

---

## Revisão 14/09/2026 — estado confirmado contra o código real, sem deriva

Verifiquei cada afirmação ✅ deste checklist rodando os comandos de verdade (não só relendo o texto):

- `npx vitest run` → **58/58 testes passando** (13 arquivos), igual ao número já documentado.
- `npx tsc --noEmit` → **limpo**, sem erro.
- `git log` → nenhum commit no Backend desde 04/09 além de docs — o código não andou, então nada aqui tinha razão pra ter mudado, e de fato não mudou.
- `routes.ts` → `publicRouter`/`privateRouter` confirmado, `validate()` confirmado só nas 4 rotas de OrdemdeServico (rollout do item 3 ainda não avançou pra nenhum módulo novo).
- `Dockerfile`, `.dockerignore`, `docker-compose.yml` (3 serviços) → confirmados presentes e com o conteúdo descrito.
- `.github/workflows/test.yml` → confirmado, ainda só roda `npm install` + `npm run test`, sem `tsc`/lint como step.
- Sem `.eslintrc`/`eslint.config.*` no projeto, sem `.env.example` no repo, `JWT_SECREATE` ainda inconsistente com o `JWT_SECRET` do README → todos ainda pendentes, como já estava documentado.
- **Único item que mudou de estado sem estar registrado:** a duplicação de seções no `README.md` raiz já não existe mais (corrigida em algum commit de docs recente) — marcado ✅ agora no `ROADMAP-PLENO.md`, seção 6.
- **Único achado novo:** o gap de ownership nos 3 módulos técnicos (ver item 2 acima) — o checkbox de "mapear ownership" no `ROADMAP-PLENO.md` estava marcado feito sem o mapeamento ter sido escrito de fato.

**Atualização, mesmo dia (14/09), depois desta revisão:** os itens "TSC + Lint no CI" (item 8) e "ligar a fila BullMQ no fluxo real" (item 5) — que essa revisão ainda listava como pendentes acima — foram implementados na sequência. Detalhe completo em `GUIA-CI-LINT.md` e `GUIA-FILA-BULLMQ.md` (seção 6). O gap de ownership (item 0 da ordem sugerida) continua em aberto — detalhe em `GUIA-RBAC-CASL.md`.

**Nota (mesmo dia, depois): `ROADMAP-PLENO.md` foi dividido** em guias menores por assunto (`GUIA-RBAC-CASL.md`, `GUIA-ZOD-REPOSITORY.md`, `GUIA-CI-LINT.md`, além dos que já existiam) porque tinha ficado grande demais pra ler de uma vez — ele continua sendo o índice/glossário, os relatos "o que foi implementado" moraram pros guias.

---

## Revisão 15/09/2026 — segunda checagem contra o código real

- `npx vitest run` → **62/62 testes passando** (14 arquivos) — corrigido o número aqui, que ainda estava em 52 (esquecido de atualizar depois da fila).
- `npx tsc --noEmit` → limpo. `npx eslint .` → 0 erros, 36 avisos (mesmos de sempre).
- `routes.ts` → confirmado, os 3 módulos do achado de 14/09 (`assistenciatecnica`, `laudotecnico`, `documentacaotecnica`) **continuam sem ownership** — nada mudou aqui, segue sendo a maior prioridade.
- `docker compose build fireos-api` → **rodou de verdade agora** (Docker Desktop estava ativo nesta sessão) e completou sem erro — item 9 fechado por completo, não é mais só sintaxe validada.
- `git log` → só o commit da reorganização de pastas do `estudos-pleno/` desde a última revisão — nenhum código mudou, então nada mais tinha razão de ter mudado (e não mudou).
- Achado pequeno, fora do escopo do checklist: `Backend/@prisma/client/` (a pasta que o `eslint.config.mjs` ignora) parece ser sobra de uma configuração antiga — o `schema.prisma` atual não tem `output` customizado no `generator client`, então o Prisma gera pro lugar padrão (`node_modules/@prisma/client`). Não trava nada (o `.gitignore` cobre `node_modules`), só é uma pasta órfã que dava pra apagar do repo um dia — não prioritário.

**Nada de novo pendente foi encontrado.** O que falta continua sendo exatamente a "Ordem sugerida" acima: (0) fechar o gap de ownership nos 3 módulos, (1) rollout de Zod/Repository, (2) testes de integração/E2E.

**Atualização, mesmo dia (15/09), depois desta revisão: o item 0 foi fechado.** `authorizeOwnership.ts` (novo) generaliza a regra de ownership pra qualquer recurso com `tecnico_id`, aplicado nos 3 módulos técnicos — 79 testes passando agora (17 novos), `tsc`/`eslint` limpos. Detalhe completo em `GUIA-RBAC-CASL.md`, seção "O que foi implementado (generalizado pros 3 módulos)". O que resta da lista é só o rollout de Zod/Repository (item 1) e os testes de integração/E2E (item 7).

---

## Checagem 15/09/2026 (terceira rodada) — respondendo "terminou tudo?"

Não. Conferi de novo, item por item, antes de responder:

- `cat vitest.config.ts` → só `globals`/`environment`, **sem `coverage` configurado** — item 7 (último sub-item) confirmado zerado.
- `.env.example` → **não existe** no repo (`ls` não achou). README continua mandando `cp .env.example .env`, que quebraria hoje.
- `JWT_SECREATE` → **ainda inconsistente** em `.env`, `AuthUserService.ts` e `isAuthenticated.ts` (esse último até tem um comentário lembrando de checar o nome da var).
- `grep -c "validate("  src/routes.ts` → **4** — Zod continua só em OrdemdeServico.
- `grep -rl "try {" src/controllers src/services | wc -l` → **37 arquivos** ainda capturam erro na mão — é o tamanho real do que falta no rollout (item 1/3/4 juntos).

Resumo movido pro topo do arquivo ("Estado atual, resumo") pra não precisar ler as 3 rodadas de revisão só pra saber o que falta.
