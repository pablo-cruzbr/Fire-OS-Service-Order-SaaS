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
- [ ] Replicar pros outros módulos conforme o rollout de Zod for avançando (decidido: junto, não separado — cada módulo novo já nasce com Controller fino + Service + Repository).

---

Checklist de estado atual e ordem de prioridade: `CHECKLIST-REFATORACAO-BACKEND.md`. Conceito (validação na borda, parse-don't-validate): `ROADMAP-PLENO.md`, glossário item 2.
