# Guia de Testes de Integração e E2E — e o bug que eles acharam

Documento separado dos outros guias, mesmo espírito: o relato completo de como a infraestrutura de testes de integração/E2E foi montada (item 7 do checklist, a parte "cara" que ficou pra depois de propósito), e — mais importante — o bug crítico que o primeiro teste E2E achou assim que existiu.

---

## O que foi montado

**TestContainers + Prisma**, não o Postgres do `docker-compose.yml` local: um Postgres efêmero sobe do zero a cada rodada de `npm run test:integration`, o `globalSetup` (`src/test/integration/globalSetup.ts`) roda `prisma db push` nele, e o container morre no final. Por quê não usar o Postgres local: o `.env` do projeto aponta `DATABASE_URL` pro **Neon** (um Postgres remoto, tipo produção) — se o teste conectasse "no banco configurado" sem cuidado, ele bateria no banco de verdade. TestContainers elimina esse risco por construção: o teste cria o próprio banco, ninguém precisa lembrar de apontar pra um lugar seguro.

**Supertest**, pra E2E de verdade: em vez de chamar `new AuthUserService().execute(...)` direto (isso é o que os testes unitários já fazem, com repository fake), o teste E2E bate no `app` do Express via HTTP (`supertest(app).post('/session').send(...)`) — passa por `routes.ts`, o middleware `validate()` do Zod, o Controller, o Service, o Postgres real, e o `errorHandler` global. Prova o contrato inteiro, não só a lógica de negócio isolada.

**Achado no caminho, antes mesmo de rodar o primeiro teste:** `server.ts` fazia `app.listen(3334)` direto no mesmo arquivo que definia `app` — importar esse módulo pra testar (sem querer abrir uma porta de verdade) já seria estranho. Separado em dois arquivos: `src/app.ts` (só o Express, sem `.listen()`, importável livremente) e `src/server.ts` (importa `app`, só chama `.listen()`). Nesse mesmo passo, achei que `app.ts`/`server.ts` **nunca carregavam o `.env`** — só os scripts de fila (`uploadWorker.ts` etc.) tinham `import "dotenv/config"`. Isso significa que rodar `npm run dev` localmente (fora do Docker) sempre dependeu de alguém já ter as env vars definidas em outro lugar — se essa é a causa do erro "Prisma did not initialize" mencionado antes no `ROADMAP-PLENO.md`, faz sentido. Corrigido: `app.ts` agora importa `dotenv/config` também.

---

## O achado: um bug crítico, presente desde o primeiro piloto, achado só agora

O primeiro teste E2E escrito (login, `POST /session`) devolvia **500** em todos os cenários — sucesso, senha errada, email inexistente — quando o esperado era 200/401/401. Rastreei o erro real:

```
TypeError: Cannot read properties of undefined (reading 'execute')
    at handle (AuthUserController.ts:9:37)
```

**O mecanismo, sem pressa:** todo controller "fino" deste projeto (o padrão usado desde o primeiro piloto de OrdemdeServico) tem essa forma:

```ts
class AuthUserController {
  constructor(private service: AuthUserService = new AuthUserService()) {}

  async handle(req: Request, res: Response) {
    const auth = await this.service.execute(req.body); // <- this
    return res.json(auth);
  }
}
```

E `routes.ts` registra ele assim: `publicRouter.post('/session', new AuthUserController().handle)`.

O problema: `new AuthUserController().handle` **extrai o método do objeto** — vira só uma função solta, sem lembrar de qual instância ela veio. O Express guarda essa função solta e, quando a requisição chega, chama ela assim: `handle(req, res, next)` — nunca `instancia.handle(req, res, next)`. Dentro de `handle`, `this` não é a instância do controller — é `undefined` (JavaScript em modo estrito, que é o que TypeScript compila). `this.service` então lança exatamente o erro acima.

**Confirmado com uma reprodução isolada**, sem nenhum código do projeto — só Express + supertest puro — antes de mexer em qualquer arquivo, pra ter certeza absoluta que não era um problema de configuração de teste:

```js
class Foo {
  constructor(x = 5) { this.x = x; }
  handle(req, res) { res.end(String(this.x)); } // this.x
}
app.get("/test", new Foo().handle);
// GET /test -> 500, "Cannot read properties of undefined (reading 'x')"
```

### Por que isso passou despercebido em TODOS os testes unitários já escritos

Os testes unitários deste projeto sempre chamam o controller assim:

```ts
const controller = new CreateEquipamentoController(fakeService);
await controller.handle(req, res); // instancia.handle(...) — this funciona
```

Isso **sempre** funciona, porque `handle` está sendo chamado a partir da própria instância — `this` fica correto. **Nenhum teste unitário deste projeto exercita o caminho real do Express** (`router.post(path, fn)` seguido de uma chamada HTTP de verdade), porque nenhum deles usava supertest antes desse guia. É exatamente esse buraco que a pirâmide de testes prevê: unit prova a lógica isolada, mas só integração/E2E prova o contrato real com a peça de fora — nesse caso, a peça de fora nem era o banco, era o próprio framework HTTP.

### O alcance: 48 arquivos, não só o login

Rodei a mesma busca (arquivo que usa `this.*` **e** declara `handle` como método comum, não arrow function) em todo `src/controllers` e `src/services`:

```bash
comm -12 \
  <(grep -rl "this\." src/controllers src/services | sort) \
  <(grep -rl "async handle(" src/controllers src/services | sort)
```

**48 controllers** vieram com o mesmo problema — incluindo o pilotão original (`UpdateOrdemdeServicoController`, `UpdateUserController`), o rollout de `controles_forms` inteiro, Equipamento/InformacoesSetor, os 13 módulos de lookup, e o `InstituicaoUnidade` recém-ligado. Ou seja: **isso não é um bug desta sessão** — é um problema estrutural presente desde o primeiro piloto de Zod/Repository, semanas atrás, que nunca foi pego porque nenhum teste até hoje realmente chamava uma rota via HTTP de ponta a ponta.

### O fix

Trocar o método comum por uma **arrow function como campo da classe** — em vez de morar no prototype (que perde o `this` quando extraído), ela mora na própria instância e já nasce com o `this` certo, capturado do construtor:

```ts
class AuthUserController {
  constructor(private service: AuthUserService = new AuthUserService()) {}

  handle = async (req: Request, res: Response) => { // era "async handle(...)"
    const auth = await this.service.execute(req.body);
    return res.json(auth);
  }
}
```

Sem mudar assinatura, sem mudar `routes.ts` — `new AuthUserController().handle` agora funciona porque `handle` é uma propriedade da instância (uma arrow function fechada sobre o `this` de quando o construtor rodou), não mais um método do prototype.

Aplicado com um script (não arquivo por arquivo na mão — eram 48, e a mudança é textualmente idêntica em todos): `sed` trocando a linha `async handle(req: Request, res: Response) {` por `handle = async (req: Request, res: Response) => {` nos 48 arquivos.

### A guarda de regressão

Não bastava corrigir — escrevi um teste (`src/test/structural/controllerHandleBinding.test.ts`) que varre todo `Controller` do projeto e falha se algum voltar a usar `this` dentro de um `handle` declarado como método comum. Validei que ele realmente pega o problema: reintroduzi o bug de propósito num arquivo, rodei o teste, vi ele falhar, desfiz, vi ele passar de novo. Isso garante que ninguém (nem eu, numa sessão futura) reintroduza esse padrão sem perceber.

---

## Preenchendo o molde da narrativa

> Ao escrever o primeiro teste E2E de verdade do projeto (login via HTTP, não a chamada direta do Service), encontrei um bug crítico presente desde o primeiro piloto de Repository/Zod, semanas atrás: todo controller registrado como `new Controller().handle` perde o `this` quando o Express chama o handler, porque extrair um método de uma instância descola ele do objeto que o criou. Isso afetava 48 arquivos — qualquer rota "modernizada" quebrava com 500 assim que alguém realmente a chamasse além do que os testes unitários (que sempre chamam o método já vinculado à instância) conseguiam enxergar. Corrigi todos convertendo o método pra uma arrow function como campo de classe, e escrevi um teste estrutural que impede essa regressão de voltar. O trade-off que aceitei: descobrir isso só agora, meses depois do primeiro piloto, é o preço de ter deixado testes de integração/E2E pro final da lista de prioridades — a decisão de adiar foi certa (é caro, tem coisa mais barata primeiro), mas o achado prova exatamente por que a pirâmide de testes completa importa, não só a base.

---

Checklist de estado atual: `CHECKLIST-REFATORACAO-BACKEND.md`. Conceito de pirâmide de testes: `ROADMAP-PLENO.md`, glossário item 8.
