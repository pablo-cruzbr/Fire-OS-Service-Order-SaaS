# Rumo ao Pleno

Checklist construído em cima do código real do **Fire OS** (não do roadmap genérico de curso) — cada item abaixo veio de algo que encontrei lendo `Backend/src`. Uso: marque conforme for aplicando, e guarde o "por quê" de cada um — é isso que você vai defender na entrevista.

## A resposta direta

Dá para chegar em 10 meses de experiência com um projeto de nível pleno — o que está aqui embaixo é factível em 3 meses se for feito com profundidade, não como checklist de curso. O que **não** muda em 3 meses é o filtro de "X anos de experiência" que boa parte das vagas pleno usa no ATS antes de um humano ler o currículo. Isso significa: mire empresas que testam habilidade (teste técnico, live coding, indicação) em vez de confiar só na palavra "pleno" no anúncio, e use o Fire OS — com uso real validado em campo — como a peça que compensa o tempo de casa curto.

---

## Glossário — os termos, com exemplo prático do próprio Fire OS

Antes de aplicar cada item do checklist, entenda o conceito por trás. Cada termo abaixo tem: a definição simples + onde ele aparece (ou deveria aparecer) no seu código. A ordem segue o `CHECKLIST-REFATORACAO-BACKEND.md`, item por item, pra você conseguir ir direto no termo que precisa revisar.

### 1. Repository Pattern (e a separação Controller → Service → Repository)

**O que é:** uma camada fininha entre o Service (a regra de negócio) e o banco, que esconde o ORM (o Prisma) atrás de métodos com nome de negócio — `create`, `update` — pra ninguém mais no projeto precisar saber que existe um Prisma ali dentro. O ganho prático não é só organização: o teste do Service passa a receber um repository **fake** no lugar do banco de verdade, em vez de mockar o módulo inteiro do Prisma.

**No Fire OS:** 14 repository classes existem hoje (15/09) — `OrdemdeServicoRepository.ts`, `UserRepository.ts`, um por módulo de `controles_forms` (8 no total), `EquipamentoRepository.ts`, `InformacoesSetorRepository.ts`, `InstituicaoUnidadeRepository.ts`, e `LookupCategoriaRepository.ts` — esse último genérico, parametrizado pelo nome do model do Prisma no construtor, reaproveitado pelos 13 módulos de "tabela de lookup" (`statusCompras`, `tarefa`, `tipodeChamado`, etc.) em vez de 13 classes quase idênticas. Cada Service recebe o repository pelo construtor (isso é **injeção de dependência**: quem usa o Service decide o que entregar, em produção é o repository de verdade, no teste é um fake com `vi.fn()`). Os outros ~75 services do projeto ainda chamam o Prisma direto — é o item 1 do checklist, ainda pendente de replicar.

**"Piloto em 9 módulos, rollout pendente nos outros ~91" — o que essa frase quer dizer, sem jargão:**

Pensa assim: o Fire OS tem hoje quase 100 "gavetas" de controller (cliente, equipamento, setor, OrdemdeServico, user, etc.), e **todas elas nasceram do mesmo jeito** — Controller chamando `prismaClient` direto, sem Zod, com `try/catch` na mão. É a mesma "receita antiga" copiada e colada 100 vezes.

- **Piloto** = eu não saí trocando as 100 gavetas de uma vez. Escolhi **uma** (OrdemdeServico, por ser a mais crítica do negócio), apliquei a receita nova nela inteira (Zod + Repository + erro global), e só depois de essa funcionar de verdade — testada, rodando, sem quebrar nada — repeti a mesma receita em mais módulos. Isso é "pilotar": provar que a ideia funciona num caso pequeno antes de assumir o risco de aplicar em tudo.
- **Rollout** = o processo de ir replicando essa receita já validada, módulo por módulo, até cobrir o projeto inteiro. "Rollout pendente nos outros ~91" só quer dizer: a receita já está provada, falta o trabalho repetitivo (mas não mecânico — cada módulo tem seu próprio `schema.prisma`, e várias vezes achei bug real só de ler campo por campo) de aplicar ela nas ~91 gavetas que faltam.
- **Por que 9 e não 100 de uma vez:** cada módulo que vira Repository muda controller **e** service **e** ganha teste novo — é um PR grande se feito de uma vez só, e um bug introduzido em 100 arquivos ao mesmo tempo é muito mais difícil de achar do que um bug em 9. Fazer aos poucos (e revisar o resultado a cada grupo, como você tem feito) é a versão seguranca-em-primeiro-lugar do mesmo trabalho.

**Onde estão os 24 hoje:** OrdemdeServico (o piloto original) + `user` (achado o bug de segurança no caminho) + os 8 módulos de `controles_forms` + `Equipamento`/`InformacoesSetor` (achados 2 bugs reais de rota 404 no caminho) + as **13 tabelas de lookup** de `status_categorias` (`statusCompras`, `statusEstabilizadores`, `statusMaquinasPendentesLab`, `statusMaquinasPendentesOro`, `statusOrdemdeServico`, `statusReparo`, `prioridade`, `tarefa`, `tipodeChamado`, `tipodeEquipamento`, `tipodeInstituicaoUnidade`, `tipodeOrdemdeServico`, e o `statusControledeLaboratorio`) — essas últimas 13 via **um** schema + **um** Repository genérico, não 13 conjuntos separados. Ver `GUIA-ZOD-REPOSITORY.md`, "Sétimo passo" e "Oitavo passo", pro relato completo (inclusive um achado de rota 404 que o próprio dev do Frontend já desconfiava, comentário no código e tudo).

**Onde estão os ~75 que faltam:** o resto de `status_categorias` (cliente, setor, tecnico, e outros que ainda não foram auditados um a um) e o restante do projeto fora desse grupo.

- **2 achados de código morto ao longo do caminho, já decididos e fechados:** `UpdateInstituicaoUnidadeController.ts` e `CreateTipodeEquipamentoController.ts` — nenhum dos dois tinha rota nem chamada no Frontend. Perguntado diretamente, a decisão pros dois foi ligar a rota — o de InstituicaoUnidade ganhou schema + Repository novos e foi movido pra pasta certa; o de TipodeEquipamento só precisou da linha em `routes.ts`, já que usava o Service genérico de lookup. Ambos confirmados ao vivo (401 sem token, não 404).

### 2. RBAC (Role-Based Access Control)

**O que é:** controlar o que cada usuário pode *fazer* depois que o sistema já sabe *quem ele é*. São duas perguntas separadas — "quem é você" (autenticação) e "o que você pode fazer" (autorização) — e o erro comum é resolver só a primeira e achar que resolveu as duas.

**No Fire OS:** o `schema.prisma` já define um enum `Role { ADMIN TECNICO USER }` no model `User`, e existe um middleware pronto em `src/Middleware/can.ts` que recebe uma lista de roles permitidas e bloqueia quem não tem (`403`). `can()` já está ligado em `routes.ts` desde 17/08 nas rotas admin-only (`DELETE /deletecliente`, `GET /listusers`, etc.) — o gap que existia (nenhuma rota usar o middleware) já foi fechado.

### 3. CASL / Autorização por dono do recurso (ownership)

**O que é:** o degrau acima do RBAC puro. RBAC só olha a *role* — "é ADMIN, é TECNICO?" — mas não sabe se **esse recurso específico** pertence a quem está pedindo. CASL resolve isso com permissão condicional: "TECNICO pode editar OrdemdeServico, mas só a que tem `tecnico_id` igual ao dele".

**No Fire OS:** `src/permissions/ability.ts` define, por role, o que cada um pode fazer com cada recurso (`defineAbilityFor`), e `src/Middleware/authorizeOwnership.ts` (generalizado em 15/09 a partir do `authorizeOrdemdeServico.ts` original, que só cobria OrdemdeServico) busca o registro, monta a ability do usuário logado, e barra com `403` se a condição não bater. Hoje cobre 4 recursos: OrdemdeServico e os 3 módulos técnicos (assistência, laudo, documentação) — o achado real foi que um `TECNICO` conseguia editar o registro de **outro** técnico só sabendo o `id`, corrigido igual nos 4.

### 4. Validação de entrada (Zod)

**O que é:** garantir que o dado que chega de fora (`req.body`, query params, upload) tem o formato esperado *antes* dele entrar na regra de negócio — em vez de descobrir que estava errado quando o banco já quebrou ou o bcrypt já tentou rodar em cima de algo inválido.

**No Fire OS:** `CreateUserController.ts:6` fazia `const {name, email, password, ...} = req.body` direto, sem checar nada — esse era o exemplo clássico usado aqui há semanas. **Fechado em 15/09:** `user`, os 8 módulos de `controles_forms`, `Equipamento` + `InformacoesSetor`, as 13 tabelas de lookup de `status_categorias`, e `InstituicaoUnidade` já validam via Zod, junto com o piloto original de OrdemdeServico — 25 módulos no total. Os outros ~75 controllers ainda não passaram pelo rollout.

### 5. Tratamento de erros global (error-handling middleware)

**O que é:** em vez de cada controller ter seu próprio `try/catch` decidindo o status HTTP na mão, uma peça central captura qualquer erro que "sobe" sem ser tratado antes, e decide o formato da resposta baseada no *tipo* do erro — sem repetir a mesma lógica de decisão em cada arquivo.

**No Fire OS:** `src/Middleware/errorHandler.ts`, plugado uma vez em `server.ts`, distingue `ZodError`/`ValidationError` (422), `NotFoundError` (404), `ConflictError` (409), erros conhecidos do Prisma (`P2002` unique →409, `P2025` not found →404, `P2003` FK inválida →400) e qualquer outra coisa (500 genérico, sem vazar detalhe pro cliente). As classes de erro customizadas moram em `src/errors/AppError.ts`. Só os 2 controllers já refatorados (Create/Update de OrdemdeServico) não têm mais `try/catch` nenhum — o resto do projeto ainda captura erro na mão, mesmo a infraestrutura já estando pronta pra eles.

### 6. Fila / Mensageria (BullMQ + Redis)

**O que é:** em vez do código fazer um trabalho demorado (ex.: subir uma foto pro Cloudinary) *dentro* do request, ele só anota "isso precisa ser feito" numa fila e responde na hora — um processo separado (o **worker**) processa essa fila no próprio tempo dele, sem o usuário esperar.

**No Fire OS:** `fotoController.handle` enfileira (`uploadQueue.add("upload-foto-os", ...)`) e responde `202` em vez de subir a foto pro Cloudinary dentro do request; `uploadWorker.ts` (processo separado, `npm run worker`) processa cada job, com retry automático (3 tentativas, backoff exponencial) se o Cloudinary falhar. Ligado ao fluxo real em 14/09 — detalhe completo, em pedaços pequenos: `GUIA-FILA-BULLMQ.md`.

### 7. Cache (Redis, cache-aside)

**O que é:** guardar a resposta de um cálculo caro numa "gaveta rápida" (o Redis, que vive na RAM em vez do disco), pra não recalcular a mesma coisa toda vez que alguém pede — aceitando que a resposta pode ficar levemente desatualizada por um tempo (o **TTL**, time to live).

**No Fire OS:** `ListOrdemdeServicoService.getTotais()` guarda os 8 `count()` de status por 30s; `ListTecnicoService` guarda a lista de técnicos por 60s, com **invalidação ativa** no create/remove (apaga a chave na hora, em vez de esperar o TTL). Os dois têm fallback — se o Redis cair, a rota volta a calcular direto no banco, em vez de quebrar. Detalhe completo: `GUIA-CACHE-REDIS.md`.

### 8. Pirâmide de testes

**O que é:** a ideia de que você deve ter *muitos* testes unitários (rápidos, isolados, testam uma função sozinha), *alguns* testes de integração (testam a função conversando com peça real, tipo o banco), e *poucos* testes end-to-end (simulam o usuário real, do início ao fim). Mockar tudo demais te dá um teste que passa mesmo se a integração real estiver quebrada.

**No Fire OS:** `CreateUserService.test.ts` usa `vi.mock('../../prisma', ...)` — ele finge que o Prisma existe e sempre responde o que você mandou ele responder. Isso é um teste **unitário**: prova que a lógica de "se o email já existe, lança erro" está certa, mas não prova que a query realmente funciona contra um Postgres de verdade (ex.: se o campo `email` tem `@unique` no schema, isso só quebra de verdade contra o banco real). 79 testes unitários passam hoje — a camada de integração (subir o Postgres do `docker-compose.yml` de verdade) ainda não existe.

### 9. CI/CD (Integração e Entrega Contínua)

**O que é:** automatizar a verificação (CI) e a entrega (CD) do código a cada mudança, em vez de confiar que "testei na minha máquina antes de commitar".

**No Fire OS:** `.github/workflows/test.yml` roda `npm run test` automaticamente a cada push ou PR pra `main`. Isso é CI. Desde 14/09, `tsc --noEmit` e lint viraram steps separados, antes do teste (fail-fast) — relato completo em `GUIA-CI-LINT.md`. O que ainda falta: não existe um CD explícito no repo (o deploy provavelmente acontece direto pelo pipeline da Vercel, fora do GitHub Actions) — o `GUIA-CI-LINT.md` também compara isso com o CD planejado no `../projeto-encurtador/PROJETO-ENCURTADOR.md` (Serverless Framework).

### 10. Linter (ESLint)

**O que é:** uma ferramenta que *lê* o código sem rodar ele, e aponta padrão suspeito — uma variável criada e nunca usada, um `import` que sobrou de um código já apagado, um jeito de escrever que o time decidiu evitar. Não sabe se a lógica está certa (isso é trabalho do teste); só sabe se o código está "arrumado".

**No Fire OS:** `eslint.config.mjs`, instalado em 14/09 — a primeira rodada devolveu mais de 1400 "erros", mas quase todos eram o *client* do Prisma gerado dentro do repo (`@prisma/**`), não código do projeto; ignorando essa pasta sobraram 36 avisos reais (`no-unused-vars`), deixados como aviso e não erro de propósito, pra não travar o CI por dívida antiga que ainda não teve a vez de ser paga. Roda como step separado no CI, antes do teste. Detalhe completo, incluindo o "gotcha" do achado: `GUIA-CI-LINT.md`.

### 11. Docker

**O que é:** empacotar uma aplicação (ou banco) com tudo que ela precisa pra rodar, isolada da sua máquina. **Imagem** é a receita/blueprint (ex.: `postgres:15-alpine`); **container** é a instância rodando daquela receita (ex.: `fireos_postgres_container`).

**No Fire OS:** o `docker-compose.yml` sobe Postgres, Redis, a API (`Dockerfile` multi-stage) e o worker da fila, todos isolados — você não precisa ter nada disso instalado direto no Windows. Build real validado em 15/09 (`docker compose build fireos-api` completou sem erro).

### 12. System Design

**O que é:** raciocinar sobre a arquitetura de um sistema — como as peças se conectam, por que cada escolha foi feita, e o que quebraria primeiro se o uso crescesse. Não é sobre desenhar bonito, é sobre justificar trade-off de arquitetura.

**No Fire OS:** o `README.md` raiz já tem um diagrama mermaid mostrando as 3 camadas (Web dashboard Next.js, App mobile React Native, API Node.js) conversando por HTTPS/JSON com a API, que fala com Postgres e Cloudinary. Isso *é* um artefato de system design. O que falta é o próximo nível: conseguir responder "por que separar em 3 camadas em vez de o app mobile falar direto com o banco?" ou "o que quebra primeiro se 1000 técnicos usarem ao mesmo tempo?" (dica: provavelmente o `schema.prisma` monolítico e a ausência de índice em queries de listagem, antes de qualquer coisa relacionada a tráfego).

### O nome do que a gente fez com a assinatura/fotos: diagrama de sequência + rastreamento de fluxo

O item acima é a versão "arquitetura grande" de system design (as 3 camadas). Mas existe uma versão menor, que a gente aplicou de verdade quando fomos investigar o fluxo de assinatura/fotos no app mobile — e ela também é system design, só que em cima do código que já existe:

- **Diagrama de sequência (sequence diagram):** artefato formal de UML que mostra uma ação específica (ex.: "técnico conclui a OS") passando por vários componentes, **na ordem em que acontece no tempo** — quem chama quem, o que espera o quê. As linhas do tempo "ANTES/DEPOIS" que fizemos no item 1 (fila) são exatamente isso, só em texto em vez de setas e caixinhas.
- **Rastreamento de fluxo (code tracing):** o processo de seguir uma ação do usuário através de várias camadas/arquivos até o fim, lendo o código de verdade em vez de assumir — foi isso que a gente fez: botão "CONCLUIR OS" → `handleFinalizarEEnviar` → `uploadImages()` → `POST /foto` → `fotoController.handle` → Cloudinary → Prisma.

### A diferença entre um Junior e um Pleno fazendo essa mesma investigação

**Junior:** olha o nome de uma função (`enviarAssinatura`) ou o comentário de um componente, acha plausível que ela é chamada em algum lugar, e segue em frente escrevendo código ou documentação em cima dessa suposição — sem confirmar. O risco: a suposição vira "fato" na cabeça de todo mundo, e ninguém percebe que aquele pedaço nunca rodou de verdade.

**Pleno:** trata toda suposição como hipótese a verificar, não como fato — segue a cadeia de chamadas real (quem importa quem, quem chama quem) até confirmar ou refutar. Quando encontra uma inconsistência (uma função que existe mas nunca é chamada, por exemplo), **documenta separadamente** o que é comportamento confirmado do que é suspeita/gap, em vez de misturar os dois.

**Esse erro aconteceu de verdade nessa nossa sessão, comigo:** na primeira versão do item 1 (fila), eu descrevi o "cenário do PDF" apontando pro `UpdateOrdemdeServicoService.ts`, baseado num trecho de código que *parecia* plausível — tinha `cloudinary.uploader.upload` dentro de uma rota de update de OS, então assumi que era esse o caminho usado pelo app pra fechar uma OS. Só quando você pediu pra conferir com o `.tsx` real do app é que rastreei a cadeia completa (`index.tsx` → `SignatureModal` → `onSave`) e descobri que `enviarAssinatura()` **nunca é chamada** — o exemplo certo era outro (`fotoController.ts`), e a assinatura tinha um problema totalmente diferente do que eu tinha assumido. Ou seja: eu fiz o movimento de Junior primeiro (assumi porque parecia razoável), e só virou análise de Pleno depois que fui rastrear o fluxo real, arquivo por arquivo, em vez de confiar no que "fazia sentido".

- [ ] Da próxima vez que for descrever um fluxo (de qualquer parte do sistema, não só esse), rastrear a cadeia real de chamadas antes de escrever qualquer coisa — mesmo quando a explicação óbvia parecer certa.

---

## 1. Autorização (RBAC) — o item de maior alavancagem ✅ implementado em 17/08/2026

Isto é o achado mais valioso do projeto: você já escreveu a peça certa, ela só não está ligada.

- [x] Importar e aplicar `can([...roles])` (`src/Middleware/can.ts`) nas rotas de `routes.ts` — hoje ele existe, tem teste zero e **nenhuma rota o usa**. Resultado prático: qualquer usuário autenticado, seja `USER`, `TECNICO` ou `ADMIN`, acessa as mesmas +80 rotas.
- [x] Definir a matriz de permissão por recurso (ex.: só `ADMIN` remove cliente/instituição; só `ADMIN`/`TECNICO` fecha OS) antes de sair aplicando — isso é a parte de "system design" que pesa em entrevista de pleno, não o `if` em si.
- [x] Proteger `POST /users` (`routes.ts:127`) — hoje é uma rota pública, sem `isAuthenticated`. Qualquer pessoa na internet cria uma conta `USER` no seu banco de produção. Decida: deveria exigir `ADMIN`, ou existe um fluxo de auto-cadastro intencional? Documente a decisão.
- [x] Escrever testes para `can.ts` (autorizado passa, sem role bloqueia com 401, role errada bloqueia com 403) — é o middleware mais crítico do sistema e o único sem cobertura nenhuma.

**Estudar:** autenticação vs. autorização como conceitos separados; RBAC vs. ABAC; por que "funciona no meu teste manual" não prova que a permissão está aplicada.

**Por que os dois middlewares existem separados:**

- `isAuthenticated` responde *"essa pessoa está logada?"* — lê o token e injeta `req.user_id`/`req.user_role`. Sem ele numa rota, **qualquer pessoa sem login nenhum** chama a rota. É o que falta hoje em `POST /users` (`routes.ts:127`).
- `can([...roles])` responde uma pergunta diferente, que só faz sentido **depois** da primeira: *"está logada E tem a role certa pra isso?"* Sem ele (mesmo com `isAuthenticated` presente), **qualquer role logada** — inclusive um `USER` comum que se autocadastrou — chama `DELETE /deletecliente`, porque a rota só checou "está logado?", nunca "é admin?".

São dois filtros em sequência, cada um barrando um tipo de invasor diferente — tirar qualquer um dos dois abre uma porta diferente.

**Versão mais simples e mais pleno de aplicar isso:** hoje `isAuthenticated` é colado manualmente em cada uma das +80 linhas de `routes.ts` — frágil, fácil esquecer numa rota nova (foi o que aconteceu). A melhoria de nível pleno não é adicionar mais código, é **inverter a regra padrão**: em vez de "toda rota é pública, a não ser que eu lembre de proteger", vira "toda rota é privada por padrão, só as que eu listar explicitamente são públicas" (princípio de *fail-secure*).

```ts
// hoje: isAuthenticated repetido, fácil esquecer numa rota nova
router.post('/users', new CreateUserController().handle)              // esqueceram
router.get('/users/detail', isAuthenticated, ...)
router.delete('/deletecliente', isAuthenticated, ...)
```

```ts
// versão pleno: dois roteadores, autenticação aplicada UMA vez só
const publicRouter = Router();
const privateRouter = Router();

publicRouter.post('/login', new AuthUserController().handle);
// /users (cadastro) só fica aqui se for intencionalmente público — decisão do item acima

privateRouter.use(isAuthenticated); // roda pra TUDO abaixo, sem precisar repetir
privateRouter.get('/users/detail', new DetailUserController().handle);
privateRouter.delete('/deletecliente', can(['ADMIN']), new RemoveClienteController().handle);
// ...resto das rotas, sem repetir isAuthenticated em cada uma

app.use(publicRouter);
app.use(privateRouter);
```

Com isso, esquecer de proteger uma rota nova deixa de ser possível por padrão — ela só fica pública se for explicitamente colocada no `publicRouter`. `can()` continua só nas rotas que precisam de restrição além de "estar logado". Menos código repetido e mais seguro ao mesmo tempo.

**Próximo nível (depois do `can.ts` básico estar ligado):** `can([...roles])` é RBAC puro — só olha a role, não o dono do recurso. Ferramentas como `@casl/ability` resolvem um degrau acima: permissão **condicional**, tipo "MEMBER pode dar update em Project, mas só se `ownerId === user.id`". Isso não é teórico pro Fire OS — `ListOrdemdeServicoService.ts:46-59` já faz isso na mão, filtrando `tecnico_id: user.tecnico_id` quando a role é `TECNICO` pra ele só ver as próprias OS. Se essa regra de "só o dono" se repetir em mais services, vale centralizar com algo como CASL em vez de copiar o `if` toda vez.

- [x] Depois do RBAC básico funcionar, mapear onde mais no código existe uma regra de ownership escondida num `if` (grep por `tecnico_id`, `user_id` sendo comparado manualmente) — isso é o inventário antes de decidir se compensa migrar pra CASL.

**Revisão 14/09/2026 — esse checkbox estava marcado como feito, mas o mapeamento nunca tinha sido escrito. Achado: o mesmo bug de OrdemdeServico (item 5 abaixo) continua aberto em 3 módulos** (`UpdateAssistenciaTecnicaService.ts`, `UpdateControledeLaudoTecnicoService.ts`, `UpdateDocumentacaoTecnicaService.ts`) — qualquer `TECNICO` edita/apaga registro de outro técnico, só sabendo o `id`. Detalhe completo em `GUIA-RBAC-CASL.md`, seção "Revisão 14/09/2026".

- [x] Generalizar `authorizeOrdemdeServico` (ou criar 3 equivalentes) pros 3 módulos acima. **Feito em 15/09** — novo `authorizeOwnership.ts` genérico, aplicado nos 3 módulos. Detalhe completo em `GUIA-RBAC-CASL.md`.

### O que foi implementado (RBAC básico + CASL) — 17/08/2026

Relato completo — os dois roteadores, as 4 rotas públicas por acidente que fechei, o gap de CASL em `PATCH /ordemdeservico/update/:id`, os testes, a verificação manual e o molde de narrativa pronto — está em **`GUIA-RBAC-CASL.md`**, pra não deixar esse item aqui gigante. O achado mais forte pra entrevista (o gap de ownership em OrdemdeServico) está lá, seção "O gap real de CASL".

---

## 2. Validação de entrada (Zod)

O README já lista isso como pendência — confirmei que hoje nenhum controller valida `req.body`, é `const {x,y,z} = req.body` direto (ex. `CreateUserController.ts:6`).

- [x] Escolher 1 rota de escrita de risco maior e escrever schema Zod pra ela, como piloto do padrão antes de espalhar pelas +100 rotas restantes — ver abaixo.
- [x] Middleware central de erro que captura `ZodError` e devolve 422 com mensagem de campo — hoje um payload malformado estourava como 500 genérico.
- [ ] Espalhar o mesmo padrão (`schema` + `validate()`) pros outros módulos (`user`, `cliente`, `setor`, `equipamento`...), um de cada vez.
- [ ] Validar variáveis de ambiente no boot (`JWT_SECREATE`, `DATABASE_URL`, `CLOUDINARY_*`) com um schema Zod — o erro do Prisma que você teve hoje ("did not initialize") é sintoma da mesma classe de problema: falha de config descoberta em runtime, não no start.

**Estudar:** validação na borda do sistema (input do usuário) vs. dentro do domínio; parse-don't-validate.

### O que foi implementado (Zod + erro global + Repository) — 31/08/2026

Relato completo, em 3 passos — o piloto (Zod + middleware global de erro em Create de OrdemdeServico, incluindo o bug real de colisão de `numeroOS` que achei no caminho), o par Create+Update fechado (mais um bug de tratamento de erro silencioso corrigido), e o Repository pattern (o que é, por que existe, antes/depois de código e teste) — está em **`GUIA-ZOD-REPOSITORY.md`**, pra não deixar esse item aqui gigante.

- [x] Repository pattern implementado pra Create + Update de OrdemdeServico.
- [ ] Replicar pros outros módulos conforme o rollout de Zod for avançando (decidido: junto, não separado — cada módulo novo já nasce com Controller fino + Service + Repository).

---

## 3. Testes automatizados (Vitest)

Você já não está começando do zero — existem 4 arquivos de teste (`AuthUserService`, `CreateUserService`, `CreateOrdemdeServicoService`, `UpdateOrdemdeServicoService`) e um workflow de CI já roda `npm run test` a cada push. O ponto fraco é cobertura e profundidade, não a ferramenta.

- [ ] Cobrir `can.ts` e `isAuthenticated.ts` (middlewares nunca testados, ver item 1).
- [ ] Testar pelo menos 1 fluxo de erro real de negócio por módulo grande (`OrdemdeServico`, `controles_forms`) além de "criou com sucesso" — hoje os testes existentes são majoritariamente caminho feliz + validação simples.
- [x] Configurar `coverage` no `vitest.config.ts` com um piso mínimo e mostrar o número no README. **Feito em 15/09** — piso de 30-45% (o número real de hoje, não os 60% "aspiracionais" cogitados aqui antes de medir: boa parte dos controllers ainda não tem teste, então 60% travaria o CI por dívida antiga, não por regressão de verdade). Sobe conforme o rollout de Zod/Repository avança.
- [ ] Testes de integração tocando o Postgres real do Docker (não só mock do Prisma) para pelo menos o fluxo de autenticação — mocks provam que a função roda, não que o contrato com o banco está certo.

**Estudar:** pirâmide de testes (unitário vs. integração vs. e2e); por que mockar tudo dá falso verde.

---

## 4. CI/CD

- [x] `test.yml` hoje só roda `npm run test`. Adicionar `tsc --noEmit` (checagem de tipo) e lint como steps separados — pega erro de compilação antes do teste, e falha mais rápido/mais barato.
- [ ] Criar um segundo workflow para o `Frontend/` (hoje só o Backend tem CI).
- [ ] Ativar branch protection na `main` exigindo o workflow verde antes de merge — mesmo trabalhando sozinho, isso é um hábito que demonstra disciplina de squad.

**Estudar:** o que roda em cada estágio de um pipeline e por quê (lint/type-check → test → build → deploy), fail-fast.

### O que foi implementado (ESLint + fail-fast no CI) — 14/09/2026

Relato completo, em pedaços pequenos — o que é lint, por que 3 steps separados, o achado real (mais de 1400 "erros" que eram só o client do Prisma gerado dentro do repo), por que os avisos reais ficaram `warn` em vez de `error`, e a comparação com o CD planejado no Encurtador (Serverless Framework) — está em **`GUIA-CI-LINT.md`**, pra não deixar esse item aqui gigante.

---

## 5. Docker

Você já tinha o Postgres e o Redis isolados em container — faltava a metade que costuma pesar em entrevista: a própria API containerizada.

### O conceito: por que multi-stage build

Um `Dockerfile` de um stage só instalaria **tudo** (TypeScript, ts-node-dev, os tipos, o `vitest`) dentro da imagem final que vai rodar em produção — pesado, e com ferramentas que ninguém precisa depois que o código já foi compilado. **Multi-stage build** resolve isso com dois estágios dentro do mesmo arquivo: um estágio "build" (tem tudo, compila o TypeScript pra JavaScript) e um estágio "runtime" final (só copia o resultado — a pasta `dist/` — e instala só as dependências de produção). A imagem final não carrega nada do que só serviu pra construir; ela só tem o produto pronto. É a mesma ideia de separar "a obra" de "a casa acabada".

- [x] `Dockerfile` multi-stage para a API (`Backend/Dockerfile`): stage de build (`npm ci` + `prisma generate` + `tsc`) e stage de runtime enxuto (`npm ci --omit=dev` + `prisma generate` de novo, só que agora sem devDependencies + `COPY --from=build` do `dist/`).
- [x] `docker-compose.yml` expandido com o serviço `fireos-api`, com `depends_on` do banco e do Redis, e `DATABASE_URL`/`REDIS_URL` apontando pro nome do serviço (`fireos-db`, `fireos-redis`) em vez de `localhost` — dentro da rede do Compose, os containers se enxergam pelo nome do serviço, não por endereço de máquina.
- [x] `.dockerignore` criado — sem ele o build copiaria `node_modules`, `.env` e até os `.test.ts` pra dentro da imagem.
- [x] `docker-compose.yml` já estava versionado no git (checei de novo — a observação antiga de que estava "untracked" não procede mais).

**Honestidade sobre o teste:** escrevi e validei a sintaxe com `docker compose config` (rodou limpo), mas **não consegui buildar a imagem de verdade** neste ambiente — o Docker Desktop não estava com o daemon ativo aqui. Precisa rodar `docker compose up --build` na sua máquina pra confirmar que builda e sobe de ponta a ponta.

**Achado de segurança, não relacionado ao Docker em si:** rodando `docker compose config` pra validar a sintaxe, percebi que o `.env.local` **não estava no `.gitignore`** (só `.env` estava) — corrigido agora. Chequei `git log --all --full-history -- .env.local`: nunca foi commitado, então não há segredo vazado no histórico — só fechei a brecha antes que alguém rodasse `git add -A` sem reparar.

**Estudar:** diferença entre imagem e container, por que multi-stage build existe, volumes nomeados vs. bind mount, por que containers na mesma rede do Compose se enxergam pelo nome do serviço.

---

## 6. Polish que sinaliza atenção a detalhe

Pequeno, mas é o tipo de coisa que um revisor de código pleno nota:

- [x] `README.md` tinha duas seções "🏁 Contexto de Desenvolvimento" e duas "🔜 Próximos Passos" — **confirmado corrigido** (verificado em 14/09, só existe uma de cada agora).
- [ ] A env var `JWT_SECREATE` (típo de `JWT_SECRET`) está espalhada por `.env`, `AuthUserService.ts` e `isAuthenticated.ts` de forma consistente, então funciona — mas o README já documenta o nome correto `JWT_SECRET`, o que vai confundir quem seguir o "Como Rodar Localmente". Padronizar um nome só.
- [ ] Criar `Backend/.env.example` — o README manda `cp .env.example .env`, mas esse arquivo não existe no repo hoje.

---

## Como usar isso na entrevista

O checklist junto não é o que te vende — é a narrativa em cima dele. Para cada item que você aplicar, guarde: **o que estava errado, por que estava errado, e o trade-off da escolha que você fez** (ex.: "encontrei um middleware de RBAC escrito mas nunca ligado às rotas — decidi X para os recursos administrativos porque Y"). Isso é o que diferencia "sei usar Docker" de "sei por que essa arquitetura precisa de Docker", e é essa diferença que carrega os 10 meses até uma vaga pleno.

### O que é trade-off

Toda escolha técnica fecha uma porta pra abrir outra — não existe solução sem custo, só soluções com custos diferentes. Trade-off é nomear o custo que você aceitou, em troca do benefício que valia mais pra você naquele momento.

### O molde da narrativa

Depois de aplicar cada item do checklist, escreva 4 linhas logo abaixo dele, neste formato:

1. **O que encontrei** — o estado antes, sem julgamento.
2. **Por que isso é um problema de verdade** — o risco concreto, não "boas práticas mandam".
3. **As opções que considerei** — pelo menos duas, uma pode ser "não fazer nada".
4. **O que escolhi e o que aceitei perder** — o trade-off.

**Exemplo já escrito** (item 1, RBAC):

> Encontrei um middleware de RBAC já escrito mas nunca importado em `routes.ts` — todo usuário autenticado acessava as mesmas 80+ rotas. Problema real: um `TECNICO` podia deletar cliente ou instituição, ação que devia ser só de `ADMIN`. Considerei validar a role dentro de cada controller, mas isso duplicaria a lógica em dezenas de arquivos. Optei por aplicar `can()` na definição da rota — troquei "reescrever tudo" por "lembrar de colar o middleware toda vez que criar rota nova", e documentei isso pra não esquecer.

Preencha o mesmo molde pros outros itens conforme for aplicando — é isso que vira resposta pronta de entrevista.

---

## Minhas Dúvidas

Log de perguntas que vou fazendo enquanto aplico o roadmap — pra não perder o que já foi respondido.

### System design vale a pena pra um projeto pessoal, mesmo sem time e sem escala real?

Vale, e é uma das coisas de maior retorno pra entrevista de pleno. Ninguém espera que o Fire OS tenha o tráfego da Amazon — o que se avalia é se você consegue **explicar o porquê** das decisões de arquitetura que já existem (por que 3 camadas separadas: app mobile, painel web, API; por que Postgres e não outro banco; por que JWT em vez de sessão) e **imaginar** o que quebraria primeiro se o uso crescesse 10x (ex.: o `schema.prisma` tem mais de 500 linhas num arquivo só — isso vira gargalo de manutenção antes de virar gargalo de performance). Documentar isso não é fingir que o projeto é grande, é treinar o raciocínio que a entrevista de pleno cobra.

- [x] Desenhar um diagrama (pode ser o mermaid que já existe no `README.md` raiz, expandido) mostrando o fluxo de uma Ordem de Serviço ponta a ponta: app mobile → API → Postgres → Cloudinary. **Feito em 04/09** — ver `ARQUITETURA-ANTES-DEPOIS.md` (diagramas de visão geral, camadas internas antes/depois, e 2 sequence diagrams: request completo com RBAC/CASL/Zod, e o fluxo de cache).
- [x] Escrever 3 frases prontas sobre "o que eu mudaria se o Fire OS tivesse 1000 técnicos usando ao mesmo tempo" — isso é a pergunta clássica de system design em entrevista. **Feito em 04/09** — ver `ARQUITETURA-ANTES-DEPOIS.md`, seção 6 (Postgres como gargalo real, cache stampede no próprio cache-aside implementado, e upload síncrono de fotos).

### Os 6 termos do checklist que ainda sinto que preciso estudar a fundo

- [ ] **RBAC** — diferença entre autenticação (quem é você) e autorização (o que você pode fazer).
- [ ] **Validação de entrada (Zod)** — por que validar na borda do sistema; "parse, don't validate".
- [ ] **Pirâmide de testes** — unitário vs. integração vs. e2e, e por que mockar tudo dá falso verde.
- [ ] **CI/CD** — o que cada estágio de um pipeline faz e por que a ordem importa (lint/type-check → test → build → deploy).
- [ ] **Docker** — diferença entre imagem e container, por que multi-stage build existe.
- [ ] **System Design** — como documentar arquitetura e argumentar trade-offs de escala mesmo num projeto pequeno.

### Só com esse projeto eu consigo aprender tudo que preciso pra vaga pleno?

Não tudo — o Fire OS te dá base sólida pra maior parte do que uma entrevista pleno de vaga de CRUD/SaaS cobra (auth, RBAC, validação, testes, CI, Docker de um serviço só), porque é um problema real com dado real por trás. Mas é **um projeto, uma forma**: monólito, REST, um banco relacional só, sem fila, sem cache, sem outro serviço conversando com o seu. Coisas que ele estruturalmente não vai te ensinar, por mais que você aplique tudo do checklist:

- [ ] Arquiteturas com fila/mensageria (ex.: RabbitMQ, SQS) e por que usar processamento assíncrono.
- [ ] Cache (Redis) e quando ele resolve problema de performance que índice de banco não resolve.
- [ ] Escala horizontal de verdade — múltiplas instâncias da API, balanceamento de carga, banco com réplica.
- [ ] Revisão de código em equipe — o projeto é solo, então falta a fricção real de discordar de PR, resolver conflito de merge com outra pessoa, alinhar padrão de código em grupo.
- [ ] Algoritmos/estruturas de dados — se alguma vaga-alvo aplicar teste desse tipo, o Fire OS não cobre isso, é estudo à parte.

**Trade-off de continuar só nele:** ir fundo no Fire OS te dá uma narrativa forte e comprovada (uso real, 44 OS concluídas) — mais forte que "fiz 5 projetos rasos". Mas depois de aplicar os 6 itens do checklist, o retorno de continuar só ali cai; a partir daí vale complementar com leitura/curso de system design geral e, se possível, revisar código de outra pessoa (contribuir em algo aberto, ou pedir pra um colega revisar o seu) pra treinar o que o projeto solo não cobre.

---

## Os 5 termos que faltam, aplicados ao Fire OS

Mesmo formato que você já tinha estudado sozinho pra fila/mensageria (comparando Junior vs. Pleno) — só que aqui, em vez do exemplo genérico de "oficina", uso código que já existe de verdade no seu repositório.

### 1. Fila / Mensageria — no envio de assinatura e fotos do app mobile

**Correção:** o exemplo original apontava pro `UpdateOrdemdeServicoService.ts`, mas conferindo o app mobile (`FireOS-App/src/components/modalDetailOrder/index.tsx`) o fluxo real é outro. Segui o botão que o técnico realmente aperta pra fechar uma OS — ele faz **duas coisas antes de concluir**: coleta a assinatura do cliente e envia as fotos. Só que, seguindo o código com calma, essas duas coisas **não pesam igual**:

**(a) Assinatura — coletada na tela, mas (achado importante) nunca chega a ser enviada por esse componente.** O técnico desenha no `SignatureModal`, confirma, e o `onSave` desse modal faz só isto:

```ts
// index.tsx:774-777 (hoje)
onSave={(sig) => {
  setSignature(sig);       // só guarda no estado local, pra mostrar a prévia na tela
  setShowSignatureModal(false);
}}
```

Existe uma função `enviarAssinatura()` no mesmo arquivo (linha 191), que chamaria `PATCH /assinatura/:id`, mas **ela nunca é chamada em nenhum lugar** — não tem botão, nem `useEffect`, nada disparando ela. Ou seja: pelo que esse componente faz, a assinatura fica só visível na tela do técnico (prévia local), e não é persistida no backend a partir daqui. Isso é uma coisa a mais que vale confirmar com calma depois (bug real ou ela é salva por outro caminho que eu não vi) — mas não é o problema de fila, porque **sem chamada de rede não tem nada travando a tela**.

**Achado extra, ainda sobre a assinatura, caso ela seja disparada por outro lugar:** o `saveAssinatura.ts` no backend lê `req.body.assinaturaBase64`, mas a única chamada que existiria mandaria `{ assinatura: base64 }` (nome de campo diferente) — então mesmo se alguém ligar `enviarAssinatura()` um dia, ela cairia sempre em `if (!assinaturaBase64) return res.status(400)`.

**(b) Fotos — esse sim é o problema de fila real, confirmado.** O técnico tira foto ou seleciona várias da galeria (`takePhoto`/`pickImages`), elas ficam guardadas na tela, e só quando ele aperta "CONCLUIR OS" o app dispara `handleFinalizarEEnviar`, que chama `uploadImages()` — e essa função manda **uma foto de cada vez, em sequência**, esperando cada upload terminar antes de começar o próximo:

```ts
// index.tsx:287-308 (hoje, Junior)
for (let i = 0; i < selectedImages.length; i++) {
  // ...
  await api.post(`/foto`, formData, { timeout: 30000 });  // espera ESSA terminar
}                                                          // só aí começa a próxima
```

E no backend, `fotoController.handle` também sobe pro Cloudinary **dentro** do request, uma vez por foto:

```ts
// src/services/controles_forms/FotoOrdensTec/fotoController.ts:41-47 (hoje, Junior)
for (const file of files) {
  const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, { folder: "ordens_servico" });
  // ...só depois disso salva no banco e segue pro próximo arquivo
}
```

Isso é exatamente o cenário do seu PDF: o técnico em campo, com internet ruim, fica com o app travado esperando o Cloudinary responder — só que **se ele mandou 5 fotos, isso se repete 5 vezes seguidas**, uma esperando a outra terminar, antes de ver "Operação concluída". Pra ver exatamente o que isso significa, olha a linha do tempo completa do que o técnico faz — assinatura (local, rápida) e depois fotos (rede, lenta) — **antes e depois** da fila:

**ANTES (síncrono — o que o código faz hoje):**

```
0s      → técnico desenha a assinatura no SignatureModal e confirma
0s      → assinatura fica só na tela (estado local) — NENHUMA
          chamada de rede acontece aqui, então não trava nada
0s      → técnico já tirou/selecionou 3 fotos e aperta "CONCLUIR OS"
0s      → app começa o for de uploadImages(): manda a foto 1
0s–3s   → tela TRAVADA esperando o Cloudinary aceitar a foto 1
3s      → só então o app manda a foto 2 (o for só avança depois do await)
3s–6s   → tela TRAVADA esperando a foto 2
6s      → app manda a foto 3
6s–9s   → tela TRAVADA esperando a foto 3
9s      → SÓ ENTÃO roda handleCloseAndComplete() (troca o status — rápido)
9s      → SÓ ENTÃO o app mostra "Operação concluída"
```

Com internet de campo ruim, cada uma dessas esperas pode passar muito de 3s, ou falhar no meio — e se a foto 2 falhar, a 3 nem é enviada, e o técnico não sabe quais das 3 realmente foram salvas.

**DEPOIS (com fila — o que a versão Pleno faz):** a mesma ação, só invertendo quem espera o quê:

```
0s       → técnico aperta "CONCLUIR OS"
0s       → app manda as 3 fotos de uma vez
0–15ms   → backend só avisa a fila "tem 3 fotos pra subir" (rápido — é
           escrever um recado no Redis, não é o upload de verdade)
15ms     → backend responde 202 pro app — tela destrava quase na hora
(em paralelo, sem o técnico esperar mais nada)
           → o worker sobe as 3 fotos pro Cloudinary, uma de cada vez,
           no tempo dele, e vai salvando cada uma assim que termina
```

Se o Cloudinary falhar agora, a foto que falhou fica pendente pra tentar de novo — as outras já enviadas não se perdem, e o técnico não fica esperando nem sabe que algo deu errado no meio.

**Versão Pleno (o mesmo padrão que o Hone usa — lá quem implementou essa parte com BullMQ + Redis foi um colega de equipe, não você; essa é sua primeira vez mexendo nisso):** o `fotoController.handle` para de fazer upload ele mesmo, só enfileira um job por foto e responde na hora:

```ts
// fotoController.handle — versão Pleno
for (const file of files) {
  await filaDeMidia.add('upload-foto', {
    ordemdeServico_id,
    tempFilePath: file.tempFilePath,
  });
}

// Responde 202 assim que enfileirou TODAS — não espera nenhum upload
return res.status(202).json({ message: "Fotos recebidas, processando em segundo plano." });
```

O worker (processo separado) escuta a fila, e pra cada job sobe a foto pro Cloudinary com calma e só então cria o registro `FotoOrdemServico` no banco.

- [x] Prototipar isso com BullMQ + Redis local (primeira vez mexendo nisso de verdade — no Hone essa parte foi implementada por um colega de equipe, não por você) só nesse endpoint de upload, como prova de conceito — não precisa reescrever o projeto inteiro.

### O que foi implementado — protótipo isolado (18/08) e ligado ao fluxo real (14/09)

Relato completo — o que é Redis/BullMQ do zero, as peças do protótipo (`uploadQueue.ts`/`uploadWorker.ts`/`addSampleJob.ts`/Bull Board), o teste ao vivo, e depois a ligação real no `fotoController.ts` (incluindo os 2 bugs achados no caminho: containers com sistema de arquivo separado, e o painel web que quebraria com a resposta assíncrona nova) — está em **`GUIA-FILA-BULLMQ.md`**, pra não deixar esse item aqui gigante.

- [x] Prototipar com BullMQ + Redis local, isolado. **Feito em 18/08.**
- [x] Ligar de verdade no `fotoController.ts`. **Feito em 14/09** — `202` + retry automático (3 tentativas, backoff exponencial).
- [ ] Separado disso: decidir o que fazer com `saveAssinatura.ts`/`enviarAssinatura()` — hoje a assinatura desenhada não chega a ser salva por esse fluxo (nem entraria na fila, porque nem a chamada existe ainda). Vale essa investigação antes de pensar em fila pra ela.
- [ ] Paralelizar `uploadImages()` no app mobile — hoje ainda manda uma foto de cada vez; só assim o ganho de performance da fila aparece de ponta a ponta.

### 2. Cache — no `ListOrdemdeServicoService.ts` e `ListTecnicoController.ts`

**O problema:** `ListOrdemdeServicoService.ts:189-207` faz **9 idas ao banco em paralelo** toda vez que a tela de OS carrega — 1 `findMany` + 8 `count()` (total, abertas, em andamento, pausadas, concluídas, etc.). Isso roda de novo a cada F5, mesmo que nenhuma OS tenha mudado de status nos últimos segundos. O mesmo vale pra `ListTecnicoController.ts` — a lista de técnicos muda raramente (você não cadastra um técnico novo toda hora), mas é buscada do zero em toda chamada.

```ts
// hoje (Junior): sempre bate no banco, 9 queries, mesmo se nada mudou
const [total, totalAberta, totalEmDeslocamento, ...] = await Promise.all([
  prismaClient.ordemdeServico.count({ where: whereCondition }),
  prismaClient.ordemdeServico.count({ where: { ...whereCondition, statusOrdemdeServico: { name: "ABERTA" } } }),
  // ...mais 6 counts iguais
]);
```

A regra de quando cachear: dado que é lido **muito mais** do que é escrito (lista de técnicos, contagem de status) é candidato. Dado que muda a cada request (o resultado de um cálculo com input do usuário mudando toda hora) não é.

### O conceito, explicado sem pressa: o que É cache

Cache não é mágica — é só "guardar a resposta pronta". Na primeira vez que alguém pede os totais de OS, você faz a pergunta cara pro banco (os 8 `count()`), guarda a resposta numa **gaveta rápida** (o Redis — um banco que vive na RAM, não no disco, por isso é absurdamente mais rápido que o Postgres), e nas próximas vezes você olha a gaveta primeiro. Só volta a perguntar pro banco quando a gaveta expira.

Esse padrão específico — "o código olha a gaveta, se não tiver ele calcula e guarda" — se chama **cache-aside**: quem gerencia o cache é o próprio código da aplicação, do lado de fora do banco, não algo escondido dentro dele.

**A decisão que separa júnior de pleno aqui não é "como usar Redis" — é "quanto tempo o dado pode ficar velho" (TTL, *time to live*).** Usei 30 segundos. Por quê 30s e não 5 minutos, nem 0? Porque um contador de "quantas OS estão abertas" tolera estar levemente desatualizado — ninguém percebe se o número demorar 20s pra refletir uma mudança de status. **Isso não valeria pra saldo de conta bancária** — ali você não pode servir um número "quase certo". Escolher o TTL é sempre essa pergunta: o que quebra se esse dado estiver errado por N segundos?

### O que foi implementado — 31/08 (OrdemdeServico) e 04/09 (Técnico + o porquê do GROUP BY)

Relato completo — o cache-aside no `getTotais()`, o `try/catch`/fallback pro Redis cair, os testes, a segunda aplicação em `ListTecnicoService` (com invalidação ativa, um conceito a mais que o primeiro caso não precisava), e a resposta madura pro "por que não colapsar os 8 `count()` numa query só" (cache e agregação condicional resolvem problemas diferentes) — está em **`GUIA-CACHE-REDIS.md`**, com comparativo lado a lado e glossário.

- [x] Cache-aside com Redis implementado no `ListOrdemdeServicoService.ts` (totais de status).
- [x] Replicado em `ListTecnicoService.ts`, com TTL maior + invalidação ativa.

### 3. Escala horizontal — por que o JWT do Fire OS já ajuda, mas o Postgres vira o gargalo

**O que já está a seu favor:** `AuthUserService.ts` usa JWT — o token carrega tudo que a API precisa saber sobre o usuário (`role`, `tecnico_id`), sem guardar sessão em memória no servidor. Isso significa que hoje, se você subisse uma segunda instância da API, o login continuaria funcionando sem nenhuma mudança — é o que se chama de API **stateless**, e é pré-requisito pra escalar horizontalmente (se a sessão ficasse em memória, o usuário precisaria sempre cair na mesma instância).

**O que quebraria primeiro:** o Postgres do `docker-compose.yml`. Cada instância da API abre seu próprio pool de conexões via Prisma. Rodar 5 instâncias significa 5 pools batendo no mesmo banco — e o Postgres tem um teto de conexões simultâneas (`max_connections`, geralmente 100 por padrão). É pra isso que existe o PgBouncer: um pool compartilhado entre as instâncias, em vez de cada uma abrir o seu.

- [ ] Saber explicar a diferença entre escala **vertical** (máquina maior) e **horizontal** (mais máquinas) e por que auth stateless é pré-requisito pra segunda.

### 4. Revisão de código em equipe — simulando em cima do seu próprio `can.ts`

Projeto solo não treina a parte de **receber** um comentário de PR e responder com argumento, não só aceitar calado. Exemplo de como um revisor sênior comentaria o achado do `can.ts`:

> **Comentário de PR (bloqueante):** "Vi que `can()` existe em `Middleware/can.ts` mas não tá sendo usado em nenhuma rota de `routes.ts`. Isso significa que `TECNICO` consegue chamar rota de deletar cliente hoje? Se sim, isso precisa entrar nesse PR antes de mergear, não pode ir pra depois."
>
> **Sua resposta esperada, não é só "ok, corrijo":** "Confirmado, reproduzi localmente. Vou aplicar `can(['ADMIN'])` nas rotas de delete de `Cliente`/`InstituicaoUnidade` nesse mesmo PR. Deixei de fora as rotas de listagem (`GET`) porque acho que todo usuário autenticado pode ler — quer que eu documente essa decisão no PR?"

O que diferencia pleno aqui não é "aceitar todo comentário", é **justificar a decisão com trade-off**, igual você já treinou na seção "Como usar isso na entrevista" acima.

- [ ] Pedir pra alguém (colega, comunidade, ou até revisar o PR de um projeto open source pequeno) revisar um PR seu de verdade, pra sentir a fricção de discordar/justificar.

### 5. Algoritmos / Estruturas de dados — os 8 `count()` do item 2 são o exemplo perfeito

Você não precisa de LeetCode pra treinar isso — tem um caso real ali no `ListOrdemdeServicoService.ts`. Os 8 `count()` em paralelo fazem **8 idas e voltas ao banco** pra contar quantas OS existem por status. Isso é o equivalente relacional de escanear uma lista 8 vezes (uma por status) em vez de passar por ela **uma vez só** contando tudo com um `Map`/hashtable — o tipo de raciocínio de Big-O que pesa em entrevista pleno, só que aplicado a query, não a array em memória.

```ts
// hoje: 8 queries (8 "passadas" pelo banco)
prismaClient.ordemdeServico.count({ where: { ...whereCondition, statusOrdemdeServico: { name: "ABERTA" } } })
// ...repete pra cada status

// versão Pleno: 1 query, agrupando (equivalente a 1 passada com Map contando por chave)
const grupos = await prismaClient.ordemdeServico.groupBy({
  by: ['statusOrdemdeServico_id'],
  where: whereCondition,
  _count: true,
});
```

- [ ] Reescrever essa parte do `ListOrdemdeServicoService.ts` usando `groupBy` e comparar o tempo de resposta antes/depois — isso vira um número real pra colocar na narrativa de entrevista ("troquei 8 queries por 1 e o endpoint ficou X% mais rápido").
