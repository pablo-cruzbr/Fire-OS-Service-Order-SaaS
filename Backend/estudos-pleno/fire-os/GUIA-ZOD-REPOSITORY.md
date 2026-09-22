# Guia de Validação (Zod), Erros e Repository Pattern no Fire OS

Documento separado do `ROADMAP-PLENO.md`, mesmo espírito dos outros guias: o relato completo de como o piloto de Zod + tratamento de erro + Repository foi implementado, num lugar só. O conceito (por que validar na borda, parse-don't-validate) continua no `ROADMAP-PLENO.md`, glossário item 2 — aqui é o "o que eu de fato fiz", em 3 passos.

---

## Primeiro passo: Zod + middleware global de erro (piloto) — 31/08/2026

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

---

## Segundo passo: fechar o par Create + Update — 31/08/2026

Antes de sair pra outro módulo, apliquei o mesmo tratamento no fluxo de **atualização** de Ordem de Serviço (`UpdateOrdemdeServicoService.ts`), pra não deixar o par pela metade. Esse arquivo era um caso ainda pior do que o Create: uma classe chamada "Service" que na verdade era um Controller — recebia `req`/`res` direto, fazia upload pro Cloudinary, montava o `updateData` campo a campo, e tinha `try/catch` devolvendo status na mão.

- **Separei Controller de Service de verdade**: `UpdateOrdemdeServicoService.execute(id, body, file)` agora só recebe dado e devolve o registro atualizado — nada de `req`/`res` dentro dele. `UpdateOrdemdeServicoController.handle` é a camada fina que fala com o Express.
- **Zod nos dois pontos de entrada da rota**: `idParamSchema` valida o `:id` da URL (novo — reaproveitado também na rota `GET /ordemdeservico/:id`, que também usava um `id` sem checagem nenhuma antes de cair no `authorizeOrdemdeServico`), e `updateOrdemdeServicoSchema` valida o body, incluindo `duracao` com `z.coerce.number()` (antes era `Number(body.duracao)` manual).
- **Tirei o guard manual `if (!id) return res.status(400)...`** — isso virou trabalho do `validate(idParamSchema, 'params')` na rota, antes até do middleware de autorização.
- **Um bug pequeno de tratamento de erro que achei nesse arquivo**: o parse de `atividades_ids` (uma string JSON) tinha um `try/catch` que só dava `console.error` e seguia em frente silenciosamente se o JSON viesse malformado — ou seja, o cliente pensava que as atividades foram salvas e elas simplesmente não eram, sem nenhum aviso. Troquei por um `throw new ValidationError(...)` explícito — agora um JSON malformado vira 422 de verdade, não um silêncio enganoso.

**Resultado:** 47 testes passando (mais 3 líquidos: teste dedicado dos schemas `ordemdeServico.schema.test.ts`, e o teste de update ganhou um caso a mais cobrindo o `ValidationError` do `atividades_ids`), `tsc --noEmit` limpo. Não consegui validar o boot real do servidor nesse ambiente de sandbox (a Prisma/env não sobe aqui), então a verificação ficou em tipo + testes — mesma régua que usei no piloto do Create.

**Próximo módulo a receber esse mesmo tratamento:** decidir com calma, indo módulo por módulo (ver `CHECKLIST-REFATORACAO-BACKEND.md`) — o par Create+Update de OrdemdeServico está fechado.

---

## Terceiro passo: Repository pattern — 31/08/2026

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
- [x] Replicar pros outros módulos conforme o rollout de Zod for avançando — **primeiro módulo novo: `user`, 15/09.** Ver abaixo.

---

## Quarto passo: módulo `user` (Create + Update + Auth) — 15/09/2026

Escolhido como o primeiro módulo do rollout (de ~100 restantes) por dois motivos concretos, não por estar mais fácil: (1) é o exemplo que já estava documentado há semanas no glossário do `ROADMAP-PLENO.md` como o "antes" do Zod (`CreateUserController.ts:6`, `const {name,email,password,...} = req.body` sem checar nada); (2) uma revisão do software como um todo achou um **achado de segurança novo, mais grave que os já corrigidos**, exatamente nesse módulo — ver a seção seguinte.

**1. `PATCH /user/update/:id` não tinha `can()` nem ownership nenhum.** Só `isAuthenticated`. E o controller pegava o `id` de `req.params`, não de `req.user_id`:

```ts
// ANTES — UpdateUserController.ts
const { id } = req.params;          // qualquer id, não necessariamente o do usuário logado
const { name, email, password, ... } = req.body;
await updateUserService.execute({ user_id: id, ... });
```

Isso significa: **qualquer usuário autenticado, de qualquer role, trocava a senha, o e-mail ou a instituição de qualquer outro usuário**, só sabendo o `id`. Pior que os achados de ownership já corrigidos (item RBAC), porque aqui o alvo é a própria conta — é sequestro de conta, não só edição indevida de um registro. Confirmei no Frontend (`EditUsuariosForm.tsx`) que a rota é usada de propósito por uma tela de gestão de usuários — então o fix certo não é "só o dono", é `can(['ADMIN'])`, igual já existe em `GET /listusers`:

```ts
// DEPOIS — routes.ts
privateRouter.patch(
  '/user/update/:id',
  can(['ADMIN']),
  validate(idParamSchema, 'params'),
  validate(updateUserSchema),
  new UpdateUserController().handle
)
```

**2. Zod aplicado nos 3 endpoints que recebem body:** `createUserSchema` (nome obrigatório, email com formato validado, senha com mínimo de 6 caracteres), `updateUserSchema` (tudo opcional, mas senha continua com mínimo de 6 quando informada) e `authUserSchema` (email + senha). O `idParamSchema` que validava só `:id` de OrdemdeServico virou **`common.schema.ts`** — não fazia mais sentido morar só lá assim que um segundo módulo precisou dele.

**3. `UserRepository.ts` novo** — mesmo padrão do `OrdemdeServicoRepository.ts`: `findByEmail`, `create`, `update`, escondendo o Prisma. `AuthUserService` (login), `CreateUserService` e `UpdateUserService` recebem o repository via construtor.

**4. Bug de verdade corrigido no caminho: senha errada devolvia 500, não 401.** `AuthUserController` nunca teve `try/catch`, e o `Error("usuário ou senha está incorreta")` que o service lançava não era nenhum dos tipos que o `errorHandler` reconhece (`ZodError`, `ValidationError`, `AppError`, erro conhecido do Prisma) — caía direto no `catch-all` de 500. Criei `UnauthorizedError` (401) em `src/errors/AppError.ts` e troquei o `Error` genérico por ele. Login errado agora responde `401`, não `500`.

**5. `CreateUserService` trocou `Error` genérico por `ConflictError`** (409) no caso de e-mail duplicado — mesma lógica do item 4 acima, usando o tipo certo em vez do genérico.

**Resultado:** 92 testes passando (13 novos: `common.schema.test.ts`, `user.schema.test.ts`, `UserRepository.test.ts`, `UpdateUSerService.test.ts` novo, mais os testes existentes de `CreateUserService`/`AuthUserService` reescritos pra usar repository fake em vez de mockar o Prisma direto). `tsc --noEmit` limpo, `eslint` sem erro novo.

**Preenchendo o molde da narrativa (o achado mais forte desse módulo):**

> Ao decidir qual módulo priorizar no rollout de Zod/Repository, analisei o backend como um todo em vez de pegar o próximo da lista — e achei que `PATCH /user/update/:id` não tinha checagem de dono nenhuma, só autenticação. Qualquer usuário autenticado podia trocar a senha de qualquer outro, incluindo admins. Considerei restringir a "só o próprio usuário", mas confirmei no Frontend que a rota é usada de propósito por uma tela de gestão — restringir assim quebraria a funcionalidade real. Optei por `can(['ADMIN'])`, mesma regra já aplicada em `/listusers`. Troquei "generalizar mais um middleware de ownership" por "aplicar o RBAC que já existia e só não tinha sido colado nessa rota" — o fix mais simples que resolve o problema real, sem inventar mecanismo novo.

---

## Quinto passo: os 3 módulos técnicos (AssistenciaTecnica, LaudoTecnico, DocumentacaoTecnica) — 15/09/2026

Escolhidos como próximo alvo depois de uma análise do backend como um todo (~100 controllers, "muito do mesmo" — ver a conversa que gerou essa priorização), não por estarem no topo de uma lista qualquer: esses 3 já tinham o CASL de ownership aplicado (achado de 14/09), então fechar Zod + Repository neles termina um trabalho já começado em vez de abrir uma frente nova. Os 3 têm exatamente o mesmo formato — Create/Update/Delete — então o rollout saiu mais rápido que o do `user`, mas vale registrar as diferenças que apareceram no caminho.

**1. Schemas por módulo**, cada um com Create (campos obrigatórios batendo com o `schema.prisma` — nada de opcional "porque sim") e Update (tudo opcional): `assistenciaTecnica.schema.ts`, `laudoTecnico.schema.ts`, `documentacaoTecnica.schema.ts`. Achado ao comparar os 3: **LaudoTecnico é o único sem nenhuma FK opcional** — `instituicaoUnidade_id` é obrigatório lá, mas opcional nos outros dois. Sem olhar o `schema.prisma` de cada um, esse tipo de diferença passa despercebido e o schema Zod fica errado (rejeitando um payload válido, ou aceitando um inválido).

**2. Repository por módulo** (`AssistenciaTecnicaRepository.ts`, `LaudoTecnicoRepository.ts`, `DocumentacaoTecnicaRepository.ts`), mesmo formato do `OrdemdeServicoRepository.ts`/`UserRepository.ts`: `create`/`update`/`delete`, escondendo o Prisma.

**3. `try/catch` removido de 6 arquivos** (Update + Delete × 3 módulos) — o padrão era idêntico nos 3: `catch (error: any) { return res.status(400)... }`. Sem checagem manual de existência antes do update/delete — segue o mesmo princípio já usado em `UpdateOrdemdeServicoService.ts`: se o `id` não existir, o Prisma lança `P2025` e o `errorHandler` global já traduz pra `404`.

**4. Achado pequeno no caminho: `documentacaoTecnica`, na criação, aceitava um `id` vindo do cliente.** O controller antigo desestruturava `id` do `req.body` e mandava direto pro `prismaClient.documentacaoTecnica.create({ data: { id, ... } })` — deixando quem chama a API escolher o próprio UUID do registro, em vez do banco gerar (`@default(uuid())` já existe no `schema.prisma`, nunca foi usado). Nenhum outro Create do projeto faz isso. Removido do schema Zod novo — parecia sobra de copiar-colar de outro módulo, não uma decisão de negócio.

**Resultado:** 131 testes passando (39 novos: 4 arquivos de schema, 3 de repository, 9 de service — Create/Update/Delete × 3 módulos), `tsc --noEmit` limpo, `eslint` sem erro novo (só 3 avisos previsíveis de destructuring-pra-omitir-campo nos testes de schema, mesma categoria dos avisos já aceitos no projeto). O número de arquivos com o padrão antigo de `try/catch` caiu de 28 pra **22**.

**Preenchendo o molde da narrativa:**

> Depois de fechar o achado de segurança do `user`, apliquei o mesmo rollout de Zod/Repository nos 3 módulos técnicos que já tinham ownership corrigido — terminar um trabalho começado em vez de espalhar em módulos novos. Os 3 têm o mesmo formato, o que acelerou o trabalho, mas também escondia um risco: copiar o schema de um módulo pro outro sem checar o `schema.prisma` de cada um. Confirmei campo por campo e achei que `LaudoTecnico` não tem nenhuma FK opcional, diferente dos outros dois — se eu tivesse assumido que os 3 eram idênticos, o schema ia rejeitar (ou aceitar) payload errado silenciosamente. Também achei um `id` client-controlado esquecido no Create de `documentacaoTecnica`, que não existe em nenhum outro módulo — removi por parecer resíduo de copiar-colar, não decisão deliberada.

---

## Sexto passo: os 5 módulos restantes de `controles_forms` — 15/09/2026

Terminado o grupo inteiro de `controles_forms` que faltava (Estabilizadores, Laboratorio, MaquinasPendentesLab, MaquinasPendentesOro, SolicitacaodeCompras) — o último item da tabela de prioridade que ainda tinha "5 módulos sem Zod" virou zero. São **8 módulos de `controles_forms` no total agora com Zod + Repository** (contando os 3 técnicos do passo anterior e o OrdemdeServico original).

**Achado que se repetiu — confirma que "checar campo a campo" não foi sorte uma vez só:** `ControledeMaquinasPendentesOro` e `ControledeMaquinasPendentesLab` parecem o mesmo módulo (nome quase igual, mesma forma), mas `instituicaoUnidade_id` é **opcional** em "Lab" e **obrigatório** em "Oro" no `schema.prisma`. Se eu tivesse copiado o schema Zod de um pro outro sem abrir o `schema.prisma` de cada um, um dos dois ficaria errado — exatamente o mesmo tipo de gotcha do LaudoTecnico no passo anterior, só que dessa vez entre dois módulos com nome quase idêntico, onde a tentação de assumir "são iguais" é ainda maior.

**Achados de qualidade no caminho (bugs pré-existentes, não relacionados a Zod/Repository, mas que apareceram por estar lendo o código de perto):**
- `ControledeEstabilizadores` não tem rota de Delete — só Create/List/Update existem hoje. Não criei uma; documentando que é assim de propósito (decisão de escopo do módulo), não uma lacuna do rollout.
- O Delete de `ControledeMaquinasPendentesLab` devolvia a mensagem de erro **"Controle de Laudo técnico não encontrado"** — copiado do módulo errado (LaudoTecnico). Corrigido pra "Máquinas Pendentes no Laboratório".
- O arquivo `DeleteControledeMaquinasPendentesLabController.ts`, dentro da pasta `ControledeMaquinasPendentesOro/`, na verdade é o Delete controller do **Oro**, não do "Lab" — só o nome do arquivo está errado (a classe exportada já tinha o nome certo). Mantive o nome do arquivo como está pra não causar um diff de rename sem necessidade — só documentando o porquê de parecer estranho se alguém for procurar.

**Resultado:** 182 testes passando (51 novos: 5 arquivos de schema, 5 de repository, 14 de service), `tsc --noEmit` limpo, `eslint` sem erro novo. O número de arquivos com o padrão antigo de `try/catch` caiu de 22 pra **12** — e o grupo inteiro de `controles_forms` que tinha 16 arquivos pendentes (nos dois últimos passos) foi zerado.

**Preenchendo o molde da narrativa:**

> Depois dos 3 módulos técnicos, terminei o grupo de `controles_forms` inteiro fechando os 5 módulos restantes — mesma forma (Create/Update/Delete com FKs pra equipamento/instituição/status), mas não assumi que "mesma forma" significava "mesmo schema". Comparando os dois módulos de nome mais parecido (MaquinasPendentesLab e MaquinasPendentesOro) achei que um tem uma FK opcional que no outro é obrigatória — a mesma categoria de erro que só aparece quando você confere campo a campo, não quando confia no nome do módulo. De brinde, achei 2 bugs de copiar-colar (uma mensagem de erro errada, um arquivo com nome trocado) que não tinham nada a ver com o rollout em si, só apareceram porque estava lendo o código de perto pra escrever o schema certo.

---

## Sétimo passo: as 2 primeiras entidades reais de `status_categorias` (Equipamento, InformacoesSetor) — 15/09/2026

Com `controles_forms` inteiro fechado, entrei no próximo grupo do rollout: as 3 "entidades reais" de `status_categorias` (`equipamento`, `informacoessetor`, `tipodeInstituicaoUnidade`), listadas assim na tabela de prioridade porque têm relacionamento de verdade com outras tabelas (diferente das ~15 tabelas de lookup que só têm um campo `name`).

**Antes de escrever qualquer schema, conferi se as rotas de Update desses 3 módulos existiam de verdade** — e a resposta foi não, em 2 casos de um jeito bem mais sério do que "falta Zod":

**1. `PATCH /equipamento/:id` não existia em `routes.ts` — mas o Frontend já chama essa rota.** `EditEquipamentoForm.tsx` faz `api.patch('/equipamento/${equipamento.id}', ...)` a partir de um botão "Editar" real, na tela de equipamentos. O `UpdateEquipamentoController.ts` existia, com lógica pronta — só nunca foi importado nem wireado em `routes.ts`. Isso significa que, em produção, clicar em "Editar equipamento" sempre devolvia **404**, silenciosamente, sem ninguém ter notado (ou notaram e acharam que era outro bug). Corrigido: rota adicionada, com `validate()` de Zod.

**2. O mesmo bug, no mesmo formato, em `informacoessetor`.** `EditRamalSetorForm,.tsx` chama `api.patch('/informacoessetor/${dados.id}', ...)` — `UpdateInformacoesSetorController.ts` também já existia, também nunca foi wireado. Mesmo resultado: 404 sempre que alguém tentava editar um ramal/setor.

**3. Um terceiro bug, esse silencioso em vez de barulhento — a exclusão de equipamento nunca funcionou.** A rota `DELETE /deleteequipamento/:id` existe e o Frontend chama exatamente ela (`api.delete('/deleteequipamento/${equipamento_id}')`, id como segmento de caminho) — mas o controller lia `req.query.equipamento_id` em vez de `req.params.id`. Como não tem query string nenhuma na chamada real, `equipamento_id` sempre chegava `undefined` no Prisma, e o delete sempre falhava (capturado pelo `try/catch` genérico, que devolvia um 400 discreto — fácil de confundir com "erro de rede" em vez de "essa funcionalidade nunca existiu"). Corrigido: o controller agora lê `req.params.id`, batendo com a rota e com o Frontend.

**4. Um quarto achado, esse de tratamento de erro: conflito de patrimônio duplicado devolvia 500, não 400/409.** `CreateEquipamentoController.ts` não tinha `try/catch` nenhum, e o `CreateEquipamentoService.ts` lançava um `Error` genérico quando o patrimônio já existia. Sem captura no controller, esse erro subia até o `errorHandler` global — que não reconhece `Error` puro, só `AppError` e subclasses — e virava 500 genérico. Corrigido com `ConflictError` (409), que o `errorHandler` já sabe traduzir.

**5. Bug de partial-update em `informacoessetor`:** o `UpdateInformacoesSetorService.ts` original resolvia `cliente_id`/`instituicaoUnidade_id` de forma incondicional, mesmo quando esses campos não vinham no payload — ou seja, se algum outro caller um dia mandasse um update parcial sem esses 2 campos, a associação existente seria apagada sem querer. Na prática o formulário real sempre manda os 2 campos (confirmado lendo o `.tsx`), então esse bug nunca foi disparado até hoje — mas o Repository novo só toca nesses campos quando eles realmente vêm no `req.body`, fechando o risco antes que apareça.

**Achado à parte, documentado mas não corrigido — código morto:** o item 3 da lista original ("tipodeInstituicaoUnidade (Update)") não é o que o nome sugere. O arquivo `UpdateInstituicaoUnidadeController.ts` mora na pasta `tipodeInsituicaoUnidade/`, mas na verdade atualiza a entidade **InstituicaoUnidade** (name/endereço/telefone/tipo), não o "tipo de instituição" em si. E, conferindo o Frontend, **nenhuma tela chama essa rota — porque a rota nem existe em `routes.ts`.** Isso é código morto de verdade: escrito, nunca ligado, nunca usado. Decisão de produto, não de arquitetura: vale a pena ligar essa rota (nova funcionalidade: editar instituição) ou apagar o código morto? Fica em aberto — ver `CHECKLIST-REFATORACAO-BACKEND.md`.

**Resultado:** 211 testes passando (29 novos: 2 arquivos de schema, 2 de repository, 5 de service), `tsc --noEmit` limpo, `eslint` sem erro novo (0 erros, 40 avisos). 2 dos 3 módulos do grupo fechados de verdade (Equipamento, InformacoesSetor) — o terceiro ficou documentado como achado à parte.

**Preenchendo o molde da narrativa:**

> Antes de escrever o schema Zod de Equipamento e InformacoesSetor, conferi se as rotas de Update realmente existiam — e não existiam, mesmo com o Frontend já chamando elas. Eram 404 silenciosos em produção, do tipo que só aparece quando alguém realmente tenta editar aquele registro. Corrigi as 2 rotas que faltavam, e no caminho achei mais dois bugs sem relação direta com Zod: um delete de equipamento que nunca funcionou (lia o id do lugar errado) e um erro de conflito que devolvia 500 em vez de um status que fizesse sentido. Também achei um terceiro módulo com o mesmo formato de bug (Update sem rota) que, ao investigar o Frontend, não tinha usuário nenhum esperando por ele — decidi documentar como código morto em vez de inventar uma rota nova sem ninguém ter pedido.

---

## Oitavo passo: generalizando as 13 tabelas de lookup de `status_categorias` — 15/09/2026

Depois de Equipamento e InformacoesSetor, sobrava o grupo grande: ~15 módulos de `status_categorias` que só existem pra dar nome a um status/categoria (`statusCompras`, `tarefa`, `tipodeChamado`, etc.). Antes de repetir o rollout módulo por módulo mais 13 vezes, conferi o `schema.prisma` de cada um — e são **literalmente o mesmo model**: `{ id, name, created_at?, updated_at?, uma relação reversa }`, sem nenhuma FK própria pra validar. Repetir o padrão 13 vezes seria copiar-colar disfarçado de trabalho.

**A decisão de pleno aqui não foi "aplicar o padrão", foi "não aplicar o padrão 13 vezes".** Em vez de 13 schemas + 13 repositories + 13 services quase idênticos, escrevi um de cada:

- `src/schemas/lookupCategoria.schema.ts` — um schema só (`{ name: string }`), reaproveitado nas 13 rotas de Create.
- `src/repositories/LookupCategoriaRepository.ts` — um Repository só, parametrizado pelo **nome do model** no construtor (`new LookupCategoriaRepository("tarefa")`). Por dentro ele acessa `prismaClient[nomeDoModel]` — só funciona porque todos os 13 models têm exatamente a mesma forma de `create`/`delete`.
- `src/services/status_categorias/CreateLookupCategoriaService.ts` e `DeleteLookupCategoriaService.ts` — dois Services só, cada Controller passando o Repository já configurado com o model certo.

Resultado: 13 controllers ficaram finos (a única diferença entre eles agora é **qual model** passam pro Repository), e os 14 Services antigos (13 Create + 1 Remove) foram apagados de vez — não deixei nenhum arquivo morto pra trás, porque nada mais os referenciava.

**Achados no caminho, sem relação direta com Zod/Repository:**

- `CreatestatusControlledeLaboratorioController` tinha um método `hadle` (typo) — e `routes.ts` chamava `.hadle()` na mesma grafia errada. Funcionava só porque os dois lados combinavam; teria quebrado silenciosamente na próxima pessoa que "corrigisse" um dos dois lados sem notar o outro. Corrigido nos dois ao mesmo tempo.
- **`GET /list/tipo/equipamento` nunca existiu em `routes.ts`, mas o Frontend já chama exatamente essa rota** (`EditEquipamentoForm.tsx`, pra popular o dropdown de "Tipo de Equipamento" no formulário de editar equipamento) — e quem escreveu esse código no Frontend **já desconfiava**: o `.catch()` da chamada tem o comentário `"Rota de tipos não encontrada ou erro (404 provável na Vercel)"`. Ou seja, o dropdown nunca mostrou nenhuma opção em produção, e a pessoa que escreveu already sabia que provavelmente não funcionava, só não chegou a confirmar nem consertar. Corrigido: rota adicionada com o path exato que o Frontend espera.
- A rota de Create desse mesmo módulo (`tipodeEquipamento`) não tem nenhum caller no Frontend — deixada sem rota de propósito, mesma lógica do achado do `InstituicaoUnidade` no passo anterior: não inventar rota nova sem alguém ter pedido.

**Sobre a contagem de `try/catch` antigo — uma correção do próprio processo, não só do número:** o commit desse passo registrou "de 10 pra 3 arquivos", mas isso está **errado** — conferindo de novo, nenhum dos 13 controllers desse grupo tinha o padrão antigo de `try/catch` pra começar (eram só `const {name} = req.body` direto, sem captura de erro nenhuma). A contagem de `try/catch` **continua em 10** depois deste passo — o que mudou aqui foi Zod/Repository, não tratamento de erro. Isso só apareceu porque, dessa vez, não rodei o mesmo script de contagem de outras vezes antes de escrever o commit — lição registrada pra não repetir: sempre rodar a contagem de novo antes de afirmar um número, não assumir que "mexi nesses arquivos" implica "mudei a contagem".

**Resultado:** 221 testes passando (10 novos — bem menos que os rounds anteriores, porque o objetivo de generalizar é justamente esse: 1 schema + 1 repository + 2 services bem testados cobrem os 13 módulos, em vez de 13 arquivos de teste quase idênticos), `tsc --noEmit` limpo, `eslint` sem erro (28 avisos, caiu de 40 porque os 14 arquivos apagados levaram avisos de `no-unused-vars` junto).

**Preenchendo o molde da narrativa:**

> Encontrei 13 módulos de `status_categorias` com o mesmo formato exato de model — só `name`. Em vez de aplicar o rollout de Zod/Repository 13 vezes (a opção "óbvia", só copiar o que já tinha funcionado nos módulos anteriores), escrevi uma versão genérica: um schema, um Repository parametrizado pelo nome do model, dois Services. O trade-off foi um pouco mais de abstração (o Repository não sabe de antemão qual model vai receber) em troca de eliminar ~26 arquivos que seriam só repetição. No caminho, achei uma rota que o Frontend já chamava e nunca existiu no backend — outro 404 silencioso, dessa vez com o desenvolvedor original já desconfiando no próprio comentário do código.

---

## Nono passo: fechando os 2 achados de código morto — 15/09/2026

Os 2 controllers sem rota do passo anterior (`UpdateInstituicaoUnidadeController.ts`, `CreateTipodeEquipamentoController.ts`) não eram meus pra decidir sozinho — é decisão de produto (ligar uma rota nova é adicionar funcionalidade, não só corrigir bug). Perguntei direto, opção por opção (ligar / apagar / deixar como está), pros dois separadamente. Resposta pros dois: **ligar**.

- **TipodeEquipamento (Create):** trivial — o controller já tinha sido convertido pro `CreateLookupCategoriaService` genérico no passo anterior, só faltava a linha `privateRouter.post('/tipodeequipamento', ...)` em `routes.ts`.
- **InstituicaoUnidade (Update):** precisou do tratamento completo, porque esse módulo não fazia parte do grupo de lookup (tem FK própria — `tipodeInstituicaoUnidade_id`). Schema novo (`instituicaoUnidade.schema.ts`), Repository novo (`InstituicaoUnidadeRepository.ts`), e o arquivo **movido** de `controllers/status_categorias/tipodeInsituicaoUnidade/` (onde nunca fez sentido morar) pra `controllers/status_categorias/instituicaoUnidade/`, ao lado do Create/List/Remove que já existiam ali. Protegido com `can(['ADMIN'])` — mesmo nível do Remove, porque editar os dados de uma instituição é sensibilidade parecida com apagar uma.

**Por que confirmar "ao vivo" antes de dar como fechado:** `tsc`/`eslint`/testes provam que o código compila e a lógica unitária está certa, mas não provam que a rota está de fato acessível pelo Express. Subi o servidor (`ts-node-dev`) e bati nas duas rotas sem token — as duas devolveram `401` (bloqueadas pelo `isAuthenticated`, que só roda se a rota **existir**), não um `404` de rota inexistente. É a diferença entre "o TypeScript não reclamou" e "eu testei que funciona".

**Resultado:** 227 testes passando (6 novos), `tsc --noEmit` limpo, `eslint` sem erro novo. Com isso, `status_categorias` não tem mais nenhum achado de código morto pendente de decisão — o que resta do grupo é só rollout normal (Zod/Repository nos módulos que ainda faltam).

---

## Décimo passo: fechando OrdemdeServico por completo — 22/09/2026

Depois de terminar a cobertura E2E (item 7), voltei pro item 1 — e em vez de abrir módulo novo, terminei o que já tinha começado semanas atrás: OrdemdeServico só tinha o piloto Create/Update modernizado; as outras 7 rotas (List por id, List por status, List por técnico, os 6 endpoints de controle de tempo, e os 3 de assinatura) continuavam no padrão antigo. Escolhido por já ter o contexto inteiro na cabeça — schemas, bugs conhecidos, `authorizeOwnership` — de ter acabado de escrever os testes E2E desse módulo no dia anterior.

**List/Get, sem achado de bug — só dívida de validação:** `ListByStatusTicketsController` e `ListByTecnicosTicketsController` nunca tinham validação nenhuma nos query params — um `statusOrdemdeServico_id`/`tecnico_id` vazio ou mal formado ia direto pro Prisma sem barrar em lugar nenhum antes. `listByStatusQuerySchema`/`listByTecnicoQuerySchema` novos, `validate(schema, 'query')` nas duas rotas. O `GetOrdemdeServicoByIdController` ganhou `OrdemdeServicoRepository.findById()` e `NotFoundError` no lugar do `if (!ordem) return res.status(404)` manual — a rota já tinha `validate(idParamSchema, 'params')` desde o piloto original, só a Controller/Service/Repository que faltava. Os 3 Services antigos (`LitsOrdemdeServicoId.ts` — o typo no nome do arquivo já era um sinal — `ListOrdemdeServicoStatusService.ts`, `ListOrdemdeServicoTecnicoService.ts`) apagados de vez.

**Controle de tempo — a máquina de estados nunca tinha passado por Zod nem por erro tipado:** os 6 endpoints (`iniciar`/`concluir`/`pausar`/`retomar`/`atualizar-tempo`/`tempo`) não tinham `validate(idParamSchema, 'params')`. No `TimeOrdemdeServicoService`, toda checagem de erro fazia `throw new Error("...")` com uma mensagem em texto, e o Controller decidia o status HTTP fazendo `error.message.includes("não encontrada") ? 404 : 400` — funcionava, mas é o tipo de acoplamento frágil que quebra silenciosamente se alguém reescrever a mensagem sem lembrar do `.includes()` que depende dela. Trocado por `NotFoundError`/`AppError` de verdade, e os 6 métodos do Controller viraram arrow functions sem `try/catch`, deixando o `errorHandler` global decidir o status — o mesmo padrão do resto do projeto, só que esse módulo específico nunca tinha passado por ele. Removidos de passagem uns `console.log` de debug (`⚠️ Status atual da OS`, `🟢 ID esperado`) que sobraram de uma investigação anterior.

**Assinatura — outro achado de código morto, dessa vez com nomes de arquivo enganosos:** antes de mexer, chequei se as 3 rotas/arquivos realmente estavam todos em uso — e não estavam. `routes.ts` importa `CreateAssinaturaController`, `SaveAssinaturaController` (de um arquivo chamado `GetAssinaturaController.ts` — o nome do arquivo não bate com o nome da classe que ele exporta) e `AssinaturaController` (de um arquivo chamado `saveAssinatura.ts` — de novo, nome trocado), mas só o terceiro é de fato registrado numa rota. Os outros dois — e o `CreatedAssinaturaService.ts` que só o primeiro usava — nunca foram chamados de lugar nenhum. Perguntei antes de decidir (mesmo processo do achado de 15/09): resposta foi apagar os 2 mortos e modernizar só o que sobrevive. `AssinaturaController` ganhou `assinaturaSchema`/`ordemIdParamSchema` novos e 3 métodos novos no `OrdemdeServicoRepository` (`existsById`, `findAssinatura`, `updateAssinatura`) — preservando a checagem de "a ordem existe" antes de gastar uma chamada de upload no Cloudinary, que o código original já fazia, só que direto contra o Prisma em vez de via repository.

**Resultado:** OrdemdeServico é o primeiro módulo do rollout **100% completo**, não só o piloto Create/Update. `try/catch` antigo (item 4) caiu de 10 pra **2 arquivos** — só `Eventos/EventosControllers.ts` e `fotoController.ts` restam no projeto inteiro. 228 testes unitários inalterados, 54 de integração/E2E inalterados (a suíte de tempo/listagem escrita no dia anterior passou sem qualquer ajuste, confirmando que o comportamento observável não mudou pro cliente HTTP — só a implementação por trás). `tsc --noEmit` limpo, `eslint` caiu de 26 pra 24 avisos (os 2 arquivos mortos apagados levaram `no-unused-vars` junto).

---

## Décimo primeiro passo: fechando o item 4 — Eventos e fotoController — 22/09/2026

Últimos 2 arquivos com o `try/catch` antigo no projeto inteiro: `Eventos/EventosControllers.ts` (módulo de calendário, nunca tinha visto Zod) e `fotoController.ts` (o `handle` já tinha passado pelo rollout de fila em 14/09, mas ainda estava com `try/catch` em volta; `listByOrdem`/`delete` nunca foram tocados).

**Eventos, o primeiro achado real do passo:** `Event` (schema.prisma) usa `id Int @id @default(autoincrement())`, não uuid — diferente de todo o resto do projeto. Isso quebra a suposição implícita de reaproveitar `idParamSchema` (que valida uuid) sem checar primeiro — precisou de um schema próprio, `eventoIdParamSchema`, com `z.coerce.number().int().positive()`. Segundo detalhe que só apareceu lendo o controller com atenção: o Update desse módulo (`PUT /events`) recebe o `id` pelo **body**, não por `:id` na URL como todo o resto — mantido assim de propósito (não é bug, é só um contrato diferente que o Frontend já usa) em vez de "corrigir" pra bater com o padrão dos outros módulos.

```ts
// evento.schema.ts — dois schemas de id diferentes na mesma rota
const eventoIdParamSchema = z.object({ id: z.coerce.number().int().positive() }); // DELETE /events/:id
const updateEventoSchema = z.object({ id: z.coerce.number().int().positive(), ... }); // PUT /events (id no body)
```

`EventoRepository.ts` novo, `EventoService`/`EventosController` viraram classe fina (o Controller antigo exportava 4 funções soltas, cada uma com seu próprio `try { ... } catch { res.status(500)... }` genérico — nenhuma delas diferenciava "não achei o evento" de "erro de banco", tudo virava 500 igual).

**fotoController, o segundo achado — um teste que precisou mudar de forma, não só de asserção:** o `handle` tinha uma checagem "arquivo não enviado" que devolvia `res.status(400)` direto, testada num teste unitário que chama `controller.handle(req, res)` cru (sem passar pelo Express de verdade). Trocar isso por `throw new ValidationError(...)` — o padrão certo, que deixa o `errorHandler` decidir o status — quebra esse teste, porque agora `handle` rejeita a Promise em vez de chamar `res.status`. O teste foi reescrito pra `await expect(controller.handle(...)).rejects.toThrow(...)`. Um segundo teste, que cobria "falta `ordemdeServico_id`", foi **removido** do unitário — essa validação virou responsabilidade do `fotoSchema` (Zod) na rota, e o padrão já estabelecido no resto do projeto é testar validação de payload em E2E (via `validate()`), não simulando a chamada crua ao Controller. Como o fluxo de upload/fila está fora do escopo de E2E por decisão já registrada (custo de infra: precisaria de Redis + worker rodando), esse caminho específico (422 por falta de `ordemdeServico_id`) ficou sem teste automatizado por enquanto — um gap pequeno, mas real, que vale lembrar se algum dia o upload entrar no escopo de E2E.

`FotoOrdemServicoRepository.ts` novo (`findByOrdem`, `findById`, `delete`), `NotFoundError` no lugar do `if (!foto) return res.status(404)` manual em `delete`.

**Resultado:** o item 4 (`try/catch` antigo) está fechado — **zero arquivos** no projeto inteiro com esse padrão, contando desde os 10 do início do dia 15/09. 227 testes unitários (-1 líquido: 1 teste reescrito, 1 removido sem substituto), 54 de integração/E2E inalterados, `tsc` limpo, `eslint` caiu de 24 pra 20 avisos (os `try/catch` removidos também limpavam algumas variáveis `error` não usadas).

---

## Décimo segundo passo: Cliente, Setor, Tecnico — 22/09/2026

Escolha do próximo módulo desta vez veio de um agente: pedi um mapeamento de tudo que ainda faltava em `routes.ts` contra o que já tinha sido migrado. Cliente, Setor e Tecnico saíram como o grupo mais parecido entre si — CRUD simples, `prismaClient` direto no Service, sem Zod, sem Repository, sem try/catch (então não pesam no item 4, só no 1/3) — tratados como um lote só, mesmo raciocínio da generalização dos 13 lookups (`Oitavo passo`).

### Dois achados reais, os dois na mesma pergunta de sempre

Antes de escrever schema, a pergunta que já rendeu achado em quase todo passo anterior: "o Frontend chama alguma rota que a gente não tem?" Sim, duas vezes:

**`PATCH /cliente/:id`** — `EditClienteForm.tsx` (componente de editar cliente) chama essa rota há quem sabe quanto tempo, com um `alert()` explícito mostrando o erro pro usuário quando falha (`"Erro ao atualizar: ..."`). A rota nunca existiu em `routes.ts`. O mais interessante: **o código pra atender essa rota já existia pronto** — `UpdateClienteController.ts` e `UpdateClienteService.ts`, completos, com a lógica certa (recebe `id` do path, `name`/`cnpj`/`endereco`/`telefone` do body) — só nunca tinham sido importados nem registrados. Alguém escreveu o Controller e o Service, esqueceu (ou nunca chegou) de adicionar a linha em `routes.ts`. Mesmo formato exato do achado de `InstituicaoUnidade` em 15/09 — só que dessa vez com uma diferença: lá o código morto não tinha caller nenhum no Frontend (decisão de produto, "ligar ou apagar"); aqui o Frontend **já chama**, então não tem decisão pra fazer — é bug, não feature nova, ligar é a única opção sensata.

**`DELETE /deletecliente`** — `ClientesList.tsx` chama `DELETE /deletecliente/${clienteId}` (id no path). A rota só existia como `/deletecliente`, sem `:id`. Express faz *exact path matching* por padrão — uma rota registrada sem `:id` não casa contra `/deletecliente/<qualquer coisa>`, então a requisição nem chegava no Controller: 404 do próprio roteador do Express, antes de qualquer `isAuthenticated`/`can`/lógica de negócio rodar. Corrigido adicionando `:id` na declaração da rota e trocando o Controller de `req.query.cliente_id` pra `req.params.id`.

```ts
// antes — nunca casava contra /deletecliente/<uuid>
privateRouter.delete('/deletecliente', can(['ADMIN']), new RemoveClienteController().handle)

// depois
privateRouter.delete('/deletecliente/:id', can(['ADMIN']), validate(idParamSchema, 'params'), new RemoveClienteController().handle)
```

Os dois ganharam teste E2E de regressão dedicado (`cliente.e2e.test.ts`) — não só o caminho feliz, mas o cenário exato que estava quebrado (editar de verdade muda o dado no banco; apagar de verdade remove a linha).

### Um quase-achado que a checagem no Frontend descartou

`RemoveTecnicoController` lê `req.query.tecnico_id`, mesmo a rota (`DELETE /removertecnico/:id`) declarando `:id` no path — pareceu, à primeira vista, o mesmo bug do Cliente. Mas checando os 2 lugares que chamam essa rota no Frontend (`TecnicoList.tsx`, `TicketsList.tsx`), os dois mandam o id **nos dois formatos ao mesmo tempo**: no path da URL *e* como `params: { tecnico_id }` do axios (que o axios serializa como query string). Ou seja, `req.query.tecnico_id` sempre recebeu o valor certo — o bug nunca se manifestou na prática, porque o Frontend compensava (provavelmente sem querer — parece sobra de uma versão anterior da chamada, de antes da rota ganhar `:id`) mandando os dois. **A lição aqui não é "não tinha bug, ok, próximo"** — é que a mesma forma de código (rota com `:id`, controller lendo query) pode ou não ser um bug dependendo inteiramente do que o caller manda, e só dá pra saber checando, não só lendo o Backend isolado. Limpei mesmo assim, trocando pra `req.params.id` — mais correto, e não quebra os 2 callers, que já mandam o id no path de qualquer jeito.

### Tecnico manteve o cache, só trocou o que tem por baixo

`ListTecnicoService`/`CreateTecnicoService`/`RemoveTecnicoService` já tinham cache-aside com Redis (item 6, TTL 60s, invalidação ativa em create/remove) — isso não mudou. Só o acesso direto a `prismaClient.tecnico.*` virou `TecnicoRepository` por baixo. Isso quebrou o teste unitário existente (`ListTecnicoService.test.ts`), que mockava `prismaClient` inteiro via `vi.mock('../../../prisma', ...)` — o padrão de antes do Repository pattern existir no projeto. Reescrito pra usar um `TecnicoRepository` fake (objeto plano com os métodos mockados via `vi.fn()`), mesmo padrão usado em todo o resto do rollout desde o `Terceiro passo`.

### Achado fora do Backend, só registrado

Enquanto conferia os callers de delete de Cliente, apareceu um segundo componente de listagem (`ClienteMunicipalList.tsx`, tela diferente de `ClientesList.tsx`) cujo botão de apagar chama `/deletedesolicitacaodecompras/:id` — o endpoint de **outro módulo** (Solicitação de Compras), não o de Cliente. Parece um copy-paste de um componente de compras que esqueceram de ajustar. Essa rota existe e funciona no Backend (é a rota certa pra outra coisa) — não é um bug do Backend, é o Frontend chamando o endpoint errado. Fora do escopo deste repositório pra corrigir, só registrado aqui pra não se perder caso alguém pergunte "por que apagar cliente não funciona nessa tela específica".

### Resultado

3 módulos novos no rollout de Zod/Repository (30 no total). Um import morto a mais removido (`ListtipodeChamadoService`, direto em `routes.ts`, nunca usado lá — o Controller que precisa dele já importa por conta própria). 227 testes unitários (1 arquivo reescrito), 60 de integração/E2E (54 → 60), `tsc` limpo, `eslint` caiu de 20 pra 18 avisos.

---

## Décimo terceiro passo: EquipamentoEstabilizador — um bug de dado real, e um Promise.all que escondia o outro — 22/09/2026

Escolhido por ser pequeno (4 arquivos) mas com um achado real reportado por um agente de mapeamento: `CreateEquipamentoEstabilizadorService` gravava em `prismaClient.equipamento.create(...)`, enquanto `ListEquipamentoEstabilizadorService` sempre leu de `prismaClient.estabilizadores.findMany(...)`. Duas tabelas diferentes — o model `Equipamento` (genérico, com `instituicaoUnidade_id`/`tipodeEquipamento_id`) e o model `estabilizadores` (`{ id, name, patrimonio }`, exatamente o formato que o Create já recebia). Um estabilizador cadastrado pelo formulário nunca aparecia na própria listagem, nem ficava disponível como opção no formulário de registrar manutenção (`ControledeEstabilizadores`, que referencia `estabilizadores_id`, uma FK pra essa mesma tabela).

### O segundo bug, achado checando quem chama a rota

Antes de aplicar o fix, conferi no Frontend quem usa `GET /list/estabilizador` — e achei dois componentes diferentes chamando duas rotas diferentes:

```ts
// EditEstabilizadoresForm.tsx
api.get('/list/estabilizador', ...) // singular — existe

// FormularioControledeEstabilizadores.tsx
const [equipRes, statusRes, instRes] = await Promise.all([
  api.get("/list/estabilizadores", ...), // plural — NUNCA existiu
  api.get("/liststatus/estabilizadores", ...),
  api.get("/listinstuicao", ...)
]);
```

`GET /list/estabilizadores` (plural) nunca existiu em `routes.ts` — só a versão singular. Como as 3 chamadas estão dentro de um `Promise.all`, e `Promise.all` rejeita inteiro assim que **qualquer uma** das promises rejeita, o 404 da rota inexistente derrubava a resolução das 3 de uma vez — `equipamentos`, `statusEstabilizadores` e `instituicoes` ficavam todos como array vazio, e o único sinal era um `console.error("Erro ao buscar listas:", err)`, sem nada visível pro usuário. Na prática: **abrir a tela de registrar manutenção de estabilizador sempre mostrava os 3 dropdowns vazios**, e como os 3 campos são obrigatórios (`requiredFields` no `handleSubmit`), o formulário nunca conseguia ser preenchido — combinado com o primeiro bug (nada nunca sendo gravado na tabela certa, então a lista estaria vazia de qualquer jeito mesmo se a rota existisse), o recurso de "estabilizadores" como um todo parece ter estado quebrado de ponta a ponta.

**A lição de processo aqui:** o `Promise.all` que falha rápido é exatamente o tipo de padrão que transforma um 404 isolado (uma rota faltando) num sintoma que parece maior e mais confuso do que é (3 listas vazias ao mesmo tempo, sem pista de qual delas é a culpada) — vale lembrar na hora de debugar um "várias coisas pararam de funcionar juntas" no Frontend: às vezes é só uma promise arrastando as outras pro fundo.

### O fix

- `EstabilizadorRepository.ts` novo: `create()` agora grava em `prismaClient.estabilizadores`, não mais `prismaClient.equipamento`.
- `equipamentoEstabilizador.schema.ts` novo, Zod validando `name`/`patrimonio`.
- `GET /list/estabilizadores` (plural) adicionado como alias do mesmo `ListEsquipamentoEstabilizadorController` que já respondia a `/list/estabilizador` (singular) — sem duplicar lógica, só a rota extra.
- 3 testes E2E: um cria e confirma que aparece em `/list/estabilizador`, um confirma que a mesma criação aparece em `/list/estabilizadores` (a rota nova), um cobre a validação (422 sem patrimônio).

Limpeza no caminho: um import morto em `routes.ts` (`ListControledeEstabilizadoresService`, importado direto mas nunca usado ali — o Controller que precisa dele já importa por conta própria, mesmo padrão do achado do `ListtipodeChamadoService` no passo anterior).

227 testes unitários inalterados, `tsc`/`eslint` limpos (16 avisos, caiu de 18).

---

## Décimo quarto passo: os 7 endpoints Detail de `controles_forms` — 22/09/2026

Toda vez que um módulo de `controles_forms` foi migrado (`Quinto passo`, `Sexto passo`), o endpoint de Detail (`GET .../detail?controle_id=`) ficou de fora — não por decisão, só porque o foco era Create/Update/Delete. Ficaram pendurados: 7 controllers, todos no mesmo formato — query string sem `validate()`, Service com um `findUnique` + `include` direto no `prismaClient`, sem `try/catch` (então não contam pro item 4) mas sem Repository nem Zod (contam pro item 1/3).

### O "findUnique fantasma"

Cada um dos 7 módulos já tinha ganhado um Repository nos passos anteriores (`AssistenciaTecnicaRepository`, `LaudoTecnicoRepository`, etc.), e cada Repository já tinha um método `findUnique(id)` — escrito, mas com **zero chamadas em todo o projeto**. Um grep confirmou: nenhum Service, nenhum teste, nada usava esse método. Provavelmente sobrou de quando os Repositories foram criados, pensado pra um caso de uso que nunca chegou a ser escrito.

Isso simplificou o passo: em vez de criar um método novo, só adicionei o mesmo `include` que cada `DetailXService.ts` original já usava dentro desse `findUnique` que já existia:

```ts
// antes (AssistenciaTecnicaRepository.ts)
findUnique(id: string) {
  return prismaClient.controleDeAssistenciaTecnica.findUnique({ where: { id } });
}

// depois — o include veio direto do DetailAssistenciaTecnicaService.ts original
findUnique(id: string) {
  return prismaClient.controleDeAssistenciaTecnica.findUnique({
    where: { id },
    include: { statusReparo: true },
  });
}
```

Resposta idêntica a antes — só que agora passando pelo Repository, testável com um fake em vez de mockar o Prisma.

### Um schema só pra 6 dos 7

6 módulos (AssistenciaTecnica, LaudoTecnico, Laboratorio, MaquinasPendentesLab, MaquinasPendentesOro, DocumentacaoTecnica) usam exatamente `?controle_id=` — schema único, `controleIdQuerySchema`, adicionado em `common.schema.ts` ao lado do `idParamSchema` que já morava lá (mesmo raciocínio: parou de fazer sentido duplicar assim que o segundo módulo precisou). O sétimo, `SolicitacaoCompras`, usa `?compra_id=` — schema próprio (`detailComprasQuerySchema`) no arquivo do módulo.

### Uma decisão que ficou de propósito diferente do resto do projeto

O comportamento de "id não encontrado" nesses 7 endpoints sempre foi `200` com corpo `null` — nunca um `404`. Isso é diferente do padrão adotado no resto do rollout (`NotFoundError` → 404, ver `GetOrdemdeServicoByIdController` por exemplo). Decidi **não mudar isso agora**: alterar o status de resposta é uma mudança de contrato pra quem já consome essas 7 rotas, não uma modernização estrutural — o pedido aqui era aplicar Zod/Repository, não redesenhar comportamento de API sem ninguém ter pedido. Registrado explicitamente aqui (e no checklist) pra ficar claro que é uma decisão, não um esquecimento — se algum dia fizer sentido padronizar, é um passo separado, com o próprio "por que agora" dele.

### Testes: 2 representativos, não 7

Mesmo raciocínio do `Oitavo passo` (generalização dos lookups): os 7 módulos são estruturalmente idênticos, então 2 testes E2E bastam pra provar o padrão — um com relação incluída (AssistenciaTecnica, prova que o `include` sobreviveu à migração) e um com nome de query diferente (SolicitacaoCompras, prova que o schema por-módulo funciona), mais 422 de validação e o "200 com null" preservado.

### Resultado

227 testes unitários inalterados, 67 de integração/E2E no total (63 → 67), `tsc`/`eslint` limpos.

---

Checklist de estado atual e ordem de prioridade: `CHECKLIST-REFATORACAO-BACKEND.md`. Conceito (validação na borda, parse-don't-validate): `ROADMAP-PLENO.md`, glossário item 2.
