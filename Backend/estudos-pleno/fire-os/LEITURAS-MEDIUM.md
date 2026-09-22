# Leituras do Medium — pra entender o "porquê" por trás do checklist

Isso aqui não é teoria pesada, é uma lista de leitura de sofá. Cada seção pega um conceito que apareceu de verdade no `CHECKLIST-REFATORACAO-BACKEND.md` (ou nos `GUIA-*.md`) e te dá 2-3 artigos do Medium pra entender por que a decisão foi tomada, não só o que foi feito. Prioridade pra texto leve, com analogia boba e sem jargão gratuito — os mais "sérios" ficam de reserva, caso o leve deixe fome de mais detalhe.

Ordem: do que você pediu primeiro (SOLID) até o resto, mais ou menos na ordem que os itens aparecem no checklist.

---

## 1. SOLID — os 5 princípios que você nunca usou (mas já usa sem saber)

Onde aparece no seu projeto: toda vez que um `Service` recebe um `Repository` pelo construtor em vez de criar um `new PrismaClient()` sozinho, isso é Dependency Inversion (o "D" do SOLID) na prática — é literalmente o que o rollout inteiro do item 1 fez, módulo por módulo.

- **[SOLID Principles: A Funny Guide for Non-Techies](https://medium.com/@sumit-s/solid-principles-a-funny-guide-for-non-techies-25d8850abf9a)** — o mais leve dos três. Usa analogia de LEGO pra explicar Dependency Inversion. Comece por esse.
- **[Mastering SOLID Principles: A Beginner-Friendly Guide with Real-World Examples](https://onyxwizard.medium.com/mastering-solid-principles-a-beginner-friendly-guide-with-real-world-examples-09d925e18b93)** — passo além, com exemplo de código pra cada uma das 5 letras.
- **[SOLID Principles - simple and easy explanation](https://betterprogramming.pub/solid-principles-simple-and-easy-explanation-f57d86c47a7f)** — se sobrar dúvida depois dos dois primeiros, esse fecha com exemplos mais técnicos.

**Gancho pro seu código:** compare o `AssistenciaTecnicaRepository` (uma classe, uma responsabilidade — Single Responsibility) com o jeito que `CreateAssistenciaTecnicaService` recebe o Repository pronto em vez de instanciar o Prisma direto (Dependency Inversion). Você já fez isso ~30 vezes sem ter lido a teoria.

---

## 2. Repository Pattern — por que criar essa camada extra

Onde aparece: item 1 do checklist inteiro. É o padrão que te fez trocar "Service falando direto com `prismaClient`" por "Service falando com uma classe `XRepository`".

- **[The Repository Pattern — Build Scalable APIs](https://muyiwa-dev.medium.com/the-repository-pattern-ff87cde360ce)** — leitura rápida, direto ao ponto, exemplos em Node.
- **[Service–Repository Pattern in Action](https://medium.com/@albinaji.official/service-repository-pattern-in-action-0db4bb9a474b)** — mostra o trio Controller → Service → Repository lado a lado, exatamente a forma que seu projeto usa.
- **[Patterns — Generic Repository with TypeScript and Node.js](https://medium.com/@erickwendel/generic-repository-with-typescript-and-node-js-731c10a1b98e)** — esse é o mais próximo do seu `LookupCategoriaRepository` genérico (1 Repository parametrizado cobrindo as 13 tabelas de lookup).

**Gancho pro seu código:** o motivo real de ter feito isso não foi "boa prática" abstrata — foi pra trocar teste unitário mockando `prismaClient` inteiro por um repository fake simples (você mesmo viu a diferença reescrevendo o `ListTecnicoService.test.ts`).

---

## 3. Zod e "parse, don't validate" — por que não é só "checar se o campo veio"

Onde aparece: item 3, toda vez que você vê `validate(algumSchema)` em `routes.ts`.

- **[Stop Writing Validation Code. Start Using Zod.](https://medium.com/@ananyavhegde2001/stop-writing-validation-code-start-using-zod-b0c361da62db)** — o mais direto, contrasta "if a cada campo" com Zod.
- **[Zod: The Ultimate TypeScript-first Schema Validation Library](https://imrankhani.medium.com/zod-the-ultimate-typescript-first-schema-validation-library-93869bcde880)** — explica bem a ideia de "parse, don't validate": o schema não só valida, ele te devolve o dado já com o tipo certo.
- **[Zod: More Than Just Validation (Part 1/2)](https://medium.com/@cibilex/zod-more-than-just-validation-part-1-2-7d4cba13851c)** — pra quando quiser ver o `.transform()` em ação (o mesmo truque que virou o `tiposIds` de string-com-vírgula em array, no relatório da secretaria).

**Gancho pro seu código:** o `.transform()` do `relatorioSecretariaQuerySchema` — em vez de `if (!tiposIds) return res.status(400)`, o schema já entrega o array pronto. Isso é "parse, don't validate" na prática: o schema não só diz "tá válido", ele te dá o dado no formato que você realmente quer usar.

---

## 4. Dependency Injection — o nome chique pra "passa o negócio pelo construtor"

Onde aparece: todo `constructor(private repository: XRepository = xRepository)` que você escreveu esse mês inteiro.

- **[Dependency Injection in TypeScript: Simplified guide for beginners](https://medium.com/@DulanaSenavirathna/dependency-injection-in-typescript-simplified-guide-for-beginners-b5412886aa68)** — o mais amigável dos três, sem framework nenhum no meio.
- **[Dependency Injection Pattern — with TypeScript](https://ro-zcn.medium.com/dependency-injection-pattern-with-typescript-4c6d45bdd877)** — mostra o "antes" (classe cria a própria dependência) vs "depois" (recebe de fora), igual ao que você fez em cada rollout.

**Gancho pro seu código:** o valor default no construtor (`= xRepository`) é o truque que deixa você **não precisar mudar nenhuma chamada em produção** (`new XService()` continua funcionando igual), mas ainda assim consegue injetar um fake nos testes (`new XService(fakeRepository)`). Isso é DI sem precisar de nenhuma biblioteca de DI.

---

## 5. CASL / RBAC — a diferença entre "pode usar a rota" e "pode mexer NESSE registro"

Onde aparece: item 2, a peça que resolveu o achado mais grave do projeto (`user/update` sem dono nenhum) e o gap dos 3 módulos técnicos.

- **[What is CASL or how can you build a castle around your application?](https://medium.com/dailyjs/what-is-casl-or-how-can-you-build-a-castle-around-your-application-4d2daa0b1ab4)** — o título já avisa que é uma leitura mais leve, com a analogia do castelo.
- **[CASL. Permission management in express](https://medium.com/dailyjs/authorization-with-casl-in-express-app-d94eb2e2b73b)** — exemplo direto com Express, próximo do seu `authorizeOwnership.ts`.
- **[Demystifying Access Control: RBAC vs CASL](https://medium.com/@kathishcivil94/demystifying-access-control-rbac-vs-casl-in-nestjs-e1cde782e5c0)** — esse explica exatamente a diferença que seu projeto tem: `can.ts` decide "pode chamar a rota" (RBAC simples), CASL decide "pode mexer nesse registro específico" (ownership).

**Gancho pro seu código:** `can(['ADMIN'])` é RBAC puro (checa só o papel). `authorizeOwnership.ts` é CASL (checa se o `tecnico_id` do registro bate com o do usuário logado). São camadas diferentes, resolvendo perguntas diferentes — por isso o projeto usa os dois, não um só.

---

## 6. Middleware de erro centralizado — por que parar de escrever `try/catch` em todo controller

Onde aparece: item 4, `src/Middleware/errorHandler.ts`, e a novela dos 48 controllers com `try/catch` removidos.

- **[Express.js Error Handling: From Custom Errors to Enhanced Error Responses](https://medium.com/@ctrlaltvictoria/mastering-express-js-error-handling-from-custom-errors-to-enhanced-error-responses-5fda471d38d4)** — mostra a evolução de "catch em todo controller" pra "um handler global + classes de erro tipadas", exatamente o caminho que seu `AppError`/`NotFoundError`/`ValidationError` percorreu.
- **[Centralized Error Control in Express.js: A Complete Guide](https://medium.com/@ravipatel.it/centralized-error-control-in-express-js-a-complete-guide-code-981fbf253379)** — reforça o "por quê": erro tratado num lugar só é mais fácil de manter que 100 `catch` espalhados, cada um decidindo um status diferente.

**Gancho pro seu código:** lembra do achado do fotoController, onde o `handle` tinha um `catch` que sempre devolvia 400, mesmo quando o erro era um problema de infraestrutura (deveria ser 500)? É exatamente o tipo de bug que esses artigos descrevem como sintoma de handler descentralizado — cada `catch` "inventando" o status sozinho.

---

## 7. Cache-Aside com Redis — a ideia por trás do `ListOrdemdeServicoService`

Onde aparece: item 6, os `count()` de status cacheados por 30s.

- **[Understanding the Cache-Aside Pattern: A Practical Guide](https://medium.com/@mallik-tech-vision/understanding-the-cache-aside-pattern-a-practical-guide-0c368bc71875)** — a explicação mais simples: olha o cache primeiro, se não achar busca no banco e guarda pra próxima.
- **[Cache-Aside pattern — a how-to guide with .NET 8 and Redis](https://medium.com/@monkey-dev/cache-aside-pattern-a-how-to-guide-with-net-8-and-redis-2aa4f5b84381)** — a linguagem é diferente (.NET), mas o desenho do padrão é idêntico ao que você tem em TypeScript.

**Gancho pro seu código:** o achado do `enableOfflineQueue: false` (o Redis travando ~20-30s quando cai) é exatamente o tipo de detalhe que esses artigos costumam pular — eles explicam o caminho feliz (cache hit/miss), mas o "e se o Redis cair?" é o que separa um cache-aside de brinquedo de um de produção.

---

## 8. BullMQ — filas de trabalho, pra não travar o usuário esperando o Cloudinary

Onde aparece: item 5, o `fotoController` que responde 202 na hora e sobe a foto em segundo plano.

- **[BullMQ for Beginners: A Friendly, Practical Guide](https://hadoan.medium.com/bullmq-for-beginners-a-friendly-practical-guide-with-typescript-examples-eb8064bef1c4)** — TypeScript, exemplos mínimos, sem enrolação.
- **[Getting started with job queues with BullMQ](https://arie-m-prasetyo.medium.com/getting-started-with-job-queues-with-bullmq-3edcedc13f5e)** — explica bem a ideia central com uma frase simples: "em vez de fazer o trabalho na hora, você deixa um bilhete na fila dizendo 'alguém precisa fazer isso', e um worker separado pega esse bilhete e faz, no próprio ritmo dele."
- **[Mastering Job Queues with BullMQ in Node.js — A Beginner's Guide](https://medium.com/@gupta27/mastering-job-queues-with-bullmq-in-node-js-a-beginners-guide-3ae8ac19f008)** — cobre os casos de uso clássicos (enviar email, processar imagem) — a mesma categoria do seu upload de foto.

**Gancho pro seu código:** o `uploadWorker.ts` é literalmente esse "worker separado" que os artigos descrevem — roda num processo diferente da API, por isso precisou do volume `tmp_uploads` compartilhado no `docker-compose.yml` (containers diferentes não enxergam o disco um do outro por padrão).

---

## 9. Pirâmide de testes vs. Testing Trophy — a conversa que a gente acabou de ter

Onde aparece: item 7, e a análise de distribuição de esforço (30% unitário / 50% integração / 20% E2E) que você pediu.

- **[Test Pyramid, Test Honeycomb, Test Trophy: A Triumphant Trio](https://medium.com/@manishsaini74.ms/test-pyramid-test-honeycomb-test-trophy-a-triumphant-trio-for-effective-testing-d48507ed7ba4)** — passa pelos 3 formatos, com desenho de cada um.
- **[Beyond the Pyramid: Navigating Modern Strategies in Software Testing](https://medium.com/@sanclk/beyond-the-pyramid-navigating-modern-strategies-in-software-testing-5e448ed4dc47)** — foca no "por quê" da mudança: teste de integração pega bug real com menos testes que unitário, porque não depende de detalhe de implementação.
- **[On the Diverse and Fantastical Shapes of Testing](https://martinfowler.com/articles/2021-test-shapes.html)** — não é Medium, é do Martin Fowler, mas é a referência que todo mundo cita quando fala de testing trophy — vale a leitura extra se o tema pegou seu interesse.

**Gancho pro seu código:** o testing trophy (Kent C. Dodds) é basicamente o que você acabou de pedir pro seu projeto — menos peso em unitário raso, mais peso em integração real (Postgres/Redis de verdade), E2E só pros casos de uso principais. Não é teoria abstrata, é a mesma lógica que motivou a análise que acabamos de fazer.

---

## 10. O bug do `this` perdido — a história de terror favorita deste projeto

Onde aparece: o achado mais grave do checklist (48 controllers devolvendo 500 sempre, por causa de `new Controller().handle` perder o `this`).

- **[The Strange Case of Arrow Functions and Mr. Context](https://medium.com/front-end-weekly/the-strange-case-of-arrow-functions-and-mr-3087a0d7b71f)** — o título já é uma piada com "O Médico e o Monstro", e explica exatamente o mecanismo que quebrou seus 48 controllers.
- **[Lexical this: How this works in Arrow Functions](https://medium.com/@ctrlaltmonique/lexical-this-how-this-works-in-arrow-functions-100239be6550)** — mais curto, direto no "por que a arrow function resolve isso".

**Gancho pro seu código:** é literalmente o seu bug. `new Controller().handle` extrai o método do protótipo — vira uma função solta, sem lembrar de qual instância veio. `handle = async (req, res) => {...}` como campo de classe resolve porque a arrow function "gruda" no `this` do momento em que o construtor rodou. Você já viveu esse artigo antes de ler ele.

---

## 11. Prisma ORM — pra quem quer entender o que tem por baixo do `prismaClient`

Onde aparece: literalmente todo Repository do projeto.

- **[Introduction to Prisma ORM: A Beginner's Guide](https://medium.com/@pushkarajworkspace/introduction-to-prisma-orm-a-beginners-guide-60cf045d3583)** — visão geral rápida das 3 peças (Client, Migrate, Studio).
- **[A beginners guide to using Prisma with Node.js](https://medium.com/@chinedumike85/a-beginners-guide-to-using-prisma-with-node-js-ef3e040fad73)** — mais prático, com setup de projeto do zero.

**Gancho pro seu código:** o `schema.prisma` é a fonte da verdade que te avisou, por exemplo, que `Setor.name` é opcional no banco (`String?`) mas o `CreateSetorService` original exigia não-vazio — regra de negócio mais rígida que a constraint do banco, achado só de ler o schema com atenção.

---

## 12. Bônus — leitura de sofá, sem gancho técnico nenhum

- **[JavaScript & TypeScript: A Funny Way to Understand Them](https://medium.com/@rdhanurzid/javascript-typescript-a-funny-way-to-understand-them-81cb81449f23)** — comparação bem-humorada dos dois, boa pra rir um pouco depois de ler os outros 11 itens sérios.

---

Se algum desses ganchos abrir mais curiosidade — por exemplo, se SOLID fizer sentido e você quiser ver os outros 4 princípios (não só o "D" de Dependency Inversion) aplicados no seu próprio código — é só pedir que a gente mapeia caso a caso, igual fizemos aqui.
