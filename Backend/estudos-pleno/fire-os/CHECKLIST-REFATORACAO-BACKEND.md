# Checklist — Refatoração Backend Pleno (Fire OS)

Checklist único e vivo do que falta pra deixar o backend do Fire OS num nível pleno. O `ROADMAP-PLENO.md` tem o raciocínio, os exemplos de código e o "porquê" de cada item — este arquivo é só o estado atual, pra não se perder no meio de tudo. Atualizar aqui toda vez que alguma coisa mudar de status.

**Legenda:** ✅ feito e testado · 🟡 piloto/parcial (funciona, mas não cobre tudo ainda) · ⬜ pendente

## Estado atual, resumo (atualizado 22/09/2026, depois de fechar o rollout de Zod/Repository no projeto inteiro)

🔴 **Achado mais grave do projeto até agora:** o primeiro teste E2E de verdade (login via HTTP) descobriu que **48 controllers** — praticamente todo o rollout de Zod/Repository feito até aqui, desde o primeiro piloto — devolviam **500** sempre que a rota era chamada de verdade (passando pelo Express real), porque `new Controller().handle` perde o `this` quando o Express extrai o método. Nenhum teste unitário pegava isso, porque todos chamavam `handle` já vinculado à instância. **Já corrigido nos 48 arquivos**, com teste de regressão pra impedir volta. Detalhe completo: `GUIA-TESTES-INTEGRACAO-E2E.md`.

**Ainda não está tudo terminado** — mas o rollout de Zod/Repository já cobre **8 módulos de `controles_forms` inteiros**, `user`, **Equipamento + InformacoesSetor**, e agora **as 13 tabelas de lookup de `status_categorias`** (via 1 schema + 1 Repository + 2 Services genéricos, em vez de 13 conjuntos quase idênticos). No caminho, achei e corrigi bugs reais em produção — 2 rotas de Update e 1 de List que o Frontend já chamava mas não existiam em `routes.ts` (404 silencioso), 1 delete de equipamento que nunca funcionou, e um método de controller com typo que só não quebrava porque a rota chamava com o mesmo typo. Detalhe completo em `GUIA-ZOD-REPOSITORY.md`, seções "Sétimo passo" e "Oitavo passo".

✅ **Fechado por completo:** item 2 (RBAC/CASL, incluindo os 4 recursos com ownership **e** o achado em `user/update`), item 4 (tratamento de erros global, incluindo `UnauthorizedError` novo), item 6 (cache), item 8 (TSC + Linter), item 9 (Docker, build real validado).

✅ **Item 1/3 fechado por completo no projeto inteiro (22/09).** O checklist vinha estimando "~68 controllers restantes" de cabeça, sem nunca ter feito uma auditoria exata — quando finalmente fiz (linha a linha, as 121 rotas de `routes.ts`, todos os ~107 controllers), o número real era outro: a maior parte dos módulos já marcados "fechados" tinha o `List` (e em 3 casos, módulos inteiros — InstituicaoUnidade Create/List/Remove, `user` List/Detail) deixado pra trás desde 15/09. Fechado tudo: os 13 `List` de lookup generalizados num Service só, os 8 `List` de `controles_forms` (com **4 bugs reais achados** — `execute()` chamado 2x, um campo `result` morto, 2 contagens calculadas e nunca devolvidas), `List` de Equipamento/InformacoesSetor, InstituicaoUnidade completo, `user` completo, AI Chat, e o filtro `status_id`/`tipoOS_id` do `GET /listordemdeservico` que o Service já suportava mas o Controller nunca conectava. **Confirmado por auditoria, não por contagem de módulo:** zero controllers no padrão antigo (`async handle` sem arrow function) em todo o projeto, zero `try/catch` antigo além de 6 exceções já conhecidas e legítimas, só 4 services ainda tocam `prismaClient` direto (2 por decisão deliberada — cache-aside, máquina de estados — e 2 são helpers pequenos ao lado de um Repository já em uso). 4 arquivos de código morto a mais achados e apagados na auditoria. 21 Repository classes no total agora (14 → 21). ✅ **Item 4 (`try/catch` antigo) também fechado por completo.**

🔴 **Mais 2 bugs reais de produção achados no rollout de Cliente/Setor/Tecnico (22/09):** o Frontend (`EditClienteForm.tsx`) já chama `PATCH /cliente/:id` pra editar um cliente — rota que **nunca existiu** em `routes.ts` (o Controller/Service já estavam prontos, `UpdateClienteController`/`UpdateClienteService`, só nunca tinham sido ligados a nada — mesmo padrão do achado de InstituicaoUnidade em 15/09). E `DELETE /deletecliente` não tinha `:id` na rota, mas o Frontend (`ClientesList.tsx`) sempre chamou `DELETE /deletecliente/:id` — Express nunca casava esse padrão, 404 sempre. As duas rotas ligadas agora, com teste E2E de regressão pra cada uma. (Achado à parte, fora do Backend: `ClienteMunicipalList.tsx`, um componente diferente de listagem de cliente, chama o endpoint errado pra deletar — `/deletedesolicitacaodecompras/:id`, de outro módulo — bug do Frontend, fora do escopo deste repositório.)

🔴 **Bug de dado real achado no módulo de Estabilizadores (22/09):** `CreateEquipamentoEstabilizadorService` gravava um estabilizador novo em `prismaClient.equipamento` (tabela errada) enquanto `ListEquipamentoEstabilizadorService` sempre leu de `prismaClient.estabilizadores` — um estabilizador cadastrado pelo formulário nunca aparecia na própria listagem, nem ficava disponível pra escolher ao registrar uma manutenção. Junto: o Frontend (`FormularioControledeEstabilizadores.tsx`) chama `GET /list/estabilizadores` (plural) dentro de um `Promise.all` com outras 2 listas — rota que nunca existiu (só a singular `/list/estabilizador`), e como o `Promise.all` falha rápido, as 3 listas do formulário ficavam vazias silenciosamente. Os dois corrigidos juntos, com teste E2E de regressão.

🟡 **Item 7 fechado na parte que importava (22/09): E2E agora cobre todo caminho de criação do sistema, mais autorização e o fluxo de tempo de OrdemdeServico** — 15 arquivos, **82 testes de integração/E2E** (7 → 19 → 54 → 60 → 63 → 67 → 73 → 82), contra 0 antes de 18/09. Os últimos blocos são regressão dos bugs achados depois: 6 testes de Cliente (rotas 404), 3 de Estabilizadores (tabela errada), 4 do padrão genérico de Detail, 6 de export/relatório/atividades. Cobertura: login; criação + ownership/CASL de OrdemdeServico; cadastro + guarda admin-only de `user`; os 3 módulos técnicos com ownership (AssistenciaTecnica, LaudoTecnico, DocumentacaoTecnica); Equipamento/InformacoesSetor/InstituicaoUnidade (as 3 entidades com bugs reais achados em 15/09); os 5 módulos de `controles_forms` sem ownership; o padrão genérico de lookup (13 tabelas, testado via 3 rotas representativas); o ciclo de controle de tempo de OrdemdeServico (iniciar/pausar/retomar/concluir); e as 3 rotas de export/relatório/atividades. **Dois achados reais no processo:** (1) uma condição de corrida entre arquivos de integração — todos compartilham um Postgres efêmero só, e limpavam tabelas parcialmente cada um, o que quebrava com FK assim que um 3º/4º arquivo apareceu; resolvido centralizando a limpeza num helper único (`limparBanco()` em `helpers.ts`), FK-safe, chamado por todo `beforeEach`. (2) o cliente Redis (`src/redis/index.ts`) travava ~20-30s por request quando o Redis estava fora do ar, antes de cair no fallback — o try/catch do cache-aside (item 6) estava certo, só chegava tarde demais; corrigido com `enableOfflineQueue: false`, achado testando `GET /listordemdeservico` de ponta a ponta. **Ainda fora do escopo, de propósito:** o fluxo de upload/fila (precisa de Redis + worker rodando, custo de infra alto pro retorno), o módulo de eventos do calendário, e os Deletes dos módulos de `controles_forms` fora de Equipamento.

✅ **2 achados de código morto, decididos e fechados (15/09):** perguntei, e a decisão pros 2 foi "ligar a rota" — `PATCH /instituicaounidade/update/:id` (Zod + Repository novos, `can(['ADMIN'])`, arquivo movido da pasta errada `tipodeInsituicaoUnidade/` pra `instituicaoUnidade/`) e `POST /tipodeequipamento` (já usava o Service genérico de lookup, só faltava a rota). Confirmado ao vivo: as duas devolvem 401 sem token (rota existe, não é 404).

✅ **`.env.example` criado e `JWT_SECREATE` documentado certo (22/09):** o repo nunca teve `.env.example` — o README mandava `cp .env.example .env` e o arquivo não existia. Criado com placeholders (sem segredo real). No caminho, confirmado que produção já usa `JWT_SECREATE` (o nome com typo), não `JWT_SECRET` como o README documentava — corrigido o README pra bater com a realidade, em vez de renomear a env var no código (renomear quebraria login em produção sem coordenar a troca lá também).

🟢 **Redis via TestContainers + testes de integração real pra 14 dos 21 Repositories, executado (22/09).** `globalSetup.ts` agora sobe um `RedisContainer` de verdade junto do Postgres — `cacheRedis.e2e.test.ts` prova o cache-aside (`ListTecnicoService`/`ListOrdemdeServicoService`) e a invalidação (`CreateTecnicoService`/`RemoveTecnicoService`) contra Redis real, não `vi.mock`. Mais 3 arquivos novos cobrem os 13 Repositories que só tinham Prisma mockado (8 de `controles_forms`, Equipamento/InformacoesSetor/InstituicaoUnidade/LookupCategoria, e os métodos de `OrdemdeServicoRepository` não exercitados pelos E2E de HTTP já existentes) — com o `UserRepository` que já tinha desde antes, são **14 de 21 Repositories** provados contra Postgres real agora. Os 7 que restam (Cliente/Setor/Tecnico/EstabilizadorRepository/Evento/FotoOrdemServico/AtividadePadrao) são CRUD simples de baixo risco, deixados de fora de propósito. Detalhe completo na atualização de hoje, mais abaixo.

**O que falta agora, em uma frase:** o rollout de Zod/Repository (item 1/3) está fechado, e a estratégia de testes (Redis real + Repositories críticos) já foi executada — o que resta é só ampliar o item 7 pros fluxos que continuam fora de escopo de propósito (upload/fila, eventos, Deletes de `controles_forms` fora de Equipamento) e, opcionalmente, os 7 Repositories de CRUD simples que ainda só têm prova unitária.

---

## 1. Reorganização de arquitetura (Controller → Service → Prisma)

> Resposta da pergunta "existe uma forma mais pleno de reorganizar isso?": sim — ver `ROADMAP-PLENO.md`, item 2, seção "O que foi implementado".

- ✅ **Item fechado por completo (22/09).** Uma auditoria linha-a-linha de `routes.ts` inteiro (todas as 121 rotas, todos os ~107 controllers) confirmou: **zero controllers restam no padrão antigo** (`async handle(...)` sem arrow function), **zero `try/catch` antigo** além das exceções já conhecidas (retry de `numeroOS`, fallback de Redis ×4, `JSON.parse` de `atividades_ids`), e só **4 services** ainda importam `prismaClient` direto — 2 por decisão deliberada (`ListOrdemdeServicoService`, cache-aside; `TimeOrdemdeServicoService`, máquina de estados), 2 por serem helpers auxiliares pequenos dentro de um Service que já usa Repository como caminho principal (`InformacoesSetor` Create/Update, validação de `cliente_id`/`instituicaoUnidade_id`).
- ✅ **OrdemdeServico completo (22/09)** — Create/Update (piloto original) + List/Get por id, List por status, List por técnico, controle de tempo, assinatura, export/relatório/atividades. Primeiro módulo do rollout a ficar 100% coberto.
- ✅ Piloto aplicado (agora em **todo o projeto**): `user`, os **8 módulos de `controles_forms`** (incluindo os 8 `List` e os 7 `Detail` que tinham ficado pra trás), **Equipamento + InformacoesSetor** (incluindo `List`), **as 13 tabelas de lookup** (Create/Delete desde 15/09, **List generalizado só em 22/09**), **InstituicaoUnidade** (Update desde 15/09, **Create/List/Remove só em 22/09**), **Eventos + Foto de OS**, **Cliente + Setor + Tecnico**, **EquipamentoEstabilizador**, **AtividadePadrao**, **`user` List/Detail**, e **AI Chat** (`src/api/ai/chat/route.ts`) — Controller virou camada fina, Service só recebe dado e devolve resultado.
- ✅ Repository pattern implementado — 21 repository classes no total, isolando toda chamada `prismaClient.*` do projeto, injetadas via construtor. Testes usam repository fake em vez de mockar o módulo do Prisma.
- ✅ **4 arquivos de código morto achados e apagados na auditoria final (22/09)** — `ListEstabilizadorController.ts` (duplicata exata de um controller já ligado), `createUrgenciaController.ts` (arquivo vazio), `CreateFormTecnicoService.ts` e `GetAssinaturaService.ts` (nunca importados em lugar nenhum).

## 2. RBAC / Autorização

- ✅ `can.ts` (RBAC por role) wired em `routes.ts` nas rotas críticas.
- ✅ CASL (`src/permissions/ability.ts`) — ownership de OrdemdeServico: técnico só edita a que é dele.
- ✅ `authorizeOrdemdeServico` middleware testado (`authorizeOrdemdeServico.test.ts`).
- ✅ **Gap de ownership nos 3 módulos técnicos, fechado (15/09).** `authorizeOwnership.ts` novo generaliza a regra pra qualquer recurso com um `tecnico_id` — aplicado em `PATCH /assistenciatecnica/update/:id`, `/laudotecnico/update/:id` e `/documentacaotecnica/update/:id`. Detalhe em `GUIA-RBAC-CASL.md`, seção "O que foi implementado (generalizado pros 3 módulos)".
- ✅ **Achado novo e mais grave, fechado no mesmo dia (15/09):** `PATCH /user/update/:id` não tinha `can()` nem ownership nenhum — qualquer usuário autenticado trocava senha/email/instituição de **qualquer outro usuário**, sequestro de conta. Corrigido com `can(['ADMIN'])`, confirmando antes no Frontend que a rota é mesmo usada por uma tela de gestão de usuários. Detalhe em `GUIA-ZOD-REPOSITORY.md`, seção "Quarto passo: módulo user".

## 3. Zod nos controllers

- ✅ **OrdemdeServico completo (22/09)** — piloto original (`createOrdemdeServicoSchema`, `updateOrdemdeServicoSchema`) mais os schemas novos pro resto do módulo: `listByStatusQuerySchema`, `listByTecnicoQuerySchema`, `atualizarTempoSchema`, `ordemIdParamSchema`, `assinaturaSchema`. `idParamSchema` (compartilhado via `common.schema.ts`) agora também nos 6 endpoints de controle de tempo, que nunca tinham validação de `:id` nenhuma. Achado no caminho: dos 3 arquivos de assinatura, 2 (`CreateAssinaturaController.ts`, `GetAssinaturaController.ts`, mais o `CreatedAssinaturaService.ts` que só eles usavam) eram código morto — importados em `routes.ts`, nunca ligados a rota nenhuma — perguntei, decisão foi apagar; o único que sobrevivia (`AssinaturaController`) foi modernizado junto.
- ✅ **`user` fechado (15/09)** — `createUserSchema`, `updateUserSchema`, `authUserSchema` aplicados em `POST /users`, `PATCH /user/update/:id` e `POST /session`.
- ✅ **8 módulos de `controles_forms` fechados (15/09)** — um schema por módulo (`assistenciaTecnica`, `laudoTecnico`, `documentacaoTecnica`, `estabilizadores`, `laboratorio`, `maquinasPendentesLab`, `maquinasPendentesOro`, `solicitacaoCompras`), incluindo `idParamSchema` agora também no Delete de todos eles (antes não validava `:id` nenhum). Achado ao comparar os schemas: `MaquinasPendentesLab` e `MaquinasPendentesOro` parecem o mesmo módulo mas `instituicaoUnidade_id` é opcional num e obrigatório no outro — só apareceu checando o `schema.prisma` de cada um, não pelo nome.
- ✅ **Equipamento + InformacoesSetor fechados (15/09)** — `equipamento.schema.ts`, `informacoesSetor.schema.ts`. Achado mais sério que "falta Zod": as rotas `PATCH /equipamento/:id` e `PATCH /informacoessetor/:id` **não existiam em `routes.ts`**, mesmo com o Frontend já chamando as duas (`EditEquipamentoForm.tsx`, `EditRamalSetorForm,.tsx`) — ou seja, editar um equipamento ou um ramal/setor sempre devolvia 404 em produção. Corrigido junto com o rollout. Detalhe completo em `GUIA-ZOD-REPOSITORY.md`, seção "Sétimo passo".
- ✅ **13 tabelas de lookup de `status_categorias` fechadas (15/09)** — em vez de 13 schemas quase idênticos, um só (`lookupCategoria.schema.ts`), reaproveitado nas 13 rotas de Create. Achado no caminho: `GET /list/tipo/equipamento` nunca existiu em `routes.ts`, mas o Frontend já chamava — dropdown de "Tipo de Equipamento" nunca mostrou opção nenhuma em produção. Detalhe completo em `GUIA-ZOD-REPOSITORY.md`, seção "Oitavo passo".
- ✅ **InstituicaoUnidade (Update) fechado (15/09)** — achado de código morto do passo anterior, decidido ligar a rota: `instituicaoUnidade.schema.ts` novo, `PATCH /instituicaounidade/update/:id` com `can(['ADMIN'])`. Confirmado ao vivo (401 sem token, não 404).
- ✅ **Eventos + Foto de OS fechados (22/09)** — `evento.schema.ts` (id numérico, não uuid — `Event` usa autoincrement) e `foto.schema.ts` novos, fechando os 2 últimos arquivos pendentes do item 4.
- ✅ **Cliente + Setor + Tecnico fechados (22/09)** — `cliente.schema.ts`, `setor.schema.ts`, `tecnico.schema.ts` novos; `ClienteRepository`/`SetorRepository`/`TecnicoRepository` novos (o de Tecnico mantém o cache-aside com Redis já existente, só trocando `prismaClient` cru pelo Repository por baixo). **2 bugs reais achados**: `PATCH /cliente/:id` (editar cliente) nunca existiu, apesar do Frontend já chamar — o Controller/Service prontos (`UpdateClienteController`/`Service`) nunca tinham sido ligados a rota nenhuma; e `DELETE /deletecliente` não tinha `:id`, mas o Frontend sempre chamou com `:id` no path — 404 sempre. As duas corrigidas, com E2E de regressão. Detalhe completo em `GUIA-ZOD-REPOSITORY.md`, "Décimo segundo passo".
- ✅ **EquipamentoEstabilizador fechado (22/09)** — `equipamentoEstabilizador.schema.ts`, `EstabilizadorRepository.ts` novos. **Bug de dado real achado**: Create gravava na tabela `equipamento` em vez de `estabilizadores`, então nada criado pelo formulário aparecia na própria listagem. Corrigido junto com uma rota faltando (`GET /list/estabilizadores`, plural, que o formulário de manutenção já chamava e não existia). Detalhe em `GUIA-ZOD-REPOSITORY.md`, "Décimo terceiro passo".
- ✅ **Os 7 endpoints `Detail*` de `controles_forms` fechados (22/09)** — skipados quando os módulos-pai foram migrados (15/09). `controleIdQuerySchema` novo em `common.schema.ts` (compartilhado por 6 dos 7 — só `SolicitacaoCompras` usa `compra_id` em vez de `controle_id`), reaproveitando o Repository que cada módulo já tinha. Comportamento de "não encontrado" preservado como estava (200 com corpo nulo, não 404) — não é o padrão do resto do projeto, mas mudar isso seria redesenhar comportamento, não só modernizar estrutura. Detalhe em `GUIA-ZOD-REPOSITORY.md`, "Décimo quarto passo".
- ✅ **Os 3 últimos endpoints ao redor de OrdemdeServico fechados (22/09)** — `GET /ordens/exportar` (Excel), `GET /ordens/relatorio-secretaria`, `GET /listatividade`. `ExportOrdemdeServicoService` novo (a montagem da planilha saiu do Controller, que agora só cuida de headers/streaming); `atividade.schema.ts`/`AtividadePadraoRepository.ts` novos; o `split(",").filter(Boolean)` manual de `tiposIds` virou um `.transform()` no Zod. Com isso, OrdemdeServico e tudo que a rodeia diretamente está 100% no padrão novo.
- ✅ **Item fechado por completo (22/09) — o resto do backlog de `routes.ts`.** Uma auditoria completa (motivada pela pergunta "os 68 controllers restantes é um número confiável?") achou que o número real era outro: quase todo módulo "fechado" tinha o `List` (e, em 3 casos, o `Create`/`Detail`/`Remove` inteiro) deixado pra trás. Fechados: os **13 `List` de lookup** generalizados num Service só (nunca tinham sido, mesmo Create/Delete já sendo genéricos desde 15/09); os **8 `List` de `controles_forms`**, com **4 bugs reais achados** (`execute()` chamado 2x = query duplicada à toa, em 4 desses 8; um campo `result` morto no JSON que o Frontend nunca lia; 2 contagens calculadas e nunca devolvidas — `totalConcluido` em Laboratorio, `totalReservada` em MaquinasPendentesOro); `List` de Equipamento e InformacoesSetor; **InstituicaoUnidade Create/List/Remove** (só Update tinha sido feito); **`user` List/Detail**; **AI Chat**; e o **filtro `status_id`/`tipoOS_id`** do `GET /listordemdeservico` principal, que o Service já suportava mas o Controller nunca conectava. Detalhe completo em `GUIA-ZOD-REPOSITORY.md`, "Décimo sexto passo".
- ~~⬜ Replicar pro restante de `status_categorias` e pro resto do projeto (~66 controllers).~~ — ✅ **fechado (22/09)**, ver "Atualização 22/09/2026 — o rollout de Zod/Repository fechado no projeto inteiro" mais abaixo. Essa linha ficou desatualizada por 1 rodada de edição — o item já estava fechado quando essa atualização foi escrita, só não tinha voltado aqui pra marcar.
- ⬜ Validar variáveis de ambiente no boot com um schema Zod (`DATABASE_URL`, `JWT_SECREATE`, `CLOUDINARY_*`) — falha de config aparecer no start, não em runtime.

## 4. Tratamento de erros global

- ✅ `AppError` / `ValidationError` / `NotFoundError` / `ConflictError` / `UnauthorizedError` (novo, 15/09) em `src/errors/AppError.ts`.
- ✅ Middleware global `errorHandler` (`src/Middleware/errorHandler.ts`), plugado uma vez em `server.ts` — trata `ZodError`, `AppError` e erros conhecidos do Prisma (`P2002`→409, `P2025`→404, `P2003`→400), resto vira 500 padronizado.
- ✅ **Item fechado por completo (22/09).** `try/catch` removido de todos os controllers já refatorados — erro sobe sozinho via `express-async-errors`. Bugs reais corrigidos no caminho: login com senha errada devolvia `500` (o `Error` genérico não caía em nenhum tipo que o `errorHandler` reconhecia) — com `UnauthorizedError`, agora devolve `401` de verdade; conflito de patrimônio duplicado em Equipamento também devolvia `500` pelo mesmo motivo — corrigido com `ConflictError` (409). Os 2 últimos arquivos (`Eventos/EventosControllers.ts`, `fotoController.ts`) fechados no mesmo dia — `Eventos` ganhou `EventoRepository`/`evento.schema.ts` novos (o Update deste módulo recebe o id pelo body, não por `:id`, então tem schema próprio em vez do `idParamSchema` compartilhado, que é uuid — `Event` usa id numérico autoincrement); `fotoController` ganhou `FotoOrdemServicoRepository`/`foto.schema.ts`, e o método `handle` (já modernizado pra fila em 14/09, mas ainda com `try/catch` em volta) passou a lançar `ValidationError` em vez de `res.status(400)` manual quando falta arquivo ou `ordemdeServico_id`.

**Contagem final (22/09):** só conta quem realmente tinha o padrão antigo (`catch (error) { return res.status(400)... }`), não try/catch legítimo (retry de `numeroOS`, fallback de Redis, `JSON.parse` de `atividades_ids`). **Zero arquivos** (10 → 2 → 0) — todo o grupo fechado: os 7 arquivos de OrdemdeServico (3 `ListBy*Controller`, `time/TimeOrdemdeServicoController`, e os 3 de assinatura, sendo 2 código morto apagados e 1 modernizado), e os 2 de "Misc" (`Eventos`, `fotoController`).

~~`controles_forms` — todos os 8 módulos~~ — ✅ fechado (15/09). ~~`status_categorias` — equipamento, informacoessetor, 13 tabelas de lookup~~ — ✅ fechados (15/09). ~~OrdemdeServico — rotas fora do piloto Create/Update~~ — ✅ fechado (22/09). ~~Misc — Eventos, fotoController~~ — ✅ fechado (22/09).

Essa tabela é literalmente a lista de próximos alvos do rollout de tratamento de erro (item 4) — não se confunde com o rollout de Zod/Repository (item 1/3), que está bem mais adiantado (26 módulos) do que essa tabela específica sugere.

## 5. Filas — BullMQ + Redis (+ AWS)

- ✅ Protótipo isolado testado ao vivo (`src/queue/uploadQueue.ts`, `uploadWorker.ts`, `addSampleJob.ts`, `dashboard.ts` com Bull Board) — Redis rodando via `docker-compose.yml`.
- ✅ **Ligado ao fluxo real (14/09)** — `fotoController.handle` enfileira (`uploadQueue.add("upload-foto-os", ...)`) e responde `202` em vez de subir pro Cloudinary dentro do request; `uploadWorker.ts` faz o upload + grava no Postgres, com retry automático (3 tentativas, backoff exponencial). Serviço `fireos-worker` novo no `docker-compose.yml` + volume `tmp_uploads` compartilhado com a API (sem isso o worker não enxergaria o arquivo temporário, containers diferentes = disco isolado). Detalhe completo em `GUIA-FILA-BULLMQ.md`, seção 6.
- ⬜ `saveAssinatura.ts` continua fora do escopo — a assinatura nem chega a ser enviada pelo app hoje (achado separado, ver item de assinatura no `ROADMAP-PLENO.md`).
- ⬜ AWS: decidido deixar **fora do Fire OS por enquanto** — o projeto que cobre AWS de verdade (Lambda + API Gateway) é o Encurtador (`../projeto-encurtador/PROJETO-ENCURTADOR.md`, item 7), não faz sentido duplicar esforço aqui. Revisitar só se a decisão mudar.

## 6. Cache

- ✅ Cache-aside com Redis implementado em `ListOrdemdeServicoService.ts` — os 8 `count()` de status agora ficam guardados 30s (`src/redis/index.ts` + método `getTotais()`), com fallback se o Redis cair (não derruba a rota). 50 testes passando, 3 novos cobrindo miss/hit/fallback.
- ✅ Replicado em `ListTecnicoService.ts` — TTL de 60s (maior que o de OS, porque a lista de técnicos muda com frequência bem menor) + invalidação ativa: `CreateTecnicoService`/`RemoveTecnicoService` chamam `redisClient.del()` na chave assim que criam/removem um técnico, pra não deixar a lista velha até o TTL expirar sozinho. 58 testes passando (6 novos: miss/hit/fallback da listagem + invalidação no create/remove).
- ✅ **Provado contra Redis real, não só mockado (22/09)** — `cacheRedis.e2e.test.ts`, 4 testes via `RedisContainer` (TestContainers): miss grava a chave, hit não recalcula, `POST /tecnico`/`DELETE /removertecnico` invalidam de verdade, e os totais de `GET /listordemdeservico` continuam batendo com o cache mesmo quando a lista principal (não cacheada) já mudou.
- ⬜ **Ideia descartada por ora:** colapsar os 8 `count()` num único `GROUP BY` via SQL bruto — tecnicamente possível, mas o ganho fica pequeno já que o cache faz a query rodar só a cada 30s em vez de a cada request.

## 7. Testes automatizados

- ✅ 228 testes unitários passando (Vitest) — cobrindo auth (`UnauthorizedError` incluso), RBAC/CASL (incluindo os 3 módulos técnicos, 12 testes novos com `it.each`), Create/Update/Delete de OrdemdeServico, `user`, os 8 módulos de `controles_forms`, Equipamento + InformacoesSetor, o Repository/Service genéricos de lookup, InstituicaoUnidade (todos com repository fake em vez de mock do Prisma), a infra de validação/erro, o cache-aside da listagem, a fila (`fotoController.test.ts`, mockando `uploadQueue`), o middleware genérico de ownership (`authorizeOwnership.test.ts`), os schemas novos, e um teste estrutural novo (`controllerHandleBinding.test.ts`) que impede a regressão do bug de `this` (ver abaixo).
- ✅ **Testes de integração + TestContainers + E2E implementados (18/09), pro fluxo de autenticação** — `vitest.integration.config.ts` separado, `globalSetup` sobe um Postgres efêmero via TestContainers (nunca toca o banco real do `.env`, que aponta pro Neon), roda `prisma db push`, e supertest bate no Express de verdade (`POST /session`). 7 testes passando.
- ✅ **E2E de OrdemdeServico implementado (21/09)** — 6 testes novos (13 no total): criação via HTTP com FKs reais, 422 de Zod, 401 sem token, e o ciclo de ownership/CASL completo (dono atualiza, não-dono toma 403, id inexistente toma 404) — a mesma peça de autorização (`authorizeOwnership`) que fechou o gap de "sequestro de conta" do `user/update`, agora provada passando pelo Express real, não só com a ability mockada em unitário. Achado no processo: `fileParallelism: false` precisou entrar em `vitest.integration.config.ts` — os arquivos de integração compartilham um único Postgres efêmero, e rodando em paralelo (padrão do Vitest) o cleanup de um arquivo corria por baixo do teste de outro.
- ✅ **E2E de `user` implementado (21/09, mesmo dia)** — 6 testes novos (19 no total): cadastro público sem token, 409 de email duplicado, 422 de senha curta, 401 sem token no update, ADMIN atualizando a conta de outro usuário (senha incluída), e — o teste que mais importa aqui — **usuário não-ADMIN autenticado tomando 403 ao tentar atualizar a conta de outro**, com o banco confirmado intocado depois. É a regressão E2E do achado mais grave do projeto (15/09, sequestro de conta): agora não é só o `can(['ADMIN'])` existir no código, é o Express real recusando a tentativa e o Postgres real provando que nada mudou.
- ✅ **Cobertura estendida pro resto do sistema (22/09)** — 5 arquivos novos, 35 testes: os 3 módulos técnicos com ownership (mesmo padrão de OrdemdeServico), as 3 entidades de `status_categorias` com bugs reais documentados (Equipamento/InformacoesSetor/InstituicaoUnidade), os 5 módulos de `controles_forms` sem ownership, o padrão genérico de lookup, e o ciclo de controle de tempo de OrdemdeServico. 54 testes de integração/E2E no total. Dois achados reais no processo — uma corrida entre arquivos de teste (resolvida centralizando limpeza num helper único) e um travamento real de ~20-30s por request quando o Redis cai (resolvido com `enableOfflineQueue: false`). Ficou de fora de propósito: assinatura de OrdemdeServico (não usada hoje), upload/fila (custo de infra alto), exports/relatórios, eventos do calendário, e os Deletes de `controles_forms` fora de Equipamento.
- ✅ **Redis real via TestContainers + Repositories críticos, executado (22/09)** — `globalSetup.ts` sobe um `RedisContainer` junto do Postgres; 4 arquivos novos, 19 testes: cache-aside/invalidação contra Redis de verdade, e 13 Repository classes (mais o `UserRepository` que já tinha) provadas contra Postgres real em vez de só Prisma mockado. 101 testes de integração/E2E no total (82 → 101). Detalhe na atualização de hoje, mais abaixo.
- Detalhe completo: `GUIA-TESTES-INTEGRACAO-E2E.md`.
- 🔴 **Achado crítico no processo:** o primeiro teste E2E revelou que **48 controllers** (praticamente todo o rollout de Zod/Repository até aqui) devolviam 500 sempre que a rota era chamada de verdade — `new Controller().handle` perde o `this` quando o Express extrai o método do prototype. Nenhum teste unitário pegava isso (todos chamam `handle` já vinculado à instância). Corrigido nos 48 arquivos (`handle` virou arrow function como campo de classe) + teste de regressão que garante que não volta. Detalhe completo: `GUIA-TESTES-INTEGRACAO-E2E.md`.
- ✅ **`coverage` configurado (15/09)** — `@vitest/coverage-v8`, piso de hoje (30-45% dependendo da métrica, não 60% — a maioria dos ~75 controllers fora do rollout ainda tem zero teste, um piso aspiracional travaria o CI por dívida antiga). Número real exposto no README raiz. Achado no caminho: a pasta `coverage/` gerada pelo relatório HTML estava sendo lintada como se fosse código do projeto — ignorada no `eslint.config.mjs`, mesmo raciocínio do `@prisma/**`.

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

---

## Atualização 18/09/2026 — testes de integração/E2E implementados, e o bug mais grave do projeto encontrado no processo

Pedido: "pode fazer testes de Integração E2E". Montei a infraestrutura (TestContainers + supertest, ver `GUIA-TESTES-INTEGRACAO-E2E.md` pro relato completo) e escrevi o primeiro teste real: login via HTTP.

**O primeiro teste E2E já nasceu vermelho — e não por causa de bug no login.** Todo controller "fino" deste projeto (o padrão usado desde o primeiro piloto de OrdemdeServico, semanas atrás) tem essa forma:

```ts
class XController {
  constructor(private service = new XService()) {}
  async handle(req, res) {
    const result = await this.service.execute(...); // <- this
    ...
  }
}
```

E é registrado em `routes.ts` como `new XController().handle`. O problema: isso extrai o método `handle` da instância — vira uma função solta. O Express chama ela como `handle(req, res, next)`, **nunca** `instancia.handle(...)`. Dentro do método, `this` fica `undefined`, e `this.service.execute(...)` lança `TypeError: Cannot read properties of undefined`. Confirmei isso com uma reprodução isolada (Express puro, sem nenhum código do projeto) antes de mexer em qualquer arquivo, só pra ter certeza que não era um problema da minha config de teste.

**Alcance real:** rodei a mesma busca em todo `src/controllers` e `src/services` — **48 arquivos** tinham exatamente esse problema. Não é bug desta sessão: inclui o pilotão original (`UpdateOrdemdeServicoController`, `UpdateUserController`), o rollout inteiro de `controles_forms`, Equipamento/InformacoesSetor, os 13 de lookup, e o `InstituicaoUnidade`. **Todo o rollout de Zod/Repository feito até hoje estava devolvendo 500 sempre que uma rota fosse chamada de verdade** (passando pelo Express, não só testada em isolamento) — e nenhum teste unitário pegava isso, porque todos chamam `handle` já vinculado à instância (`controller.handle(req, res)`, não `handle(req, res)` solto).

**Corrigido nos 48 arquivos** — `async handle(req, res) {` virou `handle = async (req, res) => {` (arrow function como campo de classe, fecha sobre o `this` do construtor em vez de depender de quem chama). Escrevi um teste estrutural (`controllerHandleBinding.test.ts`) que varre todo Controller do projeto e falha se esse padrão perigoso reaparecer — validado reintroduzindo o bug de propósito e vendo o teste falhar antes de desfazer.

- 228 testes unitários passando (1 novo: a guarda estrutural), 7 testes de integração/E2E passando.
- `npm run test:integration` também ligado no CI (`test.yml`) — os runners do GitHub Actions já vêm com Docker.
- `tsc`/`eslint` limpos.

Detalhe completo, incluindo o passo a passo da investigação: `GUIA-TESTES-INTEGRACAO-E2E.md`.

---

## Atualização 21/09/2026 — E2E de OrdemdeServico, e uma condição de corrida achada na própria infra de teste

Pedido: continuar o item 7 pra além do login. Escolhi OrdemdeServico por ser a entidade central do sistema e a que primeiro teve ownership/CASL (item 2) — provar essa regra passando pelo Express real, não só com a `ability` mockada em unitário, fecha o mesmo tipo de buraco que o bug do `this` (achado em 18/09) mostrou que só E2E pega.

- **6 testes novos** em `src/test/integration/ordemDeServico.e2e.test.ts`: criação via HTTP com FKs reais (`tipodeChamado`, `statusOrdemdeServico`, `user`), 422 quando falta campo obrigatório (Zod barra antes do Service), 401 sem token, técnico dono atualizando a própria OS, técnico **não-dono** tomando 403 ao tentar mexer na OS de outro (prova end-to-end de `authorizeOwnership` + CASL), e 404 num id que não existe.
- **Achado no processo, na própria infraestrutura de teste:** a primeira rodada com o arquivo novo falhou com `404` inesperado na criação — não era bug do código, era condição de corrida: os 3 arquivos de integração rodam contra o **mesmo** Postgres efêmero (um container só, subido uma vez no `globalSetup`), mas o Vitest roda arquivos de teste em paralelo por padrão. O `user.deleteMany()` do `userRepository.integration.test.ts` corria por baixo de uma request em andamento no arquivo novo, apagando o usuário que o `create` da OS ia conectar — o Prisma reportava `P2025` (registro do connect não encontrado), que o `errorHandler` mapeia pra 404. Não apareceu antes porque só havia 2 arquivos com pouca sobreposição de tabela; com o terceiro, colidiu. Corrigido com `fileParallelism: false` em `vitest.integration.config.ts` — os arquivos de integração agora rodam em sequência, não em paralelo (só eles; a suíte unitária continua paralela).
- 13 testes de integração/E2E passando (7 → 13), 228 testes unitários inalterados, `tsc`/`eslint` limpos (mesmos 26 avisos de sempre).

Detalhe completo: `GUIA-TESTES-INTEGRACAO-E2E.md`, seção "21/09 — E2E de OrdemdeServico e a corrida entre arquivos".

---

## Atualização 21/09/2026 (mesmo dia) — E2E de `user`, a regressão do achado mais grave

Pedido: continuar o item 7. Depois de OrdemdeServico, o alvo mais valioso era `user` — não pelo volume (só 2 rotas: cadastro e update), mas porque `PATCH /user/update/:id` é exatamente a rota do achado mais grave já feito neste projeto (15/09): sem `can(['ADMIN'])`, qualquer usuário autenticado trocava senha/email de qualquer outro usuário. Até agora essa proteção só tinha prova unitária (`can.test.ts`, testando o middleware isolado); nunca tinha sido provada pelo caminho HTTP completo.

**6 testes novos** (`src/test/integration/user.e2e.test.ts`):
- `POST /users` (cadastro público, sem token) → 200, senha chega hasheada no banco.
- `POST /users` com email já existente → 409 (`ConflictError`, não um 500 genérico).
- `POST /users` com senha curta → 422 (Zod).
- `PATCH /user/update/:id` sem token → 401.
- ADMIN atualizando a conta de **outro** usuário, senha inclusive → 200, e o hash novo bate (`compare()` do bcrypt contra o valor gravado).
- **Usuário TECNICO (não-ADMIN) autenticado tentando atualizar a conta de outro usuário → 403**, com o banco confirmado intocado (senha antiga continua batendo) — a prova de que o gap de 15/09 está mesmo fechado, agora numa forma que quebra se alguém remover o `can(['ADMIN'])` da rota por engano no futuro.

Nenhum achado novo neste passo — só confirmação de que o comportamento documentado em 15/09 se sustenta passando pelo Express real. 19 testes de integração/E2E no total (13 → 19), 228 unitários inalterados, `tsc`/`eslint` limpos.

Detalhe completo: `GUIA-TESTES-INTEGRACAO-E2E.md`, seção "21/09 — E2E de `user`".

---

## Atualização 22/09/2026 — item 7 fechado: E2E pro resto do sistema, e 2 achados reais na infra

Pedido: terminar o item 7. Até aqui a cobertura E2E era auth + OrdemdeServico + `user` — uma fração pequena da superfície de rotas do sistema. Fechei o resto por ordem de risco: primeiro os módulos com ownership (mesma classe de bug do sequestro de conta), depois as entidades com bugs de produção já documentados, depois o CRUD simples, depois o padrão genérico de lookup, e por último o fluxo de controle de tempo de OrdemdeServico (o mais complexo, uma máquina de estados).

**5 arquivos novos, 35 testes:**
- `controlesTecnicos.e2e.test.ts` — AssistenciaTecnica, LaudoTecnico, DocumentacaoTecnica: criação, dono atualiza, não-dono toma 403. Mesmo `authorizeOwnership`/CASL de OrdemdeServico, mesmo gap original (14-15/09) que motivou generalizar a regra pros 3 módulos — agora provado passando pelo Express real.
- `statusCategoriasEntidades.e2e.test.ts` — Equipamento (ciclo completo criar/atualizar/apagar, incluindo o Delete que antes lia `req.query.equipamento_id` em vez do `:id`; conflito de patrimônio → 409), InformacoesSetor (partial-update sem apagar associação que não veio no payload), InstituicaoUnidade (criação, e não-ADMIN toma 403 no update). Os 3 módulos onde o rollout de 15/09 achou bugs reais em produção — cada teste aqui mira uma dessas regressões específicas, não só o caminho feliz.
- `controlesFormsCrud.e2e.test.ts` — Estabilizadores, Laboratorio, MaquinasPendentesLab, MaquinasPendentesOro, SolicitacaoCompras: criação, 401, 422, incluindo a regressão da assimetria `instituicaoUnidade_id` opcional/obrigatório entre os dois módulos "MaquinasPendentes" (achado em 15/09, comparando o `schema.prisma`).
- `lookupCategoria.e2e.test.ts` — 3 rotas de lookup diferentes (`statuscompras`, `tipodechamado`, `statusreparo`) mais o Delete de `statusordemdeservico` (o único com id via query string). Prova o padrão genérico (1 schema + 1 Repository + 2 Services pros 13 módulos) funcionando via HTTP, sem escrever 13 arquivos de teste quase idênticos.
- `ordemDeServicoFluxos.e2e.test.ts` — `GET /listordemdeservico` e o ciclo completo `iniciar → pausar → retomar → concluir`, incluindo 404 (ordem inexistente) e 400 (transição de estado inválida). Esse módulo de tempo ainda é old-style (sem Zod, `try/catch` manual) — a prova aqui é sobre a máquina de estados se comportar certo, não sobre validação de payload.

**Achado 1 — corrida entre arquivos de teste.** Ao adicionar o 3º/4º arquivo novo, a suíte começou a falhar com erros de FK constraint: cada arquivo limpava só as tabelas que usava diretamente, e com mais arquivos compartilhando as mesmas tabelas de apoio (`user`, `tecnico`, `equipamento`, `instituicaoUnidade`...) um arquivo podia tentar apagar uma linha que outro arquivo ainda referenciava. Resolvido criando `limparBanco()` em `helpers.ts` — uma função só, com a ordem FK-safe completa (filhos antes dos pais) pra toda tabela usada em qualquer arquivo de integração — e trocando o `beforeEach` de **todos** os 9 arquivos pra chamar só ela. Efeito colateral bom: elimina a manutenção de 9 listas parciais e ligeiramente diferentes.

**Achado 2 — o cliente Redis travava ~20-30s por request quando o Redis caía.** O primeiro teste que bateu em `GET /listordemdeservico` (rota que usa o cache-aside do item 6) travou até estourar o timeout de 30s do Vitest. Não era bug do teste: o `redisClient.get()`/`.set()` dentro do `try/catch` de `getTotais()` (item 6) está certo, mas o `ioredis`, por padrão, enfileira comandos emitidos enquanto o client está desconectado e tenta reconectar várias vezes (com backoff) antes de rejeitar a promise — só depois disso o `catch` roda e cai pro banco. Ou seja, o fallback funcionava, só chegava tarde demais: na prática, uma queda de Redis fazia toda listagem de OS travar por ~20-30 segundos antes de responder, o que pro usuário final é indistinguível de "a rota caiu". Corrigido com `enableOfflineQueue: false` em `src/redis/index.ts` — um comando emitido sem conexão ativa agora falha na hora, o `try/catch` cai pro banco imediatamente, e o client continua tentando reconectar em segundo plano pro próximo request já achar o Redis de volta, se ele voltar. Confirmado: a suíte de integração caiu de ~112s pra ~24s de duração total depois do fix.

**Deixado fora de propósito** (não esquecido — decisão explícita de escopo): as rotas de assinatura de OrdemdeServico (já documentado que o app não chega a enviar assinatura hoje), o fluxo de upload/fila via BullMQ (precisaria de Redis + worker rodando de verdade, custo de infra alto pro retorno nesse ponto), as rotas de export/relatório, o módulo de eventos do calendário, e os Deletes dos módulos de `controles_forms` fora de Equipamento (o único onde havia um bug real documentado).

- **54 testes de integração/E2E no total** (19 → 54), 228 testes unitários inalterados, `tsc`/`eslint` limpos (mesmos 26 avisos de sempre). Suíte de integração roda em ~24-25s.

Detalhe completo: `GUIA-TESTES-INTEGRACAO-E2E.md`, seção "22/09 — fechando o item 7: o resto do sistema, e 2 achados na infra de teste".

---

## Atualização 22/09/2026 (mesmo dia) — OrdemdeServico fechado por completo, e `.env.example` criado

Depois do item 7, voltei pro item 1: das 7 rotas de OrdemdeServico que ainda faltavam no rollout de Zod/Repository, escolhi terminar esse módulo específico em vez de abrir um novo — o contexto (schemas, bugs conhecidos, `authorizeOwnership`) já estava fresco de ter acabado de escrever os testes E2E dele.

**List/Get por id, List por status, List por técnico:**
- `GetOrdemdeServicoByIdController` (arquivo `ListByIdOrdemdeServicoController.ts`) — Service + `OrdemdeServicoRepository.findById()` novo, `NotFoundError` no lugar do `if (!ordem) return res.status(404)` manual.
- `ListByStatusTicketsController`/`ListByTecnicosTicketsController` — nunca tinham validação nenhuma nos query params (`statusOrdemdeServico_id`/`tecnico_id` podiam vir vazios ou não-UUID sem barrar em lugar nenhum); `listByStatusQuerySchema`/`listByTecnicoQuerySchema` novos, `validate(schema, 'query')` nas duas rotas.
- Os 3 arquivos de Service antigos (`LitsOrdemdeServicoId.ts` — sim, com o typo no nome —, `ListOrdemdeServicoStatusService.ts`, `ListOrdemdeServicoTecnicoService.ts`) apagados, a lógica virou repository + service fino dentro do próprio arquivo do controller, mesmo padrão já usado no resto do rollout.

**Controle de tempo (`TimeOrdemdeServicoController`/`TimeOrdemdeServicoService`):** os 6 endpoints (`iniciar`/`concluir`/`pausar`/`retomar`/`atualizar-tempo`/`tempo`) nunca tinham `validate(idParamSchema, 'params')` — agora têm, mais `atualizarTempoSchema` novo pro body de `atualizar-tempo`. No Service, toda checagem de erro que fazia `if (error.message.includes("não encontrada")) status = 404` no Controller virou `NotFoundError`/`AppError` de verdade, e o Controller virou 6 arrow functions sem `try/catch`, deixando o erro subir pro `errorHandler` global — o mesmo padrão do resto do projeto, só que esse módulo nunca tinha passado por ele antes. Removidos também uns `console.log` de debug que sobraram de investigação anterior (`⚠️ Status atual da OS`, `🟢 ID esperado`).

**Assinatura — o achado de código morto do dia:** antes de mexer, chequei se as 3 rotas/arquivos de assinatura estavam mesmo todas em uso. Só `AssinaturaController` (dentro de `saveAssinatura.ts`, apesar do nome do arquivo) está de fato registrado em `routes.ts`. `CreateAssinaturaController.ts` e `GetAssinaturaController.ts` (que, pra aumentar a confusão, exporta uma classe chamada `SaveAssinaturaController`) são importados em `routes.ts` mas **nunca usados em nenhuma rota** — junto com `CreatedAssinaturaService.ts`, que só existia pra servir o primeiro. Perguntei antes de decidir: apagar os 2 mortos, modernizar só o que sobrevive. `AssinaturaController` ganhou `assinaturaSchema`/`ordemIdParamSchema` novos, 3 métodos novos no `OrdemdeServicoRepository` (`existsById`, `findAssinatura`, `updateAssinatura`), e virou Controller fino + Service, preservando a checagem de "ordem existe" antes de gastar uma chamada ao Cloudinary (o comportamento original já fazia isso — só não com um repository por trás).

**Resultado:** OrdemdeServico é o primeiro módulo do rollout **100% completo** — não só o piloto Create/Update de semanas atrás. `try/catch` antigo (item 4) caiu de 10 pra 2 arquivos (só `Eventos/EventosControllers.ts` e `fotoController.ts` restam). 228 testes unitários inalterados, 54 de integração/E2E inalterados (a suíte de tempo/listagem já escrita ontem passou sem alteração, confirmando que o comportamento não mudou pro cliente), `tsc`/`eslint` limpos — o lint até caiu de 26 pra 24 avisos, porque os 2 arquivos mortos tinham `unused-vars`.

**`.env.example` e `JWT_SECREATE`:** o repo nunca teve `.env.example`, então `cp .env.example .env` (primeiro passo do README) sempre quebrou pra quem clonasse o projeto do zero. Antes de criar, perguntei se produção já tinha uma env var configurada com um dos dois nomes possíveis (`JWT_SECREATE`, o nome real do código, ou `JWT_SECRET`, o nome que o README documentava) — confirmado que produção usa `JWT_SECREATE`. Decisão: corrigir a documentação pra bater com a realidade (README + comentário órfão em `isAuthenticated.ts`), não renomear a env var no código — renomear sem trocar a variável em produção também quebraria o login lá. `.env.example` criado com os 5 valores reais necessários (`JWT_SECREATE`, `DATABASE_URL`, `CLOUDINARY_NAME`/`KEY`/`SECRET`, `REDIS_URL`), placeholders, sem nenhum segredo de verdade.

Detalhe completo do rollout de OrdemdeServico: `GUIA-ZOD-REPOSITORY.md`.

---

## Atualização 22/09/2026 (mesmo dia) — item 4 fechado por completo: Eventos e fotoController

Últimos 2 arquivos do item 4: `Eventos/EventosControllers.ts` e `fotoController.ts` — o "Misc" que sobrava depois de fechar OrdemdeServico.

- **Eventos** — módulo de calendário, nunca tinha passado por Zod. `evento.schema.ts` novo: precisou de um param schema próprio (`eventoIdParamSchema`, `id` numérico) porque `Event` usa id autoincrement, não uuid como o resto do projeto — não dava pra reaproveitar o `idParamSchema` compartilhado. O Update deste módulo recebe o `id` pelo body (`PUT /events`, não `PATCH /events/:id`), mantido assim de propósito pra não mudar o contrato que o Frontend já usa. `EventoRepository.ts` novo, `EventoService`/`EventosController` viraram classe fina, os 4 `try/catch` que faziam `catch (error) { res.status(500)... }` genérico saíram.
- **fotoController** — o método `handle` já tinha sido modernizado pra fila em 14/09 (enfileira em vez de subir pro Cloudinary no request), mas ainda tinha `try/catch` em volta, e `listByOrdem`/`delete` nunca tinham sido tocados. `FotoOrdemServicoRepository.ts` novo, `foto.schema.ts` (valida `ordemdeServico_id`), `NotFoundError` no lugar do `if (!foto) return res.status(404)` manual em `delete`, e `handle` agora lança `ValidationError` (em vez de `res.status(400)` direto) quando falta arquivo — ajuste que exigiu atualizar o teste unitário existente (`fotoController.test.ts`) pra esperar a exceção em vez de checar `res.status`; o teste que cobria "falta `ordemdeServico_id`" foi removido do unitário porque essa validação virou responsabilidade do Zod na rota (mesmo padrão do resto do projeto: validação de payload é testada em E2E, não no Controller isolado) — o fluxo de upload/fila continua fora do escopo de E2E, decisão já registrada na atualização de ontem.

**Resultado:** `try/catch` antigo (item 4) fechado — **zero arquivos** no projeto inteiro com o padrão antigo, contra os 10 do início do dia 15/09. 227 testes unitários (-1: o teste removido, sem substituto direto porque a validação migrou pra Zod), 54 de integração/E2E inalterados, `tsc` limpo, `eslint` caiu de 24 pra 20 avisos.

Detalhe completo: `GUIA-ZOD-REPOSITORY.md`, seção "Décimo primeiro passo".

---

## Atualização 22/09/2026 (mesmo dia) — Cliente, Setor, Tecnico, e mais 2 bugs reais de produção

Pedido: continuar o rollout de Zod/Repository (item 1), escolhendo o próximo módulo. Mandei mapear (via agente) tudo que ainda faltava em `routes.ts` — Cliente, Setor e Tecnico apareceram como o grupo mais óbvio: os 3 têm exatamente o mesmo formato (CRUD simples, sem try/catch pra remover, sem Zod, sem Repository, service fino direto sobre `prismaClient`), então tratados juntos, mesmo raciocínio já usado pra generalizar os 13 lookups.

**Antes de escrever qualquer schema, conferi (mesma pergunta de sempre: "existe algo óbvio a confirmar antes de replicar?") se as rotas de cada módulo batiam com o que o Frontend realmente chama — e não batiam, em 2 casos:**

- **`PATCH /cliente/:id` nunca existiu em `routes.ts`**, mas `EditClienteForm.tsx` já chama exatamente essa rota (com um `alert()` mostrando o erro pro usuário quando falha) — editar um cliente sempre devolveu 404 em produção. O Controller e o Service pra isso já existiam prontos, completos, com a lógica certa (`UpdateClienteController.ts`/`UpdateClienteService.ts`) — só nunca tinham sido importados nem ligados a rota nenhuma. Mesmo padrão exato do achado de `InstituicaoUnidade` em 15/09.
- **`DELETE /deletecliente` não tinha `:id` na rota**, mas `ClientesList.tsx` sempre chamou `DELETE /deletecliente/${clienteId}` — Express não casa `/deletecliente/<qualquer-coisa>` contra uma rota registrada como `/deletecliente` sem `:id`, então a requisição nunca chegava nem no Controller (404 do próprio Express, antes de qualquer lógica de negócio). Corrigido adicionando `:id` na rota e trocando o Controller pra ler `req.params.id`.

Os dois corrigidos, com teste E2E de regressão dedicado pra cada um (`cliente.e2e.test.ts`, 6 testes novos).

**Um quase-achado que não era bug de verdade:** `RemoveTecnicoController` lê `req.query.tecnico_id`, apesar da rota (`DELETE /removertecnico/:id`) declarar `:id` no path — parecia o mesmo tipo de bug do Cliente. Mas conferindo o Frontend (`TecnicoList.tsx`, `TicketsList.tsx`), os dois lugares que chamam essa rota mandam o id **nos dois formatos ao mesmo tempo** (no path *e* como `params: { tecnico_id }` do axios, que vira query string) — o controller lendo da query sempre recebeu o valor certo, então nunca quebrou de verdade. Ainda assim, limpei pra ler de `req.params.id` (o padrão mais correto, já que a rota declara `:id`), já que os dois callers já mandam o id no path de qualquer forma — não muda nada pro Frontend, só remove a dependência de um parâmetro redundante.

**Tecnico manteve o cache-aside com Redis** (item 6, TTL de 60s + invalidação em create/remove) — só trocado `prismaClient` direto por `TecnicoRepository` por baixo, sem alterar o comportamento do cache. Isso exigiu reescrever `ListTecnicoService.test.ts`, que mockava `prismaClient` diretamente (padrão antigo) — agora usa um `TecnicoRepository` fake, mesmo padrão do resto do projeto desde a introdução do Repository pattern.

**Achado pequeno, fora do Backend:** enquanto conferia os callers de delete de cliente no Frontend, `ClienteMunicipalList.tsx` (uma tela de listagem de clientes diferente de `ClientesList.tsx`) chama `/deletedesolicitacaodecompras/:id` pra deletar um cliente — o endpoint errado, de outro módulo (parece copy-paste de um componente de compras). Não é um bug do Backend (a rota que ela chama existe e funciona, só é a rota errada) — fora do escopo deste repositório, só registrado aqui pra não se perder.

**Limpeza pequena:** um import morto (`ListtipodeChamadoService`, importado direto em `routes.ts` mas nunca usado lá — o Controller que precisa dele já importa por conta própria) removido no caminho.

**Resultado:** 3 módulos novos no rollout (30 no total agora, item 1/3). 227 testes unitários (1 arquivo reescrito, sem mudar a contagem líquida), 60 de integração/E2E (54 → 60, os 6 novos de Cliente), `tsc` limpo, `eslint` caiu de 20 pra 18 avisos.

Detalhe completo: `GUIA-ZOD-REPOSITORY.md`, seção "Décimo segundo passo".

---

## Atualização 22/09/2026 (mesmo dia) — o bug de Estabilizadores, e os 7 endpoints Detail

Pedido: continuar o rollout, escolhendo o próximo pelo mesmo processo (mapear o que falta, priorizar). Mandei mapear de novo — dois grupos saíram na frente: `EquipamentoEstabilizador` (pequeno, mas com um achado de dado real) e os 7 endpoints `Detail*` de `controles_forms` (maior superfície, mesmo formato repetido).

### EquipamentoEstabilizador — o Create gravava na tabela errada

`CreateEquipamentoEstabilizadorService` fazia `prismaClient.equipamento.create(...)`, enquanto `ListEquipamentoEstabilizadorService` sempre leu de `prismaClient.estabilizadores.findMany(...)` — duas tabelas diferentes. Um estabilizador cadastrado pelo formulário (`formularioEstabilizadorAdd/page.tsx`, que chama `POST /equipamento/esbilizadores`) nunca aparecia em `GET /list/estabilizador`, nem ficava disponível como opção ao registrar uma manutenção (`controledeEstabilizadores`, que referencia um `estabilizadores_id`).

Checando os callers no Frontend antes de decidir a correção certa, apareceu um segundo problema, mais grave na prática: `FormularioControledeEstabilizadores.tsx` (a tela de registrar manutenção) busca as 3 listas do formulário (estabilizador, status, instituição) com `Promise.all`, e uma das chamadas é `GET /list/estabilizadores` (**plural**) — rota que nunca existiu, só a singular `/list/estabilizador`. Como `Promise.all` falha inteiro se qualquer uma das promises rejeitar, esse 404 sozinho **esvaziava as 3 listas do formulário**, com o erro só indo pro `console.error` (nenhum aviso pro usuário) — o formulário inteiro de registrar manutenção de estabilizador ficava, na prática, impossível de preencher.

Corrigido: `EstabilizadorRepository.create()` agora grava na tabela certa, e `GET /list/estabilizadores` foi adicionado como alias da mesma rota singular (mesmo Controller, duas rotas). 3 testes E2E de regressão — inclusive um confirmando que o mesmo registro aparece nas duas rotas.

### Os 7 Detail* — o pedaço que ficou pra trás em cada rollout anterior

Quando cada módulo de `controles_forms` foi migrado (Quinto/Sexto passo), o endpoint de Detail (`GET .../detail?controle_id=`) sempre ficou de fora — mencionado, mas nunca tratado. Formato idêntico nos 7: query string sem validação, Service batendo direto no `prismaClient` com um `findUnique` + `include` específico do módulo, sem checagem de "não encontrado" (sempre devolvia `200` com corpo `null`, nunca `404`).

Cada um dos 7 módulos (AssistenciaTecnica, LaudoTecnico, Laboratorio, MaquinasPendentesLab, MaquinasPendentesOro, DocumentacaoTecnica, SolicitacaoCompras) já tinha um Repository do rollout anterior, com um método `findUnique(id)` — só que **sem nenhum caller no projeto inteiro**. Não fazia sentido escrever um método novo: só adicionei o mesmo `include` que cada Detail Service já usava dentro desse `findUnique` existente, preservando exatamente a mesma resposta de antes.

6 dos 7 módulos usam a mesma forma de query (`?controle_id=`) — em vez de 6 schemas idênticos, um só (`controleIdQuerySchema`, adicionado em `common.schema.ts` ao lado do `idParamSchema` que já era compartilhado). Só `SolicitacaoCompras` usa `compra_id`, schema próprio.

**Decisão deliberada, não esquecimento:** o comportamento de "não encontrado" continua sendo `200` com corpo `null`, não um `404` via `NotFoundError` como o resto do projeto adotou. Trocar isso seria redesenhar o contrato da resposta pra quem já consome essas 7 rotas — é modernização de estrutura (Zod, Repository, sem try/catch pra remover porque nunca tiveram), não redesenho de comportamento. Registrado aqui pra não ser confundido com inconsistência não percebida.

2 testes E2E representativos (não 7 quase-idênticos): um módulo com relação incluída (AssistenciaTecnica) e um com nome de query diferente (SolicitacaoCompras) — cobrindo o caminho feliz, 422 de validação, e o "200 com null" preservado.

### Resultado

1 módulo novo no rollout (`EquipamentoEstabilizador`, 31 no total) — os 7 endpoints Detail não contam como módulos novos, são parte dos 8 módulos de `controles_forms` já contados. 227 testes unitários inalterados, 67 de integração/E2E (60 → 63 → 67), `tsc` limpo, `eslint` caiu de 18 pra 16 avisos.

Detalhe completo: `GUIA-ZOD-REPOSITORY.md`, seções "Décimo terceiro passo" e "Décimo quarto passo".

---

## Atualização 22/09/2026 (mesmo dia) — os últimos 3 endpoints ao redor de OrdemdeServico

Pergunta direta: "os principais de ordens de serviço e outros que rodeiam ordem de serviço finalizou?" Conferi contra o código real (não assumi) — o núcleo de OS e a maioria ao redor já estava fechado, mas sobravam 3 endpoints de leitura/relatório que nunca tinham sido tocados: `GET /ordens/exportar` (Excel), `GET /ordens/relatorio-secretaria`, e `GET /listatividade` (lista as atividades que ficam anexadas numa OS via `atividades_ids`).

- **`ListAtividadePadraoController`** — o mais simples dos 3: `AtividadePadraoRepository.ts` novo, `atividade.schema.ts` validando o filtro `categoria` contra o enum do Prisma (`EXTERNO`/`LABORATORIO`) em vez de aceitar qualquer string.
- **`RelatorioSecretariaController`** — o `if (ids.length === 0) return res.status(400)...` manual (depois de um `tiposIds.split(",").filter(Boolean)` cru) virou um `.transform()` no próprio Zod: o schema já devolve o array pronto, e a ausência do campo já dá 422 antes de chegar no Controller. A query em si (filtrar OS pelo tipo de instituição) virou um método novo no `OrdemdeServicoRepository` já existente (`findForRelatorioSecretaria`), reaproveitando o mesmo `select` de sempre.
- **`ExportOrdemdeServicoController`** — o único dos 3 que exigiu uma decisão de design: o Controller original fazia tudo — buscar os dados, montar a planilha inteira (colunas, estilo, cores), **e** escrever a resposta HTTP, tudo misturado. Extraí a parte de dados+planilha pra um `ExportOrdemdeServicoService` novo (que devolve o `Workbook` pronto, sem saber que existe um `res`), deixando o Controller só com o que é genuinamente dele: setar os headers de download e fazer `workbook.xlsx.write(res)`. Não dava pra ir além disso (por exemplo, devolver um Buffer em vez de escrever direto no stream) sem mudar o jeito como o ExcelJS escreve a resposta — ficou bom o suficiente sem reescrever a biblioteca por baixo.

**Resultado:** OrdemdeServico e tudo que a rodeia diretamente (os 8 módulos de `controles_forms`, os lookups que aparecem nos formulários de OS, e agora os 3 endpoints de relatório/export) está 100% no padrão novo — nenhuma peça do "raio de OS" ficou pra trás. 1 módulo novo no rollout (`AtividadePadrao`, 32 no total — Export/RelatorioSecretaria não contam como módulo novo, são parte de OrdemdeServico). 227 testes unitários inalterados, 73 de integração/E2E (67 → 73, os 6 novos cobrindo os 3 endpoints), `tsc`/`eslint` limpos (15 avisos).

Detalhe completo: `GUIA-ZOD-REPOSITORY.md`, seção "Décimo quinto passo".

---

## Atualização 22/09/2026 (mesmo dia) — o rollout de Zod/Repository fechado no projeto inteiro

Pedido: "pode fazer os 68 controllers". Antes de sair implementando, mandei mapear o que realmente restava — e a primeira resposta (um agente classificando por módulo, confiando na minha lista de "já migrado") disse que só sobravam 3 rotas. Não bati o olho e segui: cruzei com uma auditoria minha, arquivo por arquivo, e o número real era bem maior — **20 controllers ainda no padrão antigo**, escondidos porque a auditoria por módulo não verificava CADA controller dentro de um módulo "fechado". A causa: os rollouts de 15/09 focaram em Create/Update/Delete/Detail de cada módulo, e o `List` — quase sempre a rota mais usada — ficou de fora silenciosamente, em praticamente todo módulo do projeto.

**A lição de processo, antes dos números:** "módulo X está fechado" não é a mesma afirmação que "toda rota do módulo X está fechada". Um agente que classifica por módulo herda esse erro de granularidade automaticamente. A auditoria que valeu a pena foi a que checou arquivo por arquivo (`grep` por `async handle(` sem arrow function, por `prismaClient` importado direto em cada Service) — não a que confiou em rótulos já escritos.

### O que foi fechado, em blocos

1. **Os 13 `List` de lookup** — generalizados num `ListLookupCategoriaService` só, reaproveitando o `LookupCategoriaRepository` que Create/Delete já usavam desde 15/09. `findAll()` novo no Repository, 13 Services antigos apagados.
2. **Os 8 `List` de `controles_forms`** — cada um ganhou `findAll()`/`count()` no Repository já existente do módulo. **4 bugs reais achados nesse bloco**: em Laboratorio, MaquinasPendentesLab, MaquinasPendentesOro e SolicitacaoCompras, o Controller chamava `service.execute()` **duas vezes** (uma query inteira jogada fora) e embrulhava a resposta num campo `result` que — conferido contra o Frontend antes de mexer — nunca era lido. Em Laboratorio e MaquinasPendentesOro, uma contagem extra (`totalConcluido`, `totalReservada`) era calculada e nunca devolvida no JSON — bate com um aviso antigo do eslint (`no-unused-vars`) que estava sentado ali sem ninguém investigar o motivo.
3. **`List` de Equipamento e InformacoesSetor** — mesmo padrão, `findAll()` nos Repositories já existentes.
4. **InstituicaoUnidade completo** — só `Update` tinha sido feito em 15/09 (achado de código morto daquela vez). `Create`/`List`/`Remove` nunca tinham Repository nem Zod.
5. **`user` completo** — a migração original (15/09) foi só Create/Update/Auth. `List` e `Detail` ficaram cruas o tempo todo; `DetailUserService` lançava `Error` genérico em vez de `NotFoundError`.
6. **AI Chat** (`src/api/ai/chat/route.ts`) — Service extraído, Zod na pergunta, erro de API da Groq deixado subir pro `errorHandler` em vez de vazar `error.message` num 500 manual.
7. **`GET /listordemdeservico`** (o endpoint de listagem principal de OS) — achado parecido com os outros: o Service sempre suportou filtrar por `status_id`/`tipoOS_id`, mas o Controller nunca desestruturava nem repassava esses 2 campos — o filtro existia e nunca fazia nada.
8. **4 arquivos de código morto** apagados (achados checando cada import de `routes.ts` contra o corpo do arquivo, e cada Service contra quem o referencia): um controller duplicado, um arquivo vazio, um Service sem controller nenhum, e mais um resíduo do "problema de nomes trocados" da assinatura (achado em 15/09, mas esse arquivo específico tinha escapado por nunca ter sido importado em `routes.ts` — só apareceu grepando o nome da classe no projeto inteiro).

### Confirmado, não assumido

Depois de todos os blocos, rodei a mesma auditoria de novo: **zero** controllers com `async handle(` sem arrow function em todo `src/controllers`; **zero** `try/catch` antigo além dos 6 já catalogados como legítimos; só **4** services ainda importam `prismaClient` direto, e todos os 4 são exceções já entendidas (2 deliberadas — `ListOrdemdeServicoService` por causa do cache-aside, `TimeOrdemdeServicoService` por causa da máquina de estados — e 2 são helpers pequenos de `InformacoesSetor` que já usam Repository como caminho principal).

### Resultado

**Item 1/3 fechado no projeto inteiro** — o rollout de Zod/Repository, que era o maior item pendente do checklist desde o início, não tem mais nenhum controller pendente. 21 Repository classes no total (14 → 21). 227 testes unitários inalterados, 82 de integração/E2E (73 → 82, os 9 novos cobrindo o backlog fechado hoje), `tsc`/`eslint` limpos.

Detalhe completo: `GUIA-ZOD-REPOSITORY.md`, seção "Décimo sexto passo".

---

## Atualização 22/09/2026 (mesmo dia) — Redis via TestContainers de verdade, 14 Repositories provados contra Postgres real, e mudança pra fluxo de PR

Com o rollout de Zod/Repository fechado, retomei os 2 itens que tinham ficado combinados mas não executados: Redis via TestContainers (pré-requisito) e, a partir dele, testes de integração reais pros Repositories que só tinham Prisma mockado.

**Redis real no `globalSetup.ts`.** Mesma peça já usada pro Postgres (`@testcontainers/postgresql`): `@testcontainers/redis` instalado, `RedisContainer("redis:7-alpine")` sobe junto do `PostgreSqlContainer` (em paralelo, via `Promise.all`, pra não pagar o tempo de boot dos dois em série), e `REDIS_URL` é setado em `process.env` antes de qualquer arquivo de teste importar `src/redis/index.ts` — mesma garantia de ordem que já valia pro `DATABASE_URL`. `cacheRedis.e2e.test.ts` (4 testes) prova, contra esse Redis de verdade: `GET /listtecnico` grava a chave no miss e não recalcula no hit (criando um segundo técnico direto no banco, sem passar pela API, e confirmando que ele não aparece na resposta seguinte enquanto o TTL não expira); `POST /tecnico` e `DELETE /removertecnico` invalidam a chave de verdade; e os totais de `GET /listordemdeservico` (item 6) continuam vindo do cache mesmo depois que a lista principal — que nunca é cacheada — já mudou, provando que só o `getTotais()` é cache-aside, não a listagem inteira. Isso é exatamente o tipo de "combinação crítica" que o cache-aside mockado (`vi.mock('../../redis')`) nunca provou: o teste unitário confirma que o Service *chama* `get`/`set`/`del` certo, não que esses comandos batem numa chave real e voltam o valor certo depois.

**14 dos 21 Repositories provados contra Postgres real.** `userRepository.integration.test.ts` já existia; os 3 arquivos novos fecham o resto do que valia a pena provar sem virar 21 arquivos quase idênticos:
- `controlesFormsRepositories.integration.test.ts` (8 testes) — os 8 Repositories de `controles_forms` (AssistenciaTecnica, LaudoTecnico, Laboratorio, MaquinasPendentesLab, MaquinasPendentesOro, DocumentacaoTecnica, SolicitacaoCompras, Estabilizadores) têm o mesmo formato: `findUnique`/`create`/`findAll` com `include`, e um `countByStatusXName` que filtra por relação aninhada (ex.: `{ where: { statusReparo: { name } } }`). É exatamente esse tipo de filtro — fácil de digitar errado (nome de campo/relação trocado) e que um Prisma mockado nunca pega, porque o mock só devolve o que o teste mandou — que valia a pena provar uma vez pra cada um dos 8, num arquivo só (o contrato sendo testado é idêntico; volume de setup por módulo não é sinal novo por módulo).
- `miscRepositories.integration.test.ts` (4 testes) — `EquipamentoRepository.findByPatrimonio` (achar/não achar de verdade), `InformacoesSetorRepository.create` usando `UncheckedCreateInput` (escalar `setorId` direto, formato diferente dos outros que usam `connect` aninhado), `InstituicaoUnidadeRepository` (create/findAll/count), e `LookupCategoriaRepository` contra 2 tabelas físicas diferentes (`tarefa`, `statusReparo`) — o ponto de risco real aqui é o `delegate` genérico (`prismaClient[this.modelName]`, tipado `any` de propósito), onde um nome de model errado só quebra em runtime; provar com 2 models garante que a generalização (13 Repositories → 1) funciona pra qualquer um deles, não só pro primeiro copiado.
- `ordemdeServicoRepository.integration.test.ts` (3 testes) — os fluxos HTTP de OrdemdeServico já têm E2E (`ordemDeServico.e2e.test.ts`/`relatoriosOrdemDeServico.e2e.test.ts`); o que faltava provar direto no Repository eram os métodos que esses fluxos não exercitam: `findByStatus`/`findByTecnico` (filtro por FK), `existsById`, e `findAssinatura`/`updateAssinatura` (a tela de assinatura).

Com isso, **14 de 21 Repository classes** estão provadas contra Postgres real — os 7 que restam (`Cliente`, `Setor`, `Tecnico`, `EstabilizadorRepository` de EquipamentoEstabilizador, `Evento`, `FotoOrdemServico`, `AtividadePadrao`) são CRUD simples, de baixo risco, deixados de fora de propósito — mesmo raciocínio de custo/retorno já registrado nas atualizações de item 7 anteriores.

**Correção sobre o próprio processo, registrada aqui pra não repetir (mesma lição da atualização de 15/09 sobre recontar antes de afirmar):** o commit que fechou os Repositories descreveu "16 Repository classes" na mensagem — número escrito de cabeça, sem recontar. O número real, contando os arquivos de teste criados nesta rodada, é **13 Repositories novos** (8 + 4 + 1), mais o `UserRepository` que já tinha teste antes = **14 no total**. Registrado aqui porque o checklist é o lugar certo pra números corretos, mesmo quando o commit já foi feito com um errado.

**Mudança de fluxo, a partir de agora: entrega via branch + PR, não push direto na `main`.** Até este ponto da sessão, cada rodada de trabalho tinha sido commitada e empurrada direto pra `main` (com confirmação prévia). O usuário pediu explicitamente pra mudar isso — daqui pra frente, todo trabalho novo vai por branch + `gh pr create`, não push direto. Os 9 commits que estavam acumulados localmente na `main` (os 7 dos rollouts anteriores + os 2 desta rodada) foram movidos pra uma branch nova (`feat/redis-testcontainers-and-repo-integration-tests`) sem descartar histórico nenhum, e o PR #5 foi aberto com eles: https://github.com/pablo-cruzbr/Fire-OS-Service-Order-SaaS/pull/5.

**Resultado:** 227 testes unitários inalterados, **101 testes de integração/E2E no total** (82 → 101, os 19 novos: 4 de cache Redis + 8+4+3 de Repository). `tsc`/`eslint` limpos. `npx vitest run --config vitest.integration.config.ts` rodando os 18 arquivos, ~32-41s de duração total.

**O que ainda falta, de propósito:** a parte do item 7 que continua fora de escopo (upload/fila via BullMQ, eventos do calendário, Deletes de `controles_forms` fora de Equipamento) e os 7 Repositories de CRUD simples que ainda só têm prova unitária — nenhum dos dois é bloqueio, são só onde o próximo esforço de teste renderia menos do que já rendeu aqui.
