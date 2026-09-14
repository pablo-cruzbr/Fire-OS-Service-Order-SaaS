# Guia de CI (Lint + Type-check) no Fire OS

Documento separado do `ROADMAP-PLENO.md`, mesmo espírito dos outros guias: o relato completo de como o fail-fast (tipo + lint antes do teste) foi implementado, num lugar só. O conceito básico (CI vs. CD) continua no `ROADMAP-PLENO.md`, glossário item 4 — aqui é o "o que eu de fato fiz", explicado em pedaços pequenos.

---

## O que foi implementado (ESLint + fail-fast no CI) — 14/09/2026

### Pedaço 1 — o que é "lint", numa frase

Lint é um corretor ortográfico, só que pra código em vez de texto. Ele não roda o programa — só *lê* o código e aponta padrão suspeito: uma variável que você criou e nunca usou, um `import` que sobrou de um código que você já apagou, um jeito de escrever que o próprio time decidiu evitar. Ele não sabe se a lógica está certa (isso é trabalho do teste); só sabe se o código está "arrumado".

### Pedaço 2 — por que 3 steps separados no CI, e não só 1

Antes, o `test.yml` só tinha um step: `npm run test`. Agora tem três, nessa ordem:

```yaml
- run: npm run typecheck   # tsc --noEmit — só confere tipo, não gera nada
- run: npm run lint        # eslint . — só confere "arrumação"
- run: npm run test        # só agora roda a suíte de teste de verdade
```

A ordem não é aleatória: `typecheck` e `lint` rodam em **segundos**, sem precisar montar mock nenhum. `test` sobe todo um ambiente simulado e roda 58+ testes — é mais lento. Se um PR tiver um erro de tipo bobo (um campo que não existe mais), a ideia de **fail-fast** é descobrir isso no step de segundos, não esperar o step mais lento rodar por nada.

### Pedaço 3 — o que eu de fato instalei e criei

1. `npm install -D eslint typescript-eslint` — as duas dependências. `typescript-eslint` é o pacote oficial que ensina o ESLint (que originalmente só entende JavaScript) a entender TypeScript.
2. `Backend/eslint.config.mjs` — o arquivo de configuração (formato novo do ESLint, chamado "flat config"). É aqui que fica a regra "o que é erro, o que é aviso, o que eu ignoro".
3. Dois scripts novos no `package.json`: `"typecheck": "tsc --noEmit"` e `"lint": "eslint ."`.
4. Dois steps novos no `.github/workflows/test.yml`, antes do `npm run test`.

### Pedaço 4 — o achado real ao rodar pela primeira vez (o "gotcha")

Rodei `npx eslint .` pela primeira vez, sem ignorar nada ainda, só pra ver o tamanho do problema — e o resultado foi **2153 problemas, 1452 deles erro**. Isso bateria exatamente no aviso que já estava escrito no `GUIA-PRIORIZACAO-PROXIMOS-PASSOS.md`: *"o primeiro `npx eslint .` provavelmente reprova o repo inteiro de uma vez"*.

Só que, olhando de perto **onde** esses erros estavam, quase todos vinham de uma pasta só: `@prisma/client/runtime/*.js` — esse não é código que você escreveu, é o *client* que o Prisma gera automaticamente (`npx prisma generate`) e que, nesse projeto, é salvo dentro do próprio repo (`output` customizado no `schema.prisma`), em vez de ficar escondido dentro de `node_modules` como o padrão. O ESLint não sabia que devia ignorar isso, então estava "corrigindo a ortografia" de um texto escrito por outra pessoa (o próprio Prisma), não pelo seu código.

Depois de adicionar `@prisma/**` na lista de pastas ignoradas (`ignores` no `eslint.config.mjs`), sobrou isso, que é código de verdade do projeto:

```
36 problemas — 0 erros, 36 avisos (tudo @typescript-eslint/no-unused-vars)
```

**A lição de pleno aqui não é "instalei o ESLint"** — é: antes de configurar a regra certa, você precisa primeiro entender *de onde* vêm os problemas que apareceram, porque um número gigante quase sempre significa "estou lintando algo que não deveria", não "meu código está uma bagunça".

### Pedaço 5 — por que os 36 avisos viraram "warning", não "error"

Esses 36 são reais — variáveis e `import`s que existem no código mas nunca são usados (ex.: `interface StatusComprasRequest` declarada e nunca referenciada). Eu **não** apaguei nenhum agora, e configurei a regra (`no-unused-vars`) como `warn`, não `error`, de propósito:

```js
// eslint.config.mjs
rules: {
  "@typescript-eslint/no-unused-vars": "warn", // não trava o CI
}
```

O motivo é o mesmo princípio do rollout incremental (`GUIA-PRIORIZACAO-PROXIMOS-PASSOS.md`): o projeto tem ~110 controllers que nunca passaram por lint nenhum. Se eu configurasse como `error` agora, o CI ficaria vermelho a partir do primeiro PR, obrigando a limpar 36 avisos numa tacada só, sem relação com o que a próxima mudança de verdade seria. Como `warning`, o CI já protege contra problema **novo** que quebra o build (`tsc`) ou é claramente perigoso, sem travar por dívida antiga que ainda não foi a vez de pagar.

### Pedaço 6 — os 2 erros de verdade que corrigi no caminho

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

### Resultado

`npx tsc --noEmit` limpo, `npx eslint .` com 0 erros (36 avisos conhecidos e aceitos por ora), 58 testes ainda passando — e agora **automaticamente**, a cada push/PR, antes mesmo do teste rodar.

**Preenchendo o molde da narrativa:**

> O CI só rodava teste — um erro de tipo ou um `require` misturado com `import` podia ficar verde do mesmo jeito, desde que os testes mockados não pegassem. Configurei ESLint pela primeira vez no projeto; a primeira rodada devolveu mais de 1400 "erros", mas investigando a origem vi que quase todos vinham do client do Prisma gerado dentro do repo, não do meu código — ignorei essa pasta e sobrou uma lista pequena e real. Considerei já deixar tudo como erro no CI, mas isso pararia o primeiro PR por causa de 36 avisos antigos sem relação com a mudança. Optei por `warn` pros avisos de dívida existente e `error` só pro que quebra de verdade (tipo, `require` misto) — troquei "zerar tudo agora" por "não deixar entrar problema novo, arrumar o resto aos poucos", mesmo princípio do rollout incremental do resto do checklist.

---

## CD: o outro lado da moeda, visto no Encurtador (`../projeto-encurtador/PROJETO-ENCURTADOR.md`)

CI (o que este guia cobre) não é a história inteira — CD é **automatizar o "colocar no ar"** também. O Fire OS hoje tem CD, só que **invisível**: a Vercel fica de olho no repo e faz o deploy sozinha a cada push, sem nenhum step no GitHub Actions cuidando disso. Funciona, mas você não escreveu esse pipeline — um serviço terceiro escreveu por você.

O `../projeto-encurtador/PROJETO-ENCURTADOR.md` (seção 7, "Camada de infraestrutura") propõe o oposto: um deploy que **você** configura e entende passo a passo. O **Serverless Framework** lê um arquivo (`serverless.yml`) descrevendo "isso é uma Lambda, essas são as rotas do API Gateway que apontam pra ela" — e um comando só (`npx serverless deploy`) empacota o código, sobe pra AWS, cria/atualiza a função e as rotas, tudo de uma vez. Colocado como último step de um workflow do GitHub Actions (depois do `test` passar), isso vira um pipeline de CI **+** CD completo, do jeito clássico que aparece em entrevista: "lint → type-check → test → build → deploy", todo automatizado, nenhum passo manual.

**A pergunta que vale saber responder numa entrevista:** "qual a diferença entre o CD da Vercel e o CD do Serverless Framework?" — a resposta não é "um é melhor", é **quem escreveu o pipeline**: a Vercel te dá CD de graça, em troca de menos controle e menos visibilidade de cada etapa; o Serverless Framework te dá controle total (você decide cada passo, pode adicionar validação no meio), em troca de você ter que configurar e manter isso. Saber nomear esse trade-off é exatamente o tipo de resposta que soa pleno, não júnior.

---

## O que ainda falta (próximos passos)

- [ ] Criar um segundo workflow para o `Frontend/` (hoje só o Backend tem CI).
- [ ] Ativar branch protection na `main` exigindo o workflow verde antes de merge — mesmo trabalhando sozinho, isso é um hábito que demonstra disciplina de squad.
- [ ] Se/quando construir o `../projeto-encurtador/PROJETO-ENCURTADOR.md`, montar o step de CD de verdade (`serverless deploy`) no GitHub Actions dele.

Checklist de estado atual: `CHECKLIST-REFATORACAO-BACKEND.md`. Conceito (CI vs. CD, fail-fast): `ROADMAP-PLENO.md`, glossário item 4.
