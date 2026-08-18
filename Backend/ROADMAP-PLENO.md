# Rumo ao Pleno

Checklist construído em cima do código real do **Fire OS** (não do roadmap genérico de curso) — cada item abaixo veio de algo que encontrei lendo `Backend/src`. Uso: marque conforme for aplicando, e guarde o "por quê" de cada um — é isso que você vai defender na entrevista.

## A resposta direta

Dá para chegar em 10 meses de experiência com um projeto de nível pleno — o que está aqui embaixo é factível em 3 meses se for feito com profundidade, não como checklist de curso. O que **não** muda em 3 meses é o filtro de "X anos de experiência" que boa parte das vagas pleno usa no ATS antes de um humano ler o currículo. Isso significa: mire empresas que testam habilidade (teste técnico, live coding, indicação) em vez de confiar só na palavra "pleno" no anúncio, e use o Fire OS — com uso real validado em campo — como a peça que compensa o tempo de casa curto.

---

## Glossário — os 6 termos, com exemplo prático do próprio Fire OS

Antes de aplicar cada item do checklist, entenda o conceito por trás. Cada termo abaixo tem: a definição simples + onde ele aparece (ou deveria aparecer) no seu código.

### 1. RBAC (Role-Based Access Control)

**O que é:** controlar o que cada usuário pode *fazer* depois que o sistema já sabe *quem ele é*. São duas perguntas separadas — "quem é você" (autenticação) e "o que você pode fazer" (autorização) — e o erro comum é resolver só a primeira e achar que resolveu as duas.

**No Fire OS:** o `schema.prisma` já define um enum `Role { ADMIN TECNICO USER }` no model `User`, e existe um middleware pronto em `src/Middleware/can.ts` que recebe uma lista de roles permitidas e bloqueia quem não tem (`403`). O problema: `isAuthenticated.ts` só confirma *quem* é o usuário (token válido) e injeta a role na request — ele nunca decide se essa role pode acessar a rota. E `can()` nunca é importado em `routes.ts`. Resultado: hoje um `TECNICO` autenticado consegue chamar a mesma rota de deletar cliente que só `ADMIN` deveria acessar.

### 2. Validação de entrada (Zod)

**O que é:** garantir que o dado que chega de fora (`req.body`, query params, upload) tem o formato esperado *antes* dele entrar na regra de negócio — em vez de descobrir que estava errado quando o banco já quebrou ou o bcrypt já tentou rodar em cima de algo inválido.

**No Fire OS:** `CreateUserController.ts:6` faz `const {name, email, password, ...} = req.body` direto, sem checar nada. Se alguém mandar um POST sem `password`, o `bcrypt.hash(undefined, 8)` roda mesmo assim e o erro que volta pro cliente é um 500 genérico do Node, não um "senha é obrigatória" claro. Um schema Zod na entrada dessa rota resolveria isso com uma mensagem de erro útil e um 400, antes de qualquer lógica rodar.

### 3. Pirâmide de testes

**O que é:** a ideia de que você deve ter *muitos* testes unitários (rápidos, isolados, testam uma função sozinha), *alguns* testes de integração (testam a função conversando com peça real, tipo o banco), e *poucos* testes end-to-end (simulam o usuário real, do início ao fim). Mockar tudo demais te dá um teste que passa mesmo se a integração real estiver quebrada.

**No Fire OS:** `CreateUserService.test.ts` usa `vi.mock('../../prisma', ...)` — ele finge que o Prisma existe e sempre responde o que você mandou ele responder. Isso é um teste **unitário**: prova que a lógica de "se o email já existe, lança erro" está certa, mas não prova que a query realmente funciona contra um Postgres de verdade (ex.: se o campo `email` tem `@unique` no schema, isso só quebra de verdade contra o banco real). Falta a camada de integração — um teste que sobe o Postgres do `docker-compose.yml` e testa contra ele.

### 4. CI/CD (Integração e Entrega Contínua)

**O que é:** automatizar a verificação (CI) e a entrega (CD) do código a cada mudança, em vez de confiar que "testei na minha máquina antes de commitar".

**No Fire OS:** você já tem `.github/workflows/test.yml` — ele roda `npm run test` automaticamente a cada push ou PR pra `main`. Isso é CI. O que falta: checagem de tipo (`tsc --noEmit`) e lint como steps *separados* do teste (hoje, se o TypeScript tiver um erro de tipo mas o teste passar mockado, o CI fica verde do mesmo jeito) — e não existe um CD explícito no repo (o deploy provavelmente acontece direto pelo pipeline da Vercel, fora do GitHub Actions).

### 5. Docker

**O que é:** empacotar uma aplicação (ou banco) com tudo que ela precisa pra rodar, isolada da sua máquina. **Imagem** é a receita/blueprint (ex.: `postgres:15-alpine`); **container** é a instância rodando daquela receita (ex.: `fireos_postgres_container`).

**No Fire OS:** o `docker-compose.yml` já sobe o Postgres isolado — você não precisa ter Postgres instalado direto no Windows, só o container. Falta a outra metade: um `Dockerfile` pra própria API (`Backend/`), pra que ela também rode em container, igual em qualquer máquina — hoje só o banco está dockerizado, a API roda direto no seu Node local via `ts-node-dev`.

### 6. System Design

**O que é:** raciocinar sobre a arquitetura de um sistema — como as peças se conectam, por que cada escolha foi feita, e o que quebraria primeiro se o uso crescesse. Não é sobre desenhar bonito, é sobre justificar trade-off de arquitetura.

**No Fire OS:** o `README.md` raiz já tem um diagrama mermaid mostrando as 3 camadas (Web dashboard Next.js, App mobile React Native, API Node.js) conversando por HTTPS/JSON com a API, que fala com Postgres e Cloudinary. Isso *é* um artefato de system design. O que falta é o próximo nível: conseguir responder "por que separar em 3 camadas em vez de o app mobile falar direto com o banco?" ou "o que quebra primeiro se 1000 técnicos usarem ao mesmo tempo?" (dica: provavelmente o `schema.prisma` monolítico e a ausência de índice em queries de listagem, antes de qualquer coisa relacionada a tráfego).

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

### O que foi implementado (RBAC básico + CASL) — 17/08/2026

**1. `routes.ts` virou `publicRouter` + `privateRouter`**, exatamente como no exemplo de código acima. `privateRouter.use(isAuthenticated)` roda uma vez só; nenhuma rota nova precisa mais lembrar de colar `isAuthenticated` na mão.

Fiquei público só o que é comprovadamente usado por página sem login — conferi no Frontend antes de decidir, não chutei:

- `POST /users` e `POST /session` — cadastro e login.
- `GET /listcliente`, `/listsetores`, `/listinstuicao` — usados pelas páginas `signup_instituicao` e `signup_empresa` (confirmei lendo o código dessas páginas: elas chamam essas rotas **sem** header de `Authorization`).
- `GET /listtipodeinstituicaounidade`, `/listtipodechamado`, `/listtipodeordemdeservico` — listas de categoria sem PII, sem mutação.

**2. Achei 4 rotas públicas por acidente, não por design, e fechei todas:**

| Rota | Por que era um problema | Confirmação de que fechar não quebra nada |
|---|---|---|
| `GET /listusers` | Vazava nome + e-mail + role + instituição de **todo mundo** cadastrado, sem login | `Frontend/dashboard/usuarios/page.tsx` já manda token — só o backend não exigia |
| `POST /foto`, `GET /foto/:id`, `DELETE /foto/:id` | Qualquer um subia/apagava foto de qualquer OS, sem login | `ViewCardFoto.tsx` já manda `Authorization: Bearer` em todas as chamadas |
| `POST /categorycliente`, `POST /categoryintituicao` | Qualquer um criava Cliente/Instituição no banco, sem login | `formularioClientesPrivados/page.tsx` e `formularioClientesMunicipais/page.tsx` já mandam token |
| `POST /ai/chat` | Chamada de IA (Groq) sem login — alguém podia gerar custo sem estar autenticado | Rota interna, sem uso público conhecido |

**3. `POST /users` ficou público de propósito** — não é mais uma dúvida em aberto. Confirmei lendo `signup_instituicao/page.tsx` e `signup_empresa/page.tsx`: existe um fluxo real de autocadastro (uma instituição ou empresa se cadastra sozinha). Isso resolve o "decida" que tinha ficado pendente aqui.

**4. `can(['ADMIN'])` aplicado nas ações que são inequivocamente admin-only:** `DELETE /deletecliente`, `/deletesetor`, `/deleteinstituicao`, `/removertecnico/:id`, e `GET /listusers`. **Não apliquei** `can()` nos outros deletes (`controledeassistenciatecnica`, `controledelaboratorio`, etc.) — não tenho contexto de negócio suficiente pra saber se um `TECNICO` pode ou não apagar esses registros, e prefiro te perguntar do que inventar uma regra. Fica como decisão em aberto.

**5. O gap real de CASL: `PATCH /ordemdeservico/update/:id` não checava dono nenhum.** Antes desta mudança, um `TECNICO` autenticado conseguia editar a OS de **qualquer outro técnico**, só sabendo o ID — a única filtragem por `tecnico_id` que existia era em `ListOrdemdeServicoService.ts` (a listagem), não no update. Criei:

- `src/permissions/ability.ts` — define, por role, o que cada um pode fazer com uma `OrdemdeServico`:

```ts
export function defineAbilityFor(user: UserForAbility): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (user.role === "ADMIN") {
    can("manage", "all");             // admin pode tudo
    return build();
  }

  if (user.role === "TECNICO") {
    can("read", "OrdemdeServico");                                              // lê qualquer uma
    can("update", "OrdemdeServico", { tecnico_id: user.tecnico_id ?? "__sem_tecnico__" }); // só edita a própria
    return build();
  }

  can("read", "OrdemdeServico");      // USER só lê
  return build();
}
```

- `src/Middleware/authorizeOrdemdeServico.ts` — busca a OS no banco, monta a ability do usuário logado e barra com `403` se a condição não bater. Aplicado em `GET /ordemdeservico/:id` e `PATCH /ordemdeservico/update/:id`.

**Antes:** `TECNICO` A editava a OS do `TECNICO` B sem erro nenhum.
**Depois:** mesma tentativa retorna `403 { error: "Você não tem permissão para acessar esta ordem de serviço." }`. `ADMIN` continua podendo editar qualquer uma.

**6. Testes novos (rodei `npm run test`, os 33 passaram):**
- `src/Middleware/can.test.ts` (4 testes)
- `src/permissions/ability.test.ts` (5 testes — cobre ADMIN/TECNICO dono/TECNICO não-dono/USER)
- `src/Middleware/authorizeOrdemdeServico.test.ts` (4 testes, mockando o Prisma igual aos testes que já existiam no projeto)

**7. Verificação manual:** subi o servidor local e testei com `curl` — `GET /listusers` sem token voltou `401` (antes seria `200` com todos os usuários); `GET /listcliente` sem token chegou até o controller normalmente (só falhou depois por causa do Postgres do Docker estar parado nesta sessão, não por causa de autenticação — comportamento esperado de rota pública).

**Preenchendo o molde da narrativa (item 5, o mais forte pra entrevista):**

> Encontrei que `PATCH /ordemdeservico/update/:id` não validava quem era o dono da ordem de serviço — só validava que o usuário estava logado. Problema real: um técnico mal-intencionado (ou só um bug no app mobile) podia alterar diagnóstico, solução ou status de uma OS atribuída a outro técnico, só sabendo o ID. Considerei validar isso com um `if (ordem.tecnico_id !== req.user_tecnico_id)` direto no service, mas essa mesma regra também faltava no endpoint de detalhe (`GET /ordemdeservico/:id`) — duplicar o `if` em dois lugares (e futuramente mais) ia divergir com o tempo. Optei por centralizar com CASL num middleware reutilizável (`authorizeOrdemdeServico`), aplicado nos dois endpoints. Troquei "duas verificações manuais que podem divergir" por "uma peça central que preciso lembrar de aplicar em rotas novas de OS" — trade-off aceitável, e documentado aqui pra não esquecer.

---

## 2. Validação de entrada (Zod)

O README já lista isso como pendência — confirmei que hoje nenhum controller valida `req.body`, é `const {x,y,z} = req.body` direto (ex. `CreateUserController.ts:6`).

- [ ] Escolher 3 rotas de escrita de risco maior (`/users`, criação de OS, upload) e escrever schema Zod para cada uma antes de espalhar para as +80 rotas.
- [ ] Middleware central de erro que captura `ZodError` e devolve 400 com mensagem de campo — hoje um payload malformado provavelmente estoura como 500 genérico.
- [ ] Validar variáveis de ambiente no boot (`JWT_SECREATE`, `DATABASE_URL`, `CLOUDINARY_*`) com um schema Zod — o erro do Prisma que você teve hoje ("did not initialize") é sintoma da mesma classe de problema: falha de config descoberta em runtime, não no start.

**Estudar:** validação na borda do sistema (input do usuário) vs. dentro do domínio; parse-don't-validate.

---

## 3. Testes automatizados (Vitest)

Você já não está começando do zero — existem 4 arquivos de teste (`AuthUserService`, `CreateUserService`, `CreateOrdemdeServicoService`, `UpdateOrdemdeServicoService`) e um workflow de CI já roda `npm run test` a cada push. O ponto fraco é cobertura e profundidade, não a ferramenta.

- [ ] Cobrir `can.ts` e `isAuthenticated.ts` (middlewares nunca testados, ver item 1).
- [ ] Testar pelo menos 1 fluxo de erro real de negócio por módulo grande (`OrdemdeServico`, `controles_forms`) além de "criou com sucesso" — hoje os testes existentes são majoritariamente caminho feliz + validação simples.
- [ ] Configurar `coverage` no `vitest.config.ts` com um piso mínimo (ex. 60% para começar) e mostrar o número no README — "tenho testes" convence menos que "78% de cobertura no módulo de auth".
- [ ] Testes de integração tocando o Postgres real do Docker (não só mock do Prisma) para pelo menos o fluxo de autenticação — mocks provam que a função roda, não que o contrato com o banco está certo.

**Estudar:** pirâmide de testes (unitário vs. integração vs. e2e); por que mockar tudo dá falso verde.

---

## 4. CI/CD

- [ ] `test.yml` hoje só roda `npm run test`. Adicionar `tsc --noEmit` (checagem de tipo) e lint como steps separados — pega erro de compilação antes do teste, e falha mais rápido/mais barato.
- [ ] Criar um segundo workflow para o `Frontend/` (hoje só o Backend tem CI).
- [ ] Ativar branch protection na `main` exigindo o workflow verde antes de merge — mesmo trabalhando sozinho, isso é um hábito que demonstra disciplina de squad.

**Estudar:** o que roda em cada estágio de um pipeline e por quê (lint/type-check → test → build → deploy), fail-fast.

---

## 5. Docker

Você já tem o Postgres isolado em container — falta a metade que costuma pesar em entrevista: a própria API containerizada.

- [ ] Dockerfile multi-stage para a API (`Backend/`): stage de build (`npm ci` + `tsc`) e stage de runtime enxuto copiando só o `dist/` + `node_modules` de produção.
- [ ] Expandir `docker-compose.yml` para subir `api` + `db` juntos, com `depends_on` e um healthcheck no Postgres antes da API subir.
- [ ] `.dockerignore` (falta hoje) — sem ele o build copia `node_modules` e `.env` para dentro da imagem.
- [ ] Versionar o `docker-compose.yml` — hoje ele está **untracked** no git (rodei `git status` e confirmei). Sem isso, "dockerizei o projeto" não aparece pra ninguém que clonar o repo.

**Estudar:** diferença entre imagem e container, por que multi-stage build existe, volumes nomeados vs. bind mount.

---

## 6. Polish que sinaliza atenção a detalhe

Pequeno, mas é o tipo de coisa que um revisor de código pleno nota:

- [ ] `README.md` tem duas seções "🏁 Contexto de Desenvolvimento" (linhas 243 e 252) e duas "🔜 Próximos Passos" (linhas 262 e 272) — provavelmente sobrou de uma edição. Consolidar em uma versão só.
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

- [ ] Desenhar um diagrama (pode ser o mermaid que já existe no `README.md` raiz, expandido) mostrando o fluxo de uma Ordem de Serviço ponta a ponta: app mobile → API → Postgres → Cloudinary.
- [ ] Escrever 3 frases prontas sobre "o que eu mudaria se o Fire OS tivesse 1000 técnicos usando ao mesmo tempo" — isso é a pergunta clássica de system design em entrevista.

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

### 1. Fila / Mensageria — no `UpdateOrdemdeServicoService.ts`

**O problema já existe no seu código, não é hipotético.** Quando o técnico fecha uma OS e envia a assinatura digital ou uma foto, o backend sobe o arquivo pro Cloudinary **dentro do mesmo request/response**, antes de responder pro app:

```ts
// src/services/controles_forms/OrdemdeServico/UpdateOrdemdeServicoService.ts:49-61 (hoje, Junior)
if ((req.files as any)?.file) {
  const file = (req.files as any).file as UploadedFile;
  const result = await cloudinary.uploader.upload(file.tempFilePath, { folder: "ordens" });
  bannerassinaturaUrl = result.secure_url;
}
// ...só depois disso o Prisma salva no banco, e só depois disso o res.json() responde
```

Isso é exatamente o cenário do seu PDF: o técnico em campo, com internet ruim, fica com o app travado esperando o Cloudinary responder antes de ver "OS atualizada". Se o Cloudinary demorar ou falhar, a OS pode nem ter sido salva ainda.

**Versão Pleno (o mesmo padrão que o Hone usa — lá quem implementou essa parte com BullMQ + Redis foi um colega de equipe, não você; essa é sua primeira vez mexendo nisso):** salvar o registro rápido, devolver `202` pro app, e subir a imagem em background.

```ts
// 1. Salva a OS sem a mídia, marca como "processando_midia"
const ordem = await prismaClient.ordemdeServico.update({ where: { id }, data: updateData });

// 2. Enfileira o upload (BullMQ — o mesmo tipo de fila que o Hone usa)
await filaDeMidia.add('upload-assinatura', { ordemId: id, tempFilePath: file.tempFilePath });

// 3. Responde na hora — o app não fica esperando o Cloudinary
return res.status(202).json({ message: "OS atualizada, mídia sendo processada.", ordem });
```

O worker (processo separado) escuta a fila, sobe pro Cloudinary com calma e atualiza o campo `bannerassinatura` depois.

- [x] Prototipar isso com BullMQ + Redis local (primeira vez mexendo nisso de verdade — no Hone essa parte foi implementada por um colega de equipe, não por você) só nesse endpoint de upload, como prova de conceito — não precisa reescrever o projeto inteiro.

### Redis e BullMQ, do zero — o que cada um é

Antes do "como implementei", o "o que é cada peça", sem assumir que você já viu isso:

- **Redis** é um banco de dados que guarda tudo em memória (RAM), não em disco — por isso é absurdamente rápido, e é usado como estrutura de dados compartilhada entre processos diferentes (a API e o worker, por exemplo). Sozinho, ele não sabe nada sobre "fila" ou "job" — é só uma peça de armazenamento genérica, tipo um dicionário gigante chave-valor.
- **BullMQ** é uma biblioteca Node.js que usa o Redis por baixo dos panos pra implementar o conceito de **fila de jobs**: adicionar um "recado" (job) numa lista, e ter um ou mais "trabalhadores" (workers) tirando recados dessa lista e processando, um de cada vez (ou em paralelo, se configurado). O BullMQ é quem entende "job", "fila", "worker" — o Redis só guarda os dados que o BullMQ manda guardar.
- Por isso os dois sempre aparecem juntos: **Redis é o armazenamento, BullMQ é a lógica de fila em cima dele.** Sem Redis rodando, o BullMQ não tem onde guardar nada — foi por isso que a primeira coisa que fizemos foi subir o container do Redis antes de qualquer código de fila funcionar.

### O que foi implementado (protótipo isolado) — 18/08/2026

Pedi pra manter bem simples, então **isso ainda não está ligado ao `UpdateOrdemdeServicoService.ts` real** — é o mecanismo de fila isolado, testado sozinho, pra entender o processo antes de mexer no fluxo de produção. A ligação com a rota de verdade é o próximo passo, quando fizer sentido.

**Peças novas, todas em `src/queue/`:**

**1. `docker-compose.yml`** ganhou um segundo serviço, o Redis (a fila BullMQ precisa de um lugar pra guardar os jobs — é isso que o Redis faz aqui):

```yaml
fireos-redis:
  image: redis:7-alpine
  container_name: fireos_redis_container
  ports:
    - "6379:6379"
```

**2. `src/queue/uploadQueue.ts` — o lado de quem PEDE o trabalho** (o "produtor"). Só declara a fila e sabe adicionar recados nela — não sabe nem se importa quem vai processar:

```ts
import { Queue } from "bullmq";

export const uploadQueue = new Queue("upload-imagem", {
  connection: { url: process.env.REDIS_URL },
});
```

**3. `src/queue/uploadWorker.ts` — o lado de quem FAZ o trabalho** (o "consumidor"). Roda como processo **separado** da API (`npm run worker`), fica escutando a fila e processa um job de cada vez, no tempo dele — sem travar nenhuma requisição HTTP:

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

**4. `src/queue/addSampleJob.ts` — simula o que a rota da API faria**: adiciona um job na fila e "responde" na hora, sem esperar o upload terminar.

**Como rodar você mesmo:**

```bash
docker compose up -d fireos-redis    # sobe o Redis
npm run worker                        # terminal 1 — deixa rodando, escutando a fila
npm run queue:demo -- caminho/da/foto.png   # terminal 2 — dispara um job de verdade
```

**Testei ao vivo antes de te entregar** (não é só "deveria funcionar"). Rodei o worker, mandei um job com uma imagem de teste, e o log mostrou o fluxo completo acontecendo:

```
Job 1 adicionado na fila.
Numa API de verdade, a resposta HTTP (202) já teria voltado pro cliente agora.
[worker] peguei o job 1, subindo test-pixel.png pro Cloudinary...
[worker] pronto! URL: https://res.cloudinary.com/dqq5gse9f/image/upload/.../hnyp8ailbimjtvocwzdn.png
[worker] job 1 concluído.
```

E confirmei com `curl` que a URL retornada é real — `HTTP 200`, a imagem realmente está hospedada no Cloudinary. Isso prova as 3 partes funcionando juntas: Redis guardando o job, BullMQ entregando pro worker certo, Cloudinary recebendo o arquivo de verdade.

**Preenchendo o molde da narrativa:**

> Pra aprender fila/mensageria na prática, isolei o caso real do Fire OS (upload de mídia pro Cloudinary, que hoje trava a resposta HTTP) num protótipo pequeno, separado do fluxo de produção. Problema real: eu nunca tinha mexido com BullMQ/Redis antes — no Hone (hackathon em equipe) essa parte foi implementada por um colega, então eu conhecia o conceito de longe, mas não tinha experiência prática nenhuma com o código. Considerei já sair ligando direto no `UpdateOrdemdeServicoService.ts`, mas isso ia misturar "aprender o mecanismo pela primeira vez" com "debugar upload multipart + Prisma + Cloudinary + fila, tudo de uma vez". Optei por isolar em 3 arquivos pequenos (`uploadQueue.ts`, `uploadWorker.ts`, `addSampleJob.ts`) e testar ao vivo antes de considerar entendido. Troquei "aprender rápido, arriscando confundir conceito novo com bug de integração" por "aprender devagar, um mecanismo de cada vez" — trade-off certo pra quem tá começando do zero nisso, mesmo custando não estar em produção ainda.

- [ ] Próximo passo, quando fizer sentido: trocar o `await cloudinary.uploader.upload(...)` de dentro de `UpdateOrdemdeServicoService.ts` por `uploadQueue.add(...)`, do jeito que já estava esboçado no bloco "Versão Pleno" acima.

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

**Versão Pleno (cache-aside com Redis):**

```ts
const cacheKey = `os:totais:${JSON.stringify(whereCondition)}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const totais = await calcularTotais(whereCondition); // os 8 counts de hoje
await redis.set(cacheKey, JSON.stringify(totais), 'EX', 30); // expira em 30s
return totais;
```

A regra de quando cachear: dado que é lido **muito mais** do que é escrito (lista de técnicos, contagem de status) é candidato. Dado que muda a cada request (o resultado de um cálculo com input do usuário mudando toda hora) não é.

- [ ] Não precisa Redis de verdade pra aprender o padrão — dá pra simular com um `Map` em memória com TTL primeiro, só pra sentir o cache-aside funcionando, antes de subir a infraestrutura.

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
