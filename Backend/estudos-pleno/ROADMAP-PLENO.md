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

**Revisão 14/09/2026 — esse checkbox estava marcado como feito, mas o mapeamento nunca foi escrito, e o gap que ele deveria ter fechado continua aberto.** Rodando o mesmo grep agora (`tecnico_id` em `services/` e `controllers/`), apareceram 3 módulos com **exatamente o mesmo bug que foi corrigido em OrdemdeServico** — um campo `tecnico_id` que é só *dado a atualizar*, nunca *condição de quem pode atualizar*:

- `UpdateAssistenciaTecnicaService.ts` (rota `PATCH /assistenciatecnica/update/:id`)
- `UpdateControledeLaudoTecnicoService.ts` (rota `PATCH /laudotecnico/update/:id`)
- `UpdateDocumentacaoTecnicaService.ts` (rota `PATCH /documentacaotecnica/update/:id`)

As três rotas estão só atrás de `isAuthenticated` (`privateRouter`, sem `can()` nem `authorizeOrdemdeServico`-equivalente) — ou seja, hoje qualquer `TECNICO` autenticado edita ou apaga a assistência técnica, o laudo técnico ou a documentação técnica **de qualquer outro técnico**, só sabendo o `id`. É o mesmo achado do item 5 (CASL em OrdemdeServico), só que ainda não corrigido — e é maior alavancagem do que continuar o rollout de Zod/Repository pro próximo módulo qualquer, porque esse aqui já tem o padrão de correção pronto (`defineAbilityFor` + um middleware `authorize*` por módulo, ou generalizar `authorizeOrdemdeServico` pra receber o nome do model).

- [ ] Generalizar `authorizeOrdemdeServico` (ou criar 3 equivalentes) pros 3 módulos acima — mesmo padrão, mesma regra ("TECNICO só edita o que é seu, ADMIN edita tudo").

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

- [x] Escolher 1 rota de escrita de risco maior e escrever schema Zod pra ela, como piloto do padrão antes de espalhar pelas +100 rotas restantes — ver abaixo.
- [x] Middleware central de erro que captura `ZodError` e devolve 422 com mensagem de campo — hoje um payload malformado estourava como 500 genérico.
- [ ] Espalhar o mesmo padrão (`schema` + `validate()`) pros outros módulos (`user`, `cliente`, `setor`, `equipamento`...), um de cada vez.
- [ ] Validar variáveis de ambiente no boot (`JWT_SECREATE`, `DATABASE_URL`, `CLOUDINARY_*`) com um schema Zod — o erro do Prisma que você teve hoje ("did not initialize") é sintoma da mesma classe de problema: falha de config descoberta em runtime, não no start.

**Estudar:** validação na borda do sistema (input do usuário) vs. dentro do domínio; parse-don't-validate.

### O que foi implementado (Zod + middleware global de erro, piloto) — 31/08/2026

Antes de sair aplicando Zod nas +100 rotas, escolhi 1 fluxo como prova de conceito: **criação de Ordem de Serviço**. E o motivo de ter sido justamente esse é ele mesmo um achado — o arquivo que eu tinha aberto no IDE (`services/controles_forms/OrdemdeServico/CreateOrdemdeServicoService.ts`) é **código morto**: só é referenciado pelo próprio teste, nenhuma rota usa ele. Quem roda de verdade em produção é `controllers/controles_forms/OrdemdeServico/CreateOrdemdeServicoController.ts` — que tinha os mesmos dois problemas, só que sem ninguém ter notado porque o arquivo errado é que "parecia" o principal.

**1. Bug real encontrado e corrigido — colisão de `numeroOS`.** O schema tem `numeroOS Int? @unique` (`prisma/schema.prisma:202`), mas o código gerava o número assim:

```ts
const numeroOS = Math.floor(10000 + Math.random() * 90000); // 80.000 valores possíveis, sem checar duplicata
```

Sem tratamento, isso quebra sozinho com volume (paradoxo do aniversário, nem precisa de concorrência) — o Prisma lança `P2002` e o `catch` genérico devolvia "Erro interno do servidor" pro técnico, sem tentar de novo. Corrigido com retry: se colidir, gera outro número e tenta de novo (até 5 tentativas) — ver `CreateOrdemdeServicoController.ts`, função `execute`.

**2. Middleware de validação genérico** (`src/Middleware/validate.ts`): recebe um schema Zod, valida `req.body` (ou `params`/`query`), e ou substitui o body pelo dado já parseado ou lança `ValidationError` — não precisa mais de `if (!name || ...)` manual em cada controller.

**3. Middleware global de erro** (`src/Middleware/errorHandler.ts`), plugado uma vez em `server.ts` (`app.use(errorHandler)`), substituindo o handler antigo que tratava qualquer `Error` como 400. Agora distingue:
- `ZodError` / `ValidationError` → 422 com a lista de campos inválidos
- `NotFoundError` → 404, `ConflictError` → 409 (classes em `src/errors/AppError.ts`)
- Erros conhecidos do Prisma: `P2002` (unique) → 409, `P2025` (not found) → 404, `P2003` (FK inválida) → 400
- Qualquer outra coisa → 500 genérico, logado no servidor mas sem vazar detalhe pro cliente

Isso elimina o `try/catch` repetitivo — o controller não captura mais nada, só deixa o erro subir (via `express-async-errors`, que já estava instalado) e o middleware central decide o status/formato da resposta.

**Resultado:** `CreateOrdemdeServicoController.ts` caiu de "destructuring manual + try/catch genérico + numeroOS por sorte" pra "schema Zod na rota + service com retry + zero try/catch". 44 testes passando (11 novos: `validate.test.ts`, `errorHandler.test.ts`, `CreateOrdemdeServicoController.test.ts`), `tsc --noEmit` limpo. Removido o arquivo morto (`services/.../CreateOrdemdeServicoService.ts` + seu teste) — 39 testes depois da remoção, tudo verde.

### Segundo passo do piloto: fechar o par Create + Update — 31/08/2026

Antes de sair pra outro módulo, apliquei o mesmo tratamento no fluxo de **atualização** de Ordem de Serviço (`UpdateOrdemdeServicoService.ts`), pra não deixar o par pela metade. Esse arquivo era um caso ainda pior do que o Create: uma classe chamada "Service" que na verdade era um Controller — recebia `req`/`res` direto, fazia upload pro Cloudinary, montava o `updateData` campo a campo, e tinha `try/catch` devolvendo status na mão.

- **Separei Controller de Service de verdade**: `UpdateOrdemdeServicoService.execute(id, body, file)` agora só recebe dado e devolve o registro atualizado — nada de `req`/`res` dentro dele. `UpdateOrdemdeServicoController.handle` é a camada fina que fala com o Express.
- **Zod nos dois pontos de entrada da rota**: `idParamSchema` valida o `:id` da URL (novo — reaproveitado também na rota `GET /ordemdeservico/:id`, que também usava um `id` sem checagem nenhuma antes de cair no `authorizeOrdemdeServico`), e `updateOrdemdeServicoSchema` valida o body, incluindo `duracao` com `z.coerce.number()` (antes era `Number(body.duracao)` manual).
- **Tirei o guard manual `if (!id) return res.status(400)...`** — isso virou trabalho do `validate(idParamSchema, 'params')` na rota, antes até do middleware de autorização.
- **Um bug pequeno de tratamento de erro que achei nesse arquivo**: o parse de `atividades_ids` (uma string JSON) tinha um `try/catch` que só dava `console.error` e seguia em frente silenciosamente se o JSON viesse malformado — ou seja, o cliente pensava que as atividades foram salvas e elas simplesmente não eram, sem nenhum aviso. Troquei por um `throw new ValidationError(...)` explícito — agora um JSON malformado vira 422 de verdade, não um silêncio enganoso.

**Resultado:** 47 testes passando (mais 3 líquidos: teste dedicado dos schemas `ordemdeServico.schema.test.ts`, e o teste de update ganhou um caso a mais cobrindo o `ValidationError` do `atividades_ids`), `tsc --noEmit` limpo. Não consegui validar o boot real do servidor nesse ambiente de sandbox (a Prisma/env não sobe aqui), então a verificação ficou em tipo + testes — mesma régua que usei no piloto do Create.

**Próximo módulo a receber esse mesmo tratamento:** decidir com calma, indo módulo por módulo (ver checklist logo acima) — o par Create+Update de OrdemdeServico está fechado.

### Terceiro passo: Repository pattern — 31/08/2026

**O conceito, do zero: o que é um Repository, e por que ele existe.** Até agora, o Service chamava `prismaClient.ordemdeServico.create(...)` diretamente — a lógica de negócio (que campos validar, o retry do `numeroOS`) e o código de acesso ao banco moravam no mesmo lugar. Um **Repository** é uma camada fininha só pra isso: "salvar" e "buscar" dados, escondendo o Prisma atrás de métodos com nome de negócio (`create`, `update`), pra ninguém mais no projeto precisar saber que existe um Prisma ali dentro. Se um dia o projeto trocasse Prisma por outro ORM, só o Repository mudaria — o Service continuaria igual.

**A razão prática de fazer isso agora, não só teoria:** testar. Antes, testar o Service exigia mockar o módulo inteiro do Prisma (`vi.mock('../../../prisma', ...)`) — o teste "sabia" que existia um banco por trás, mesmo sendo teste de lógica de negócio. Com o Repository, o teste passa um **repository falso** (um objeto com `create`/`update` fake) direto pro Service — o teste não importa nada do Prisma, só testa "dado esse input, o Service chama `repository.update` com esses dados". Isso é injeção de dependência: o Service recebe o repository de fora (no construtor), em vez de criar/importar um por conta própria.

```ts
// antes (Junior): Service conhece o Prisma diretamente
class CreateOrdemServicoService {
  async execute(data) {
    return prismaClient.ordemdeServico.create({ data: {...}, include: {...} });
  }
}

// teste correspondente: precisa mockar o módulo inteiro do Prisma
vi.mock('../../../prisma', () => ({ default: { ordemdeServico: { create: vi.fn() } } }))
```

```ts
// depois (Pleno): Service só conhece um "algo que sabe criar OS"
class CreateOrdemServicoService {
  constructor(private repository = ordemdeServicoRepository) {}

  async execute(data) {
    return this.repository.create({...}); // não sabe que é Prisma lá dentro
  }
}

// teste correspondente: repository fake, sem tocar no Prisma
const repository = { create: vi.fn(), update: vi.fn() }
const service = new CreateOrdemServicoService(repository)
```

**Implementado:** `src/repositories/OrdemdeServicoRepository.ts` — uma classe com `create()` e `update()`, cada um já com o `include` certo pra cada operação. `CreateOrdemServicoService` e `UpdateOrdemdeServicoService` agora recebem o repository via construtor (com um valor padrão, pra quem instancia sem passar nada — como o `routes.ts` faz — continuar funcionando igual). Os Controllers também passaram a receber o Service via construtor, pelo mesmo motivo.

**Resultado:** 52 testes passando (2 novos, testando o Repository isolado — esse sim mocka o Prisma, porque é literalmente o trabalho dele). `tsc --noEmit` limpo.

- [x] Repository pattern implementado pra Create + Update de OrdemdeServico.
- [ ] Replicar pros outros módulos conforme o rollout de Zod for avançando (decidido: junto, não separado — cada módulo novo já nasce com Controller fino + Service + Repository).

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

- [x] `test.yml` hoje só roda `npm run test`. Adicionar `tsc --noEmit` (checagem de tipo) e lint como steps separados — pega erro de compilação antes do teste, e falha mais rápido/mais barato.
- [ ] Criar um segundo workflow para o `Frontend/` (hoje só o Backend tem CI).
- [ ] Ativar branch protection na `main` exigindo o workflow verde antes de merge — mesmo trabalhando sozinho, isso é um hábito que demonstra disciplina de squad.

**Estudar:** o que roda em cada estágio de um pipeline e por quê (lint/type-check → test → build → deploy), fail-fast.

### O que foi implementado (ESLint + fail-fast no CI) — 14/09/2026

Vou explicar isso em pedaços pequenos, cada um respondendo uma pergunta só.

#### Pedaço 1 — o que é "lint", numa frase

Lint é um corretor ortográfico, só que pra código em vez de texto. Ele não roda o programa — só *lê* o código e aponta padrão suspeito: uma variável que você criou e nunca usou, um `import` que sobrou de um código que você já apagou, um jeito de escrever que o próprio time decidiu evitar. Ele não sabe se a lógica está certa (isso é trabalho do teste); só sabe se o código está "arrumado".

#### Pedaço 2 — por que 3 steps separados no CI, e não só 1

Antes, o `test.yml` só tinha um step: `npm run test`. Agora tem três, nessa ordem:

```yaml
- run: npm run typecheck   # tsc --noEmit — só confere tipo, não gera nada
- run: npm run lint        # eslint . — só confere "arrumação"
- run: npm run test        # só agora roda a suíte de teste de verdade
```

A ordem não é aleatória: `typecheck` e `lint` rodam em **segundos**, sem precisar montar mock nenhum. `test` sobe todo um ambiente simulado e roda 58+ testes — é mais lento. Se um PR tiver um erro de tipo bobo (um campo que não existe mais), a ideia de **fail-fast** é descobrir isso no step de segundos, não esperar o step de segundos-mais-lentos rodar por nada.

#### Pedaço 3 — o que eu de fato instalei e criei

1. `npm install -D eslint typescript-eslint` — as duas dependências. `typescript-eslint` é o pacote oficial que ensina o ESLint (que originalmente só entende JavaScript) a entender TypeScript.
2. `Backend/eslint.config.mjs` — o arquivo de configuração (formato novo do ESLint, chamado "flat config"). É aqui que fica a regra "o que é erro, o que é aviso, o que eu ignoro".
3. Dois scripts novos no `package.json`: `"typecheck": "tsc --noEmit"` e `"lint": "eslint ."`.
4. Dois steps novos no `.github/workflows/test.yml`, antes do `npm run test`.

#### Pedaço 4 — o achado real ao rodar pela primeira vez (o "gotcha")

Rodei `npx eslint .` pela primeira vez, sem ignorar nada ainda, só pra ver o tamanho do problema — e o resultado foi **2153 problemas, 1452 deles erro**. Isso bateria exatamente no aviso que já estava escrito no `GUIA-PRIORIZACAO-PROXIMOS-PASSOS.md`: *"o primeiro `npx eslint .` provavelmente reprova o repo inteiro de uma vez"*.

Só que, olhando de perto **onde** esses erros estavam, quase todos vinham de uma pasta só: `@prisma/client/runtime/*.js` — esse não é código que você escreveu, é o *client* que o Prisma gera automaticamente (`npx prisma generate`) e que, nesse projeto, é salvo dentro do próprio repo (`output` customizado no `schema.prisma`), em vez de ficar escondido dentro de `node_modules` como o padrão. O ESLint não sabia que devia ignorar isso, então estava "corrigindo a ortografia" de um texto escrito por outra pessoa (o próprio Prisma), não pelo seu código.

Depois de adicionar `@prisma/**` na lista de pastas ignoradas (`ignores` no `eslint.config.mjs`), sobrou isso, que é código de verdade do projeto:

```
36 problemas — 0 erros, 36 avisos (tudo @typescript-eslint/no-unused-vars)
```

**A lição de pleno aqui não é "instalei o ESLint"** — é: antes de configurar a regra certa, você precisa primeiro entender *de onde* vêm os problemas que apareceram, porque um número gigante quase sempre significa "estou lintando algo que não deveria", não "meu código está uma bagunça".

#### Pedaço 5 — por que os 36 avisos viraram "warning", não "error"

Esses 36 são reais — variáveis e `import`s que existem no código mas nunca são usados (ex.: `interface StatusComprasRequest` declarada e nunca referenciada). Eu **não** apaguei nenhum agora, e configurei a regra (`no-unused-vars`) como `warn`, não `error`, de propósito:

```js
// eslint.config.mjs
rules: {
  "@typescript-eslint/no-unused-vars": "warn", // não trava o CI
}
```

O motivo é o mesmo princípio do rollout incremental (item 1 deste arquivo): o projeto tem ~110 controllers que nunca passaram por lint nenhum. Se eu configurasse como `error` agora, o CI ficaria vermelho a partir do primeiro PR, obrigando a limpar 36 avisos numa tacada só, sem relação com o que a próxima mudança de verdade seria. Como `warning`, o CI já protege contra problema **novo** que quebra o build (`tsc`) ou é claramente perigoso, sem travar por dívida antiga que ainda não foi a vez de pagar.

#### Pedaço 6 — os 2 erros de verdade que corrigi no caminho

Rodando o typecheck+lint apareceram 2 arquivos com erro real (não aviso): `CreateUserService.ts` e `UpdateUSerService.ts` usavam `import bcrypt = require('bcryptjs')` — uma sintaxe antiga de importar que o ESLint bloqueia (`no-require-imports`) porque mistura dois sistemas de módulo (CommonJS e ES Modules) sem necessidade. O resto do projeto (`AuthUserService.ts`) já importava do jeito moderno:

```ts
// antes, só nesses 2 arquivos
import bcrypt = require('bcryptjs')
// ...
await bcrypt.hash(password, 8)

// depois, igual ao resto do projeto
import { hash } from "bcryptjs";
// ...
await hash(password, 8)
```

De brinde, `UpdateUSerService.ts` tinha um `let data: any = {...}` que nunca era reatribuído (só tinha uma propriedade mutada depois, `data.password = ...`) — trocado por `const`, porque `let` promete "isso vai mudar de valor" e não era o caso.

#### Resultado

`npx tsc --noEmit` limpo, `npx eslint .` com 0 erros (36 avisos conhecidos e aceitos por ora), 58 testes ainda passando — e agora **automaticamente**, a cada push/PR, antes mesmo do teste rodar.

**Preenchendo o molde da narrativa:**

> O CI só rodava teste — um erro de tipo ou um `require` misturado com `import` podia ficar verde do mesmo jeito, desde que os testes mockados não pegassem. Configurei ESLint pela primeira vez no projeto; a primeira rodada devolveu mais de 1400 "erros", mas investigando a origem vi que quase todos vinham do client do Prisma gerado dentro do repo, não do meu código — ignorei essa pasta e sobrou uma lista pequena e real. Considerei já deixar tudo como erro no CI, mas isso pararia o primeiro PR por causa de 36 avisos antigos sem relação com a mudança. Optei por `warn` pros avisos de dívida existente e `error` só pro que quebra de verdade (tipo, `require` misto) — troquei "zerar tudo agora" por "não deixar entrar problema novo, arrumar o resto aos poucos", mesmo princípio do rollout incremental do resto do checklist.

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

### Redis e BullMQ, do zero — o que cada um é

Antes do "como implementei", o "o que é cada peça", sem assumir que você já viu isso:

- **Redis** é um banco de dados que guarda tudo em memória (RAM), não em disco — por isso é absurdamente rápido, e é usado como estrutura de dados compartilhada entre processos diferentes (a API e o worker, por exemplo). Sozinho, ele não sabe nada sobre "fila" ou "job" — é só uma peça de armazenamento genérica, tipo um dicionário gigante chave-valor.
- **BullMQ** é uma biblioteca Node.js que usa o Redis por baixo dos panos pra implementar o conceito de **fila de jobs**: adicionar um "recado" (job) numa lista, e ter um ou mais "trabalhadores" (workers) tirando recados dessa lista e processando, um de cada vez (ou em paralelo, se configurado). O BullMQ é quem entende "job", "fila", "worker" — o Redis só guarda os dados que o BullMQ manda guardar.
- Por isso os dois sempre aparecem juntos: **Redis é o armazenamento, BullMQ é a lógica de fila em cima dele.** Sem Redis rodando, o BullMQ não tem onde guardar nada — foi por isso que a primeira coisa que fizemos foi subir o container do Redis antes de qualquer código de fila funcionar.

### O que foi implementado (protótipo isolado) — 18/08/2026

Pedi pra manter bem simples, então **isso ainda não está ligado ao `fotoController.ts`/`saveAssinatura.ts` reais** — é o mecanismo de fila isolado, testado sozinho, pra entender o processo antes de mexer no fluxo de produção. A ligação com as rotas de verdade é o próximo passo, quando fizer sentido.

**Peças novas, todas em `src/queue/`:**

**1. `docker-compose.yml`** ganhou um segundo serviço, o Redis (a fila BullMQ precisa de um lugar pra guardar os jobs — é isso que o Redis faz aqui):

```yaml
fireos-redis:
  image: redis:7-alpine
  container_name: fireos_redis_container
  ports:
    - "6379:6379"
```

**2. `src/queue/uploadQueue.ts` — o lado de quem PEDE o trabalho** (o "produtor"). Pensa nisso como uma **prateleira** dentro do Redis chamada `"upload-imagem"`: esse arquivo só sabe colocar coisa nela. Não sabe nem se importa quem vai tirar de lá, nem quando:

```ts
import { Queue } from "bullmq";

export const uploadQueue = new Queue("upload-imagem", {
  connection: { url: process.env.REDIS_URL },
});
```

**3. `src/queue/uploadWorker.ts` — o lado de quem FAZ o trabalho** (o "consumidor"). Roda como processo **separado** da API (`npm run worker`), e fica em loop olhando a **mesma prateleira** `"upload-imagem"`, esperando algo aparecer — sem travar nenhuma requisição HTTP, porque ele nem faz parte do fluxo HTTP:

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

Repara que os dois arquivos usam a mesma string `"upload-imagem"` — **é literalmente a única coisa que os conecta.** Nenhum dos dois importa o outro, nenhum dos dois sabe que o outro existe. Eles só concordaram em usar o nome da mesma prateleira. Se um dos dois tivesse `"upload-imagem-2"`, os dois rodariam normalmente, sem erro nenhum, e nunca se encontrariam — o job ficaria parado na prateleira errada pra sempre.

**4. `src/queue/addSampleJob.ts` — simula o que a rota da API faria**: adiciona um job na fila e "responde" na hora, sem esperar o upload terminar.

**A ordem exata do que acontece, passo a passo** (são 2 programas rodando ao mesmo tempo, em terminais diferentes):

1. `npm run worker` roda num terminal e **fica preso num loop**, só olhando a prateleira `"upload-imagem"`. Log: `Worker rodando, esperando jobs...`
2. Em outro terminal, `npm run queue:demo` chama `uploadQueue.add(...)` — isso manda pro Redis: *"bota esse recado na prateleira upload-imagem"*. Log: `Job 1 adicionado na fila.`
3. Esse segundo processo **termina e morre logo em seguida** (`process.exit(0)`) — já entregou o recado, não precisa esperar nada.
4. O worker (que nunca parou de rodar) percebe que apareceu algo novo na prateleira e **puxa** esse job sozinho — ninguém avisou ele diretamente. Log: `[worker] peguei o job 1...`
5. Só aí o worker roda o upload pro Cloudinary de verdade e loga a URL.

A sacada: **quem adiciona o job (passo 2) e quem processa (passo 4) nunca se falam diretamente — os dois só falam com o Redis**, em momentos totalmente diferentes. É isso que deixa a API livre pra responder rápido no passo 2, sem esperar o passo 5 acontecer — exatamente o "antes/depois" que vimos lá em cima com o técnico de campo.

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

- [x] Próximo passo, quando fizer sentido: trocar o `await cloudinary.uploader.upload(...)` de dentro de `fotoController.ts` por `uploadQueue.add(...)`, do jeito que já estava esboçado no bloco "Versão Pleno" acima. **Feito em 14/09** — ver "O que foi implementado (fila ligada ao fluxo real)" logo abaixo.
- [ ] Separado disso: decidir o que fazer com `saveAssinatura.ts`/`enviarAssinatura()` — hoje a assinatura desenhada não chega a ser salva por esse fluxo (nem entraria na fila, porque nem a chamada existe ainda). Vale essa investigação antes de pensar em fila pra ela.

### O que foi implementado (fila ligada ao fluxo real) — 14/09/2026

O protótipo (seção acima) provava que Redis + BullMQ funcionavam juntos, isolado, sem tocar em produção. Agora é a parte que faltava: o `fotoController.ts` de verdade parou de subir foto pro Cloudinary dentro do request. Também em pedaços pequenos:

#### Pedaço 1 — o que mudou no `fotoController.ts`, exatamente

```ts
// ANTES — cada foto trava o request até o Cloudinary responder
for (const file of files) {
  const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, { folder: "ordens_servico" });
  const foto = await prismaClient.fotoOrdemServico.create({ data: { url: uploadResult.secure_url, ordemdeServico_id } });
  fotos.push(foto);
}
return res.json(fotos); // só responde depois de TODAS terminarem
```

```ts
// DEPOIS — só entrega o recado pra fila e responde na hora
for (const file of files) {
  await uploadQueue.add("upload-foto-os", { ordemdeServico_id, tempFilePath: file.tempFilePath });
}
return res.status(202).json({ message: `${files.length} foto(s) recebida(s), processando em segundo plano.` });
```

`202 Accepted` (em vez de `200 OK`) é o código HTTP que existe exatamente pra isso: "recebi seu pedido, é válido, mas ainda não terminei de processar — não espere o resultado final nessa resposta". É um detalhe pequeno, mas é o tipo de coisa que sinaliza que você conhece o protocolo, não só "funciona".

#### Pedaço 2 — quem faz o trabalho de verdade agora: o worker aprendeu 2 tarefas

O `uploadWorker.ts` do protótipo só sabia fazer uma coisa (subir pro Cloudinary e logar). Agora ele reconhece **dois tipos de job** na mesma fila, pelo nome do job (`job.name`):

```ts
const worker = new Worker("upload-imagem", async (job) => {
  if (job.name === "upload-foto-os") {
    return processarUploadFotoOS(job);   // job de verdade: sobe + salva no Postgres
  }
  return processarUploadDemo(job);       // job do "npm run queue:demo": só loga, não toca no banco
}, ...);
```

Por que não criei um worker separado só pro fluxo real? Porque os dois compartilham a mesma infraestrutura (mesma fila, mesma conexão Redis) — dividir por `job.name` dentro de **um** worker é mais simples do que rodar dois processos escutando a mesma prateleira. O protótipo de estudo (`npm run queue:demo`) continua funcionando exatamente igual, sem tocar no banco, útil pra você testar o mecanismo isolado de novo se precisar.

A diferença real entre os dois: `processarUploadFotoOS` faz **duas coisas em sequência**, não uma — sobe pro Cloudinary, e só depois disso dá certo, grava o registro no Postgres. Se o worker morresse bem no meio (entre as duas), o job fica marcado como não concluído no Redis, e o próximo pedaço explica o que acontece a seguir.

#### Pedaço 3 — o que acontece se o Cloudinary falhar (retry automático)

Antes, se `cloudinary.uploader.upload` falhasse, o `catch` do controller devolvia um erro pro app e a foto se perdia — o técnico precisaria tentar de novo manualmente. Agora, configurei a fila pra tentar sozinha:

```ts
// uploadQueue.ts
export const uploadQueue = new Queue("upload-imagem", {
  connection: { url: process.env.REDIS_URL },
  defaultJobOptions: {
    attempts: 3,                                    // tenta até 3 vezes
    backoff: { type: "exponential", delay: 2000 },   // espera mais a cada tentativa
  },
});
```

"Exponential backoff" é só isso: em vez de tentar de novo imediatamente (o que provavelmente falharia pelo mesmo motivo, ex.: internet de campo instável), a espera dobra a cada tentativa (2s, 4s, 8s...) — dá tempo da causa da falha (rede, Cloudinary fora do ar por um instante) se resolver sozinha antes da próxima tentativa.

#### Pedaço 4 — o bug que eu quase deixei passar: containers têm sistema de arquivo separado

Isso é o achado mais valioso desse item, então vale contar como cheguei nele. Adicionei um serviço `fireos-worker` novo no `docker-compose.yml` (mesma imagem da API, só troca o comando pra rodar o worker em vez do servidor HTTP). Só que, pensando melhor sobre **onde** cada peça roda:

- `fotoController.ts` roda dentro do container `fireos-api` e escreve a foto temporária em `/tmp/` **desse container**.
- O job que ele manda pra fila carrega só o **caminho** do arquivo (`tempFilePath`), não o arquivo em si.
- O worker roda no container `fireos-worker` — **um container diferente**, com seu próprio `/tmp/` isolado, que não tem nada a ver com o `/tmp/` do container da API.

Sem correção, o worker receberia um caminho tipo `/tmp/abc123.jpg` e tentaria abrir um arquivo que, do ponto de vista dele, **nunca existiu** — o job falharia sempre, todas as 3 tentativas, mesmo sem nada de errado com o Cloudinary. Corrigi criando um volume Docker compartilhado, montado no mesmo caminho nos dois containers:

```yaml
# docker-compose.yml
fireos-api:
  volumes:
    - tmp_uploads:/tmp
fireos-worker:
  volumes:
    - tmp_uploads:/tmp
```

Um **volume nomeado** no Compose é uma pasta que o Docker gerencia e pode "plugar" em mais de um container ao mesmo tempo — os dois passam a enxergar o mesmo `/tmp/` de verdade, não uma cópia cada um. Isso é system design pequeno, mas é exatamente o tipo de coisa que só aparece quando você para pra desenhar "que processo roda onde" em vez de assumir que vai funcionar porque funcionou local.

**Limite que não tentei resolver agora, por ser fora do escopo desse item:** mesmo com o volume, isso ainda é "dois containers no mesmo host compartilhando disco" — não escala pra vários hosts diferentes (ex.: API e worker em máquinas físicas separadas, ou em serviços gerenciados tipo AWS ECS com discos não compartilhados). A solução que escala de verdade seria mandar o **conteúdo** do arquivo pro job (base64) ou subir pra um storage intermediário (ex.: o próprio Cloudinary, direto do controller, só que teria que ser síncrono de novo) — decisão que só vale a pena tomar se/quando o projeto precisar rodar em mais de uma máquina.

#### Pedaço 5 — o bug que quase escapou no Frontend, achado revisando quem consome essa rota

Antes de considerar isso pronto, chequei quem no projeto chama `POST /foto` — e achei um consumidor real que ia quebrar silenciosamente. O `ViewCardFoto.tsx` (painel web) fazia isto depois do upload:

```tsx
// ANTES — supõe que a resposta do POST já é a foto pronta
const res = await api.post("/foto", formData, {...});
const novas = Array.isArray(res.data) ? res.data : [res.data];
setFotos((prev) => [...novas, ...prev]);
```

Isso funcionava porque, antes, `POST /foto` respondia com a foto já criada (`{ id, url, ordemdeServico_id }`). Com a fila, a resposta virou `{ message: "..." }` — sem `id` nem `url`. Se eu não tivesse corrigido esse arquivo, o painel web continuaria "funcionando" sem erro nenhum no console, só que empurrando um objeto quebrado pra dentro da lista de fotos — um card de foto sem imagem, com key do React undefined. Um bug silencioso, o pior tipo.

```tsx
// DEPOIS — não tenta adivinhar a foto a partir da resposta do POST;
// busca a lista atualizada de verdade depois do upload
await api.post("/foto", formData, {...});
// ...
const fotosRes = await api.get(`/foto/${ordemdeServico.id}`, {...});
setFotos(fotosRes.data);
```

**Limite honesto que fica em aberto:** se o worker ainda não tiver processado a foto no exato momento desse `GET` (ele roda em paralelo, sem garantia de estar pronto em milissegundos), a foto mais nova só aparece da próxima vez que a lista for recarregada — não tem WebSocket nem polling automático ainda. Pra maioria dos casos (upload de imagem pequena, Cloudinary responde rápido) isso passa despercebido; documentando aqui pra não fingir que está 100% resolvido.

**Não mexi (por enquanto, de propósito) no app mobile:** o `FireOS-App/index.tsx` ainda manda as fotos **uma de cada vez**, esperando cada `POST` responder antes de mandar a próxima (`for` com `await` dentro). Isso significa que o ganho de performance de ligar a fila (não travar mais esperando o Cloudinary) só aparece de verdade se o app também parar de esperar sequencialmente — hoje ele ainda espera N respostas HTTP em sequência, só que cada uma delas agora é rápida (202 quase instantâneo) em vez de lenta (esperando o Cloudinary). É uma melhoria real mesmo assim, só que parcial — paralelizar o `uploadImages()` do app é o próximo passo natural, fora do escopo desse item.

#### Resultado

- `fotoController.handle` não fala mais com o Cloudinary — só enfileira e responde `202`.
- `uploadWorker.ts` faz o trabalho de verdade (upload + grava no Postgres), com retry automático (3 tentativas, backoff exponencial).
- `docker-compose.yml` ganhou o serviço `fireos-worker` (mesma imagem, comando diferente) e um volume compartilhado (`tmp_uploads`) pros dois containers enxergarem o mesmo arquivo temporário.
- `ViewCardFoto.tsx` (painel web) corrigido pra não quebrar com a resposta assíncrona nova.
- 4 testes novos em `fotoController.test.ts` (mockando a fila, sem precisar de Redis nem Cloudinary de verdade pra rodar), `tsc --noEmit` limpo, 62 testes passando no total.

**Preenchendo o molde da narrativa:**

> O upload de foto travava a resposta HTTP até o Cloudinary terminar, um de cada vez. Já tinha um protótipo isolado de fila (BullMQ + Redis) rodando, então liguei ele no fluxo real: o controller agora só enfileira e responde 202. No caminho, achei dois problemas que não eram óbvios até eu pensar em "onde cada peça roda": (1) o worker ia rodar num container Docker diferente da API, e os dois têm sistema de arquivo isolado por padrão — sem um volume compartilhado, todo job falharia sempre; (2) o painel web já lia a resposta do POST como se fosse a foto pronta, e ia quebrar silenciosamente com o novo formato de resposta assíncrona. Corrigi os dois antes de considerar terminado. Acrescentei retry automático (3 tentativas, backoff exponencial) porque throw-away de uma falha de rede em campo era exatamente o cenário que motivou usar fila, então deixar sem retry seria resolver só metade do problema original.

---

**Atualização (24/08):** adicionei um painel visual (Bull Board, `src/queue/dashboard.ts`, `npm run queue:dashboard`) pra ver os jobs em tempo real em vez de só ler log de terminal, e testei enfileirando 4 imagens de uma vez (`addSampleJob.ts` agora aceita vários arquivos). Explicação completa de tudo isso — incluindo o teste ao vivo com os logs reais e um glossário rápido dos termos (queue, job, worker, producer, consumer, concurrency) — está num arquivo separado: **`GUIA-FILA-BULLMQ.md`**, pra não deixar esse item aqui gigante.

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

### O que foi implementado — 31/08/2026

```ts
// hoje (Junior): sempre bate no banco, 8 queries, mesmo se nada mudou nos últimos segundos
const [total, totalAberta, totalEmDeslocamento, ...] = await Promise.all([
  prismaClient.ordemdeServico.count({ where: whereCondition }),
  prismaClient.ordemdeServico.count({ where: { ...whereCondition, statusOrdemdeServico: { name: "ABERTA" } } }),
  // ...mais 6 counts iguais
]);
```

```ts
// Pleno: olha o Redis primeiro (cache-aside), só bate no banco se não achar (miss)
const cacheKey = `os:totais:${JSON.stringify(whereCondition)}`;

try {
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);
} catch (error) {
  console.error("Redis indisponível, seguindo sem cache:", error); // ver abaixo
}

const totais = await calcularOitoCounts(whereCondition); // os 8 counts de sempre
await redisClient.set(cacheKey, JSON.stringify(totais), "EX", 30); // expira em 30s
return totais;
```

Arquivos: `src/redis/index.ts` (cliente Redis único, reaproveitando o `REDIS_URL` que já existia pro BullMQ) e `src/services/controles_forms/OrdemdeServico/ListOrdemdeServicoService.ts`, que ganhou um método privado `getTotais()` isolando essa lógica do resto do `execute()`.

**Detalhe que não estava no pseudocódigo original: o `try/catch` em volta do Redis.** Se o Redis cair, a rota inteira não pode cair junto — ela só perde o benefício da velocidade e volta a calcular direto no banco, como fazia antes de existir cache. Isso é o mesmo princípio de **fallback/resiliência** já documentado no item 3 (Redis não pode virar um ponto único de falha pra uma funcionalidade que nem depende dele pra existir). Tem um teste dedicado provando esse caminho (`ListOrdemdeServicoService.test.ts`, "segue funcionando (fallback) mesmo se o Redis estiver fora do ar").

**Resultado:** 50 testes passando (3 novos, cobrindo cache miss, cache hit, e o fallback), `tsc --noEmit` limpo. Só cacheei os 8 `count()` — a lista (`controles`) continua sempre fresca do banco, porque cada combinação de filtro/página é quase sempre diferente, então cachear a lista teria taxa de acerto (*hit rate*) baixa, sem valer o esforço.

**Pendência real:** `ListTecnicoController.ts` (mesmo problema, lista que muda raramente) ainda não recebeu esse tratamento — próximo candidato óbvio quando fizer sentido. A ideia de otimizar o SQL com `GROUP BY` antes de cachear (colapsar os 8 `count()` num único query agrupado) segue só como ideia — não fiz porque os 8 `count()` filtram por relação (`statusOrdemdeServico.name`), e o `groupBy` do Prisma só agrupa por coluna própria do model, não por campo de uma relação — faria sentido com SQL bruto (`$queryRaw`), mas o ganho fica pequeno depois que o cache já resolve o problema de carga real (a query só roda a cada 30s, não a cada request).

- [x] Cache-aside com Redis implementado no `ListOrdemdeServicoService.ts` (totais de status).
- [x] Replicado em `ListTecnicoService.ts` — ver "Atualização (04/09)" logo abaixo.

**Atualização (04/09):** aprofundei o "por que não fiz o GROUP BY" — a resposta certa não é "o ganho é pequeno", é que cache e agregação condicional (`COUNT(*) FILTER (WHERE ...)`) resolvem problemas diferentes: cache reduz *frequência* (roda a cada 30s em vez de a cada request), agregação condicional reduz *custo por execução* (1 round-trip em vez de 8) — e existem dois cenários de borda onde só o cache não basta: cache stampede (TTL expira com várias requisições simultâneas, todas dão miss junto) e Redis fora do ar (o fallback volta a pagar os 8 round-trips inteiros). Explicação completa, com o comparativo lado a lado e glossário, está num arquivo separado: **`GUIA-CACHE-REDIS.md`**.

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
