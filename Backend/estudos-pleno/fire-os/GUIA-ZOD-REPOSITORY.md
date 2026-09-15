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

Checklist de estado atual e ordem de prioridade: `CHECKLIST-REFATORACAO-BACKEND.md`. Conceito (validação na borda, parse-don't-validate): `ROADMAP-PLENO.md`, glossário item 2.
