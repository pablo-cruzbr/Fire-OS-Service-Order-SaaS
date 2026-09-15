# Checklist — Refatoração Backend Pleno (Fire OS)

Checklist único e vivo do que falta pra deixar o backend do Fire OS num nível pleno. O `ROADMAP-PLENO.md` tem o raciocínio, os exemplos de código e o "porquê" de cada item — este arquivo é só o estado atual, pra não se perder no meio de tudo. Atualizar aqui toda vez que alguma coisa mudar de status.

**Legenda:** ✅ feito e testado · 🟡 piloto/parcial (funciona, mas não cobre tudo ainda) · ⬜ pendente

## Estado atual, resumo (atualizado 15/09/2026, depois de generalizar as 13 tabelas de lookup)

**Ainda não está tudo terminado** — mas o rollout de Zod/Repository já cobre **8 módulos de `controles_forms` inteiros**, `user`, **Equipamento + InformacoesSetor**, e agora **as 13 tabelas de lookup de `status_categorias`** (via 1 schema + 1 Repository + 2 Services genéricos, em vez de 13 conjuntos quase idênticos). No caminho, achei e corrigi bugs reais em produção — 2 rotas de Update e 1 de List que o Frontend já chamava mas não existiam em `routes.ts` (404 silencioso), 1 delete de equipamento que nunca funcionou, e um método de controller com typo que só não quebrava porque a rota chamava com o mesmo typo. Detalhe completo em `GUIA-ZOD-REPOSITORY.md`, seções "Sétimo passo" e "Oitavo passo".

✅ **Fechado por completo:** item 2 (RBAC/CASL, incluindo os 4 recursos com ownership **e** o achado em `user/update`), item 4 (tratamento de erros global, incluindo `UnauthorizedError` novo), item 6 (cache), item 8 (TSC + Linter), item 9 (Docker, build real validado).

🟡 **25 módulos cobertos agora, rollout pendente nos outros ~75:** item 1 (Repository pattern em OrdemdeServico, `user`, os 8 módulos de `controles_forms`, Equipamento, InformacoesSetor, os 13 de lookup via o Repository genérico, e InstituicaoUnidade), item 3 (Zod nesses mesmos 25). Item 4 (`try/catch` antigo) **continua em 10 arquivos** — esse grupo de 13 nunca teve o padrão antigo pra começar (só faltava Zod, não tratamento de erro), então generalizar não mexeu nessa contagem. *Correção registrada: o commit desse passo chegou a afirmar "de 10 pra 3", número errado — ver `GUIA-ZOD-REPOSITORY.md`, "Oitavo passo", pra o relato completo do engano e da correção.*

⬜ **Ainda em zero:** item 7, só a parte cara (testes de integração, TestContainers, E2E) — `coverage` já está configurado. Fora do checklist mas ainda pendente no `ROADMAP-PLENO.md`: `.env.example` não existe, `JWT_SECREATE` continua com o nome torto.

✅ **2 achados de código morto, decididos e fechados (15/09):** perguntei, e a decisão pros 2 foi "ligar a rota" — `PATCH /instituicaounidade/update/:id` (Zod + Repository novos, `can(['ADMIN'])`, arquivo movido da pasta errada `tipodeInsituicaoUnidade/` pra `instituicaoUnidade/`) e `POST /tipodeequipamento` (já usava o Service genérico de lookup, só faltava a rota). Confirmado ao vivo: as duas devolvem 401 sem token (rota existe, não é 404).

**Maior item que falta, em uma frase:** replicar Controller-fino + Service + Repository + Zod + "deixa o erro subir" pros ~75 controllers restantes (o que sobra de `status_categorias` fora do que já foi fechado, e o resto do projeto fora desse grupo) — análise de qual módulo priorizar (e por quê) já está em `GUIA-PRIORIZACAO-PROXIMOS-PASSOS.md`.

---

## 1. Reorganização de arquitetura (Controller → Service → Prisma)

> Resposta da pergunta "existe uma forma mais pleno de reorganizar isso?": sim — ver `ROADMAP-PLENO.md`, item 2, seção "O que foi implementado".

- 🟡 Piloto aplicado em **OrdemdeServico**, **`user`**, os **8 módulos de `controles_forms`**, **Equipamento + InformacoesSetor**, **as 13 tabelas de lookup de `status_categorias`**, e agora **InstituicaoUnidade (Update)** (15/09) — Controller virou camada fina (só fala com Express), Service só recebe dado e devolve resultado — sem `req`/`res` dentro da lógica de negócio.
- ✅ Repository pattern implementado — 14 repository classes no total (`OrdemdeServicoRepository`, `UserRepository`, um por módulo de `controles_forms`, `EquipamentoRepository`, `InformacoesSetorRepository`, `InstituicaoUnidadeRepository`, e o `LookupCategoriaRepository` genérico, reaproveitado pelos 13 módulos de lookup) — isola as chamadas `prismaClient.*`, injetado via construtor no Service. Testes agora usam um repository fake em vez de mockar o módulo do Prisma.
- ⬜ Replicar esse padrão pros outros ~75 controllers restantes — módulo por módulo (decidido: um de cada vez, com check-in antes de seguir pro próximo — confirmado de novo em 31/08). Análise de prioridade (quais módulos primeiro, e por quê) em `GUIA-PRIORIZACAO-PROXIMOS-PASSOS.md`.

## 2. RBAC / Autorização

- ✅ `can.ts` (RBAC por role) wired em `routes.ts` nas rotas críticas.
- ✅ CASL (`src/permissions/ability.ts`) — ownership de OrdemdeServico: técnico só edita a que é dele.
- ✅ `authorizeOrdemdeServico` middleware testado (`authorizeOrdemdeServico.test.ts`).
- ✅ **Gap de ownership nos 3 módulos técnicos, fechado (15/09).** `authorizeOwnership.ts` novo generaliza a regra pra qualquer recurso com um `tecnico_id` — aplicado em `PATCH /assistenciatecnica/update/:id`, `/laudotecnico/update/:id` e `/documentacaotecnica/update/:id`. Detalhe em `GUIA-RBAC-CASL.md`, seção "O que foi implementado (generalizado pros 3 módulos)".
- ✅ **Achado novo e mais grave, fechado no mesmo dia (15/09):** `PATCH /user/update/:id` não tinha `can()` nem ownership nenhum — qualquer usuário autenticado trocava senha/email/instituição de **qualquer outro usuário**, sequestro de conta. Corrigido com `can(['ADMIN'])`, confirmando antes no Frontend que a rota é mesmo usada por uma tela de gestão de usuários. Detalhe em `GUIA-ZOD-REPOSITORY.md`, seção "Quarto passo: módulo user".

## 3. Zod nos controllers

- 🟡 Piloto: `createOrdemdeServicoSchema`, `updateOrdemdeServicoSchema`, `idParamSchema` (movido pra `common.schema.ts`, compartilhado) — aplicados via `validate()` em `POST /ordemdeservico`, `PATCH /ordemdeservico/update/:id` e `GET /ordemdeservico/:id`.
- ✅ **`user` fechado (15/09)** — `createUserSchema`, `updateUserSchema`, `authUserSchema` aplicados em `POST /users`, `PATCH /user/update/:id` e `POST /session`.
- ✅ **8 módulos de `controles_forms` fechados (15/09)** — um schema por módulo (`assistenciaTecnica`, `laudoTecnico`, `documentacaoTecnica`, `estabilizadores`, `laboratorio`, `maquinasPendentesLab`, `maquinasPendentesOro`, `solicitacaoCompras`), incluindo `idParamSchema` agora também no Delete de todos eles (antes não validava `:id` nenhum). Achado ao comparar os schemas: `MaquinasPendentesLab` e `MaquinasPendentesOro` parecem o mesmo módulo mas `instituicaoUnidade_id` é opcional num e obrigatório no outro — só apareceu checando o `schema.prisma` de cada um, não pelo nome.
- ✅ **Equipamento + InformacoesSetor fechados (15/09)** — `equipamento.schema.ts`, `informacoesSetor.schema.ts`. Achado mais sério que "falta Zod": as rotas `PATCH /equipamento/:id` e `PATCH /informacoessetor/:id` **não existiam em `routes.ts`**, mesmo com o Frontend já chamando as duas (`EditEquipamentoForm.tsx`, `EditRamalSetorForm,.tsx`) — ou seja, editar um equipamento ou um ramal/setor sempre devolvia 404 em produção. Corrigido junto com o rollout. Detalhe completo em `GUIA-ZOD-REPOSITORY.md`, seção "Sétimo passo".
- ✅ **13 tabelas de lookup de `status_categorias` fechadas (15/09)** — em vez de 13 schemas quase idênticos, um só (`lookupCategoria.schema.ts`), reaproveitado nas 13 rotas de Create. Achado no caminho: `GET /list/tipo/equipamento` nunca existiu em `routes.ts`, mas o Frontend já chamava — dropdown de "Tipo de Equipamento" nunca mostrou opção nenhuma em produção. Detalhe completo em `GUIA-ZOD-REPOSITORY.md`, seção "Oitavo passo".
- ✅ **InstituicaoUnidade (Update) fechado (15/09)** — achado de código morto do passo anterior, decidido ligar a rota: `instituicaoUnidade.schema.ts` novo, `PATCH /instituicaounidade/update/:id` com `can(['ADMIN'])`. Confirmado ao vivo (401 sem token, não 404).
- ⬜ Replicar pro restante de `status_categorias` e pro resto do projeto (~75 controllers).
- ⬜ Validar variáveis de ambiente no boot com um schema Zod (`DATABASE_URL`, `JWT_SECREATE`, `CLOUDINARY_*`) — falha de config aparecer no start, não em runtime.

## 4. Tratamento de erros global

- ✅ `AppError` / `ValidationError` / `NotFoundError` / `ConflictError` / `UnauthorizedError` (novo, 15/09) em `src/errors/AppError.ts`.
- ✅ Middleware global `errorHandler` (`src/Middleware/errorHandler.ts`), plugado uma vez em `server.ts` — trata `ZodError`, `AppError` e erros conhecidos do Prisma (`P2002`→409, `P2025`→404, `P2003`→400), resto vira 500 padronizado.
- ✅ `try/catch` removido de todos os controllers já refatorados (OrdemdeServico Create/Update, `user` Create/Update/Auth, os 8 módulos de `controles_forms`, e agora Equipamento + InformacoesSetor) — erro sobe sozinho via `express-async-errors`. Bugs reais corrigidos no caminho: login com senha errada devolvia `500` (o `Error` genérico não caía em nenhum tipo que o `errorHandler` reconhecia) — com `UnauthorizedError`, agora devolve `401` de verdade; conflito de patrimônio duplicado em Equipamento também devolvia `500` pelo mesmo motivo — corrigido com `ConflictError` (409).
- ⬜ Continua pendente **apenas** nos controllers que ainda não passaram pelo item 3 (hoje, o restante de `status_categorias` e alguns extras de OrdemdeServico) — a infraestrutura já está pronta pra eles, só falta trocar o `try/catch` de cada um por "deixa subir".

**Contagem (revisada 15/09, depois de generalizar as 13 tabelas de lookup):** só conta quem realmente tem o padrão antigo (`catch (error) { return res.status(400)... }`), não try/catch legítimo (retry, fallback de Redis). Hoje: **10 arquivos, sem mudança neste passo** — os 13 módulos de lookup nunca tiveram esse padrão pra começar (só faltava Zod, não tratamento de erro), então generalizá-los fechou o item 1/3, mas não o item 4. *Isso corrige uma afirmação errada no commit desse passo ("de 10 pra 3") — detalhe do engano em `GUIA-ZOD-REPOSITORY.md`, "Oitavo passo".*

| Grupo | Arquivos | Módulos |
|---|---|---|
| OrdemdeServico — rotas fora do piloto Create/Update | 7 | 3 `ListBy*Controller`, `time/TimeOrdemdeServicoController`, 3 de assinatura (`CreateAssinatura`, `GetAssinatura`, `saveAssinatura`) |
| Misc | 2 | `Eventos/EventosControllers.ts`, `fotoController.ts` (métodos `delete`/`listByOrdem` — só `handle` foi refeito pra fila) |
| Código morto, fora da contagem de rollout | 1 | `UpdateInstituicaoUnidadeController.ts` (rotulado antes como "tipodeInstituicaoUnidade") — sem rota, sem chamada no Frontend; decisão de produto pendente (ligar ou apagar) |

~~`controles_forms` — todos os 8 módulos~~ — ✅ fechado (15/09). ~~`status_categorias` — equipamento, informacoessetor, 13 tabelas de lookup~~ — ✅ fechados (15/09), saíram da tabela (o Zod/Repository deles, não o try/catch — eles nunca estiveram nessa tabela).

Essa tabela é literalmente a lista de próximos alvos do rollout de tratamento de erro (item 4) — não se confunde mais com o rollout de Zod/Repository (item 1/3), que agora está bem mais adiantado (24 módulos) do que essa tabela específica sugere.

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

- ✅ 227 testes unitários passando (Vitest) — cobrindo auth (`UnauthorizedError` incluso), RBAC/CASL (incluindo os 3 módulos técnicos, 12 testes novos com `it.each`), Create/Update/Delete de OrdemdeServico, `user`, os 8 módulos de `controles_forms`, Equipamento + InformacoesSetor, o Repository/Service genéricos de lookup, e InstituicaoUnidade (todos com repository fake em vez de mock do Prisma), a infra de validação/erro, o cache-aside da listagem, a fila (`fotoController.test.ts`, mockando `uploadQueue`), o middleware genérico de ownership (`authorizeOwnership.test.ts`), e os schemas novos. `coverage` configurado com piso de 30-45% (número real de hoje).
- ⬜ Testes de integração reais (Postgres do Docker, não só mock do Prisma) — pelo menos no fluxo de autenticação pra começar.
- ⬜ TestContainers — subir Postgres em container isolado por rodada de teste, sem depender do Docker Compose local já estar de pé.
- ⬜ E2E (ponta a ponta, API real respondendo a requests HTTP de verdade).
- ✅ **`coverage` configurado (15/09)** — `@vitest/coverage-v8`, piso de hoje (30-45% dependendo da métrica, não 60% — a maioria dos ~89 controllers fora do rollout ainda tem zero teste, um piso aspiracional travaria o CI por dívida antiga). Número real (211 testes, ~31%) exposto no README raiz. Achado no caminho: a pasta `coverage/` gerada pelo relatório HTML estava sendo lintada como se fosse código do projeto — ignorada no `eslint.config.mjs`, mesmo raciocínio do `@prisma/**`.

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

---

## Atualização 15/09/2026 — 3 módulos técnicos fechados (AssistenciaTecnica, LaudoTecnico, DocumentacaoTecnica)

Depois do achado crítico no `user`, priorizei esses 3 módulos porque já tinham o ownership (CASL) corrigido desde 14/09 — fechar Zod + Repository neles termina um trabalho já começado, em vez de abrir módulo novo. Os 3 têm formato idêntico (Create/Update/Delete com FK pra cliente/técnico/instituição), então saiu mais rápido que o `user`.

- Schemas novos: `assistenciaTecnica.schema.ts`, `laudoTecnico.schema.ts`, `documentacaoTecnica.schema.ts`.
- Repositories novos: `AssistenciaTecnicaRepository.ts`, `LaudoTecnicoRepository.ts`, `DocumentacaoTecnicaRepository.ts`.
- `try/catch` removido de 6 arquivos (Update+Delete × 3) — contagem geral caiu de 28 pra **22**.
- Achado pequeno no caminho: `documentacaoTecnica` aceitava um `id` vindo do cliente na criação (nenhum outro módulo faz isso) — removido, parecia resíduo de copiar-colar.
- 131 testes passando (39 novos), `tsc`/`eslint` limpos.

Detalhe completo: `GUIA-ZOD-REPOSITORY.md`, seção "Quinto passo".

---

## Atualização 15/09/2026 — grupo inteiro de `controles_forms` fechado (5 módulos restantes)

Estabilizadores, Laboratorio, MaquinasPendentesLab, MaquinasPendentesOro e SolicitacaodeCompras — os últimos 5 módulos de `controles_forms` sem Zod. Com isso, **`controles_forms` como categoria está com Zod + Repository em todos os 8 módulos**, e o grupo saiu inteiro da tabela de try/catch pendente.

- 5 schemas novos, 5 repositories novos.
- `try/catch` removido de 10 arquivos — contagem geral caiu de 22 pra **12**.
- Achado que se repetiu (mesma categoria do LaudoTecnico no passo anterior): `MaquinasPendentesLab` e `MaquinasPendentesOro` parecem o mesmo módulo, mas `instituicaoUnidade_id` é opcional num e obrigatório no outro — só confirmado abrindo o `schema.prisma` de cada um.
- 2 bugs de copiar-colar corrigidos no caminho (mensagem de erro de um módulo aparecendo no outro; um arquivo de Delete com o nome do módulo errado, embora a classe exportada estivesse certa).
- 182 testes passando (51 novos), `tsc`/`eslint` limpos.

O que resta do rollout agora é majoritariamente `status_categorias` — 3 entidades reais (equipamento, informacoessetor, tipodeInstituicaoUnidade) e depois o grupo grande de tabelas "só nome".

Detalhe completo: `GUIA-ZOD-REPOSITORY.md`, seção "Sexto passo".

---

## Atualização 15/09/2026 — Equipamento e InformacoesSetor fechados (2 das 3 entidades reais)

Antes de escrever qualquer schema, conferi se as rotas de Update desses 3 módulos existiam de verdade — e não existiam, em 2 casos, mesmo com o Frontend já chamando elas:

- **`PATCH /equipamento/:id`** não estava em `routes.ts`, mas `EditEquipamentoForm.tsx` já chama exatamente essa rota a partir de um botão "Editar" real — 404 silencioso em produção sempre que alguém tentava editar um equipamento.
- **`PATCH /informacoessetor/:id`** tinha o mesmo problema, chamado de `EditRamalSetorForm,.tsx`.
- **Delete de equipamento nunca funcionou de verdade:** a rota `DELETE /deleteequipamento/:id` existe e o Frontend manda o id como parte da URL, mas o controller lia `req.query.equipamento_id` (sempre `undefined`) em vez de `req.params.id`. O `try/catch` genérico mascarava isso como um 400 comum.
- **Conflito de patrimônio duplicado devolvia 500:** sem `try/catch` no controller e sem `ConflictError` no service, o erro genérico caía direto no 500 padrão do `errorHandler`. Corrigido com `ConflictError` (409).
- **Bug de partial-update evitado:** o Service antigo de `informacoessetor` sempre recalculava `cliente_id`/`instituicaoUnidade_id`, mesmo quando esses campos não vinham no payload — risco de apagar a associação sem querer num update parcial futuro. O novo só toca nesses campos quando eles vêm de verdade no `req.body`.

**Achado sem correção — código morto documentado, não uma tarefa do rollout:** o 3º módulo da lista ("tipodeInstituicaoUnidade (Update)") é na verdade o Update de `InstituicaoUnidade`, arquivado na pasta errada (`tipodeInsituicaoUnidade/`) e **sem rota nenhuma em `routes.ts`, sem chamada nenhuma no Frontend**. Decisão de produto pendente: ligar a rota (funcionalidade nova) ou apagar o código morto.

- 2 schemas novos, 2 repositories novos.
- `try/catch` removido de 2 arquivos — contagem geral caiu de 12 pra **10**.
- 211 testes passando (29 novos), `tsc`/`eslint` limpos.

Detalhe completo: `GUIA-ZOD-REPOSITORY.md`, seção "Sétimo passo".

---

## Atualização 15/09/2026 — `coverage` configurado + as 13 tabelas de lookup generalizadas

Duas peças menores desse dia, na ordem que o esforço mandava (mais rápido primeiro):

**1. `coverage` configurado no `vitest.config.ts`.** Piso de 30-45% (o número real de hoje), não 60% "aspiracional" — a maioria dos ~89 controllers fora do rollout ainda tinha zero teste, e travar o CI por dívida que já existia (em vez de por uma regressão de verdade) não ajudaria ninguém. `npm run test` agora roda com `--coverage`, então o `test.yml` já falha se a cobertura cair. Achado no caminho: a pasta `coverage/` gerada pelo relatório HTML estava sendo lintada como código do projeto — ignorada no `eslint.config.mjs`.

**2. As 13 tabelas de lookup de `status_categorias` generalizadas** — em vez de repetir o rollout módulo por módulo mais 13 vezes, 1 schema + 1 Repository genérico (parametrizado pelo model) + 2 Services cobrem todas. 14 arquivos de Service antigos apagados de vez (não deixados como código morto). Achados no caminho: um método de controller com typo (`hadle`) que só não quebrava porque a rota chamava com o mesmo erro; e uma rota (`GET /list/tipo/equipamento`) que o Frontend já chamava, nunca existiu no backend, e o próprio dev do Frontend já desconfiava disso (comentário no `.catch()`: "404 provável na Vercel").

**Correção sobre o próprio processo, registrada aqui pra não repetir:** o commit desse segundo item afirmou que o `try/catch` antigo caiu "de 10 pra 3 arquivos" — **isso está errado**. Os 13 controllers de lookup nunca tiveram o padrão antigo de `try/catch` (só faltava Zod, que é um problema diferente) — a contagem de try/catch continua em **10**, sem mudança. O erro aconteceu por não rodar o script de contagem de novo antes de escrever o número no commit — daqui pra frente, sempre recontar antes de afirmar, não assumir que "mexi nesses arquivos" implica "mudei essa métrica específica".

- 13 controllers reescritos, 14 Services antigos apagados, 1 schema/1 repository/2 services genéricos novos.
- 10 testes novos (221 total) — poucos de propósito: o objetivo de generalizar é 1 implementação bem testada cobrir 13 módulos, não 13 arquivos de teste quase idênticos.
- Achado adicional de código morto: `CreateTipodeEquipamentoController.ts` (Create de TipodeEquipamento) também não tem rota nem chamada no Frontend — mesma decisão pendente do `InstituicaoUnidade`.

Detalhe completo: `GUIA-ZOD-REPOSITORY.md`, seção "Oitavo passo".

---

## Atualização 15/09/2026 — os 2 achados de código morto, decididos e fechados

Perguntei diretamente: pros 2 controllers sem rota (`UpdateInstituicaoUnidadeController.ts` e `CreateTipodeEquipamentoController.ts`), ligar a rota, apagar, ou deixar como está? Resposta pros dois: **ligar a rota**.

- `POST /tipodeequipamento` — já usava o Service genérico de lookup (feito no passo anterior), só faltava a linha em `routes.ts`.
- `PATCH /instituicaounidade/update/:id` — esse precisou do tratamento completo: `instituicaoUnidade.schema.ts` novo, `InstituicaoUnidadeRepository.ts` novo, service e controller reescritos e **movidos** da pasta errada (`tipodeInsituicaoUnidade/`, onde nunca fez sentido morar) pra `instituicaoUnidade/`, junto dos irmãos Create/List/Remove. Protegido com `can(['ADMIN'])`, mesmo nível do Remove existente — editar nome/endereço/telefone/tipo de uma instituição é sensibilidade parecida com apagar uma.
- Confirmado ao vivo, rodando o servidor: as duas rotas devolvem `401` sem token (matched pelo `isAuthenticated`, não um `404` de rota inexistente).

227 testes passando (6 novos), `tsc`/`eslint` limpos.

Com isso, os dois achados de código morto do rollout de `status_categorias` estão fechados — não sobra nenhuma pendência de decisão de produto nesse grupo.
