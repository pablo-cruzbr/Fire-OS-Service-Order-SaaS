# Guia de Priorização Técnica — por que essa ordem, não outra

Documento separado do `ROADMAP-PLENO.md`, mesmo espírito do `GUIA-FILA-BULLMQ.md` e do `GUIA-CACHE-REDIS.md`: pegar uma decisão que parece só "organização de tarefa" e mostrar o raciocínio de engenharia por trás — porque isso também é a matéria-prima de resposta de entrevista pleno, não só o código em si.

A pergunta que gerou esse doc: por que a ordem sugerida no `CHECKLIST-REFATORACAO-BACKEND.md` é (1) rollout de Zod/Repository, (2) replicar cache em `ListTecnicoController`, (3) TSC+lint no CI, (4) testes de integração/E2E por último? Cada item abaixo é um conceito diferente de engenharia, não só "isso é mais fácil".

---

## 1. Rollout módulo por módulo — por que não fazer tudo de uma vez

**O item:** replicar Controller fino + Service + Repository + Zod dos ~100 controllers restantes, um módulo de cada vez, com check-in antes do próximo (decidido, reconfirmado em 31/08).

### O conceito: rollout incremental (aparentado do "strangler fig pattern")

Quando você tem um padrão novo pra aplicar em muito código legado, existem duas estratégias:

- **Big bang:** aplica o padrão em tudo de uma vez, num PR gigante.
- **Incremental (o que você já decidiu fazer):** aplica num pedaço pequeno primeiro, valida que o padrão está certo, só então repete pro próximo pedaço.

O nome vem de **strangler fig pattern** (padrão do "cipó-estrangulador"): a planta cresce em volta de uma árvore hospedeira aos poucos, substituindo-a pedaço por pedaço, sem nunca precisar derrubar a árvore inteira de uma vez pra plantar a nova.

### Por que isso importa de verdade, com um exemplo real do seu próprio piloto

Você já teria pago um preço caro se tivesse feito big bang. No piloto de Create+Update de OrdemdeServico (`ROADMAP-PLENO.md`, item 2), o processo de aplicar o padrão **num módulo só** revelou 3 problemas que não eram óbvios antes de mexer:

1. O arquivo que "parecia" o principal (`CreateOrdemdeServicoService.ts`) era **código morto** — quem rodava de verdade era o Controller.
2. Um bug real de colisão de `numeroOS` (só 80.000 valores possíveis, sem checar duplicata).
3. Um `try/catch` silencioso em `atividades_ids` que escondia erro de JSON malformado do cliente.

Se você tivesse replicado o padrão "Controller fino + Service + Repository" nos 100 controllers **antes** de achar esses 3 problemas, teria propagado a mesma cegueira 100 vezes — e cada correção depois exigiria retrabalho em todo lugar que já tinha copiado o padrão errado. Fazendo módulo por módulo, o custo de um padrão errado fica contido num lugar só, barato de corrigir.

**Isso é literalmente o "fail cheap, fail early" aplicado a refatoração, não só a bug.** O check-in antes de avançar pro próximo módulo não é burocracia — é o ponto onde você decide "o padrão validado aqui está pronto pra virar a norma, ou ainda tem ajuste antes de multiplicar"?

- [ ] Quando for escolher o próximo módulo, aplicar a mesma pergunta que resolveu o de OrdemdeServico: existe algo "óbvio" nesse módulo (nome de arquivo, comentário, suposição) que vale confirmar rastreando o código antes de replicar o padrão nele?

---

## 2. Cache em `ListTecnicoController` — replicar um padrão não é aplicar sem medir o ganho

**O item:** o `CHECKLIST-REFATORACAO-BACKEND.md` lista isso como próximo passo óbvio ("mesmo padrão já pronto, só aplicar de novo"). Mas olhando o código real (`ListTecnicoService.ts`), o cenário é bem menor do que o de OrdemdeServico:

```ts
// ListTecnicoService.ts — hoje, sem cache
async execute() {
  const tecnicos = await prismaClient.tecnico.findMany({ orderBy: { created_at: "desc" }, select: {...} });
  const total = await prismaClient.tecnico.count();
  return { controles: tecnicos, total };
}
```

Isso é **2 queries simples numa tabela pequena** (você não cadastra dezenas de técnicos por dia — é uma lista de dezenas de linhas, não milhares). Compare com o que o cache resolveu em `ListOrdemdeServicoService.getTotais()`: **8 `count()` filtrados por relação**, numa tabela que cresce a cada OS criada.

### O conceito: nem todo "read-heavy" justifica cache do mesmo jeito

A regra de quando cachear (já registrada no `ROADMAP-PLENO.md`) é "lido muito mais do que escrito". Isso continua verdadeiro aqui — `ListTecnicoController` bate essa regra. Mas a regra sozinha não diz **o tamanho do ganho**, só se ele existe. O ganho de um cache é proporcional ao custo que ele evita:

| | Custo evitado por cache hit |
|---|---|
| `ListOrdemdeServicoService.getTotais()` | 8 round-trips, com filtro por relação (join), numa tabela que só cresce |
| `ListTecnicoService.execute()` | 2 round-trips simples, numa tabela pequena que quase não muda |

Aplicar cache-aside em `ListTecnicoController` ainda vale a pena — é barato de replicar (o padrão já existe pronto, é copiar `getTotais()` adaptado) e reduz carga sob tráfego alto. Mas a resposta certa numa entrevista não é "apliquei porque o padrão já existia", é: **"apliquei porque o custo de replicar é baixo e o ganho, embora menor que no caso de OrdemdeServico, ainda é positivo — reconheço que aqui o cache está mais perto de 'boa prática barata' do que de 'resolvendo um gargalo real'"**. Essa diferença — saber dizer *quanto* uma otimização vale, não só que ela "segue o padrão" — é o que separa aplicar cache por reflexo de aplicar cache com julgamento.

- [ ] Ao implementar, usar TTL maior que os 30s de OrdemdeServico (ex.: 60s ou mais) — lista de técnicos muda com frequência ainda menor que status de OS, então pode tolerar ficar "velha" por mais tempo.

---

## 3. TSC + lint no CI, antes dos testes — o princípio de fail-fast

**O item:** `test.yml` hoje só roda `npm run test`. Adicionar `tsc --noEmit` e lint como steps **separados**, e na ordem certa.

### O conceito: por que a ordem dos estágios de um pipeline importa

Um pipeline de CI não deveria rodar tudo "ao mesmo tempo e ver o que quebra" — a ideia de **fail-fast** é ordenar os estágios do mais barato/rápido pro mais caro/lento, pra um PR quebrado falhar em segundos, não em minutos:

```
lint (segundos)  →  type-check (segundos)  →  testes unitários (mais lento,
                                                sobe mock, roda lógica)  →
                                                testes de integração (mais
                                                lento ainda, sobe banco real)
```

Se o `tsc --noEmit` roda **antes** dos testes, um erro de tipo (ex.: um campo renomeado no schema, um import quebrado) barra o pipeline em segundos — o desenvolvedor recebe o feedback quase na hora, sem esperar a suíte de teste inteira rodar pra só então descobrir que nem compilava.

### Por que isso não é redundante com os testes — no seu próprio projeto

Vale a pena nomear o cenário concreto onde tipo e teste protegem contra coisas **diferentes**: um teste que mocka o Prisma (`vi.mock(...)`) prova que a *lógica* está certa dado um mock que você mesmo escreveu — ele não prova que o *contrato de tipos* entre as camadas está coerente. É perfeitamente possível ter 50 testes verdes com um erro de tipo real em algum lugar não coberto pelo teste (ex.: um campo que existe no `select` do Prisma mas não existe mais no schema, um Controller passando o tipo errado pro Service). Hoje isso só é pego rodando `tsc --noEmit` manualmente — e "manualmente" quer dizer "só se alguém lembrar".

**Antes (hoje):**

```yaml
# .github/workflows/test.yml
steps:
  - run: npm install
  - run: npm run test          # única checagem — tipo quebrado não barra nada
```

**Depois (Pleno — fail-fast, um step por estágio):**

```yaml
steps:
  - run: npm install
  - run: npx tsc --noEmit      # falha em segundos se algo não compila
  - run: npx eslint .          # falha em segundos se algo fere convenção/correção
  - run: npm run test          # só roda a suíte cara depois dos baratos passarem
```

**Detalhe real do projeto:** hoje não existe ESLint instalado (`package.json` não tem a dependência, não tem `.eslintrc`) — então esse item é, na prática, dois trabalhos, não um: instalar e configurar lint do zero, e só depois adicionar o step no CI junto com o `tsc --noEmit` (que já existe como script `build`, só nunca rodou como *checagem* isolada — hoje ele compila de verdade pro `vercel-build`).

- [ ] Decidir uma config de ESLint (ex.: `@typescript-eslint/recommended`) antes de ligar no CI — senão o primeiro `npx eslint .` provavelmente reprova o repo inteiro de uma vez, o que é o oposto do rollout incremental do item 1.

---

## 4. Testes de integração / E2E — por que ficam por último, de propósito

**O item:** testes de integração reais (Postgres do Docker), TestContainers, e E2E — deixados como o item mais caro, resolvido por último.

### O conceito: a pirâmide de testes, e o motivo do formato ser um triângulo

```
        /  E2E  \          ← poucos: lentos, caros de manter, testam o sistema inteiro
       / Integr. \         ← alguns: mais lentos, precisam de banco/infra real
      /   Unit.    \       ← muitos: rápidos, isolados, mockam dependências externas
```

O formato de triângulo não é estético — é sobre **custo por teste** subindo conforme sobe de camada. Um teste unitário roda em milissegundos porque não depende de nada fora do processo (Prisma mockado, repository fake). Um teste de integração precisa de um Postgres de verdade de pé, precisa popular e limpar dados entre execuções, e roda em segundos por teste, não milissegundos. Um E2E sobe a API inteira e simula um usuário real — o mais lento e o mais frágil (quebra por motivo que não é bug, tipo timing).

### Onde o Fire OS já está, e por que isso não é "fazer teste depois"

Você já tem a base da pirâmide bem construída — 52 testes unitários (Vitest), cobrindo auth, RBAC/CASL, Create/Update de OrdemdeServico com repository fake (não mock cru do Prisma), a infra de validação/erro, e o cache-aside da listagem. Isso não é pouco: é o andar que dá **mais cobertura por segundo de execução**, e ele está sólido.

Faltam os dois andares de cima, e a ordem de "deixar por último" é sobre **custo de construir e manter**, não sobre importância:

- **Testes de integração** (Postgres real do `docker-compose.yml`) provam que o *contrato* com o banco está certo — ex.: uma constraint `@unique` só quebra de verdade contra um Postgres real, um mock nunca vai reproduzir isso. Escrever esse teste exige orquestrar subida/derrubada de dados a cada rodada — mais trabalho de infraestrutura de teste do que de lógica.
- **TestContainers** resolve um problema específico dessa camada: hoje, rodar um teste de integração exigiria que você já tivesse o `docker-compose.yml` de pé manualmente. TestContainers sobe um Postgres isolado, efêmero, por rodada de teste, via código — sem depender de "lembrar de rodar `docker compose up` antes".
- **E2E** é a camada mais cara de todas: precisa da API inteira rodando, respondendo requests HTTP de verdade, ponta a ponta — é o teste mais próximo do usuário real, e também o mais lento e mais caro de manter (qualquer mudança de contrato de rota quebra o teste, mesmo que a lógica esteja certa).

**A resposta de entrevista aqui não é "não dava tempo"** — é: "priorizei terminar a base da pirâmide (unitários com boa cobertura, incluindo os middlewares críticos como RBAC) antes de subir pros andares mais caros, porque o retorno por hora investida é maior embaixo — e comecei pela camada que mais protege contra regressão de lógica de negócio, que é onde um bug pesa mais caro pro usuário final."

- [ ] Primeiro passo real, quando chegar a vez: 1 teste de integração cobrindo o fluxo de autenticação contra o Postgres do Docker — não a suíte inteira de uma vez, mesmo princípio do rollout incremental do item 1.

---

## 5. O fio que conecta os 4 itens: sequenciar por leverage/custo é a habilidade em si

Nenhum dos 4 itens acima foi ordenado por "o que é mais fácil de fazer primeiro". Cada um usa um critério diferente de custo, e reconhecer qual critério se aplica é o que um pleno faz diferente de alguém seguindo um checklist genérico:

| Item | Critério que decidiu a ordem |
|---|---|
| Rollout Zod/Repository | Conter o custo de um padrão errado — validar pequeno antes de multiplicar |
| Cache em `ListTecnicoController` | Tamanho do ganho real, não só "o padrão existe" |
| TSC + lint no CI | Custo de execução — barato e rápido deve rodar antes de caro e lento (fail-fast) |
| Testes de integração/E2E | Custo de construir e manter — fica por último não por ser menos importante, mas por dar menos retorno por hora investida agora |

Isso é, em essência, uma versão pequena de **análise de trade-off** — o mesmo conceito que já está documentado no `ROADMAP-PLENO.md` ("Como usar isso na entrevista" / "O molde da narrativa"), só que aplicado à ordem do próprio backlog, não a uma decisão de código isolada.

---

## 6. Glossário rápido

| Termo | O que é |
|---|---|
| **Rollout incremental** | Aplicar uma mudança em pedaços pequenos e validados, em vez de tudo de uma vez |
| **Strangler fig pattern** | Nome formal pra substituir um sistema legado aos poucos, pedaço por pedaço, sem big bang |
| **Fail-fast** | Ordenar verificações da mais barata/rápida pra mais cara/lenta, pra um erro aparecer o quanto antes |
| **`tsc --noEmit`** | Roda o compilador TypeScript só pra checar tipos, sem gerar os arquivos `.js` — usado como *lint de tipo*, não como build |
| **Pirâmide de testes** | Muitos testes unitários (rápidos, isolados) na base, alguns de integração no meio, poucos E2E no topo — o formato reflete o custo crescente de cada camada |
| **TestContainers** | Ferramenta que sobe infraestrutura real (ex.: Postgres) em container isolado, por código, só durante o teste — sem depender de infra já estar de pé manualmente |
| **Leverage (alavancagem)** | O quanto de retorno uma ação traz em relação ao esforço que ela custa — base de qualquer priorização técnica |

---

## 7. Próximos passos

- [ ] Escolher o próximo módulo pro rollout de Zod/Repository (item 1) — aplicando a pergunta de "existe algo óbvio a confirmar antes de replicar" do achado do piloto.
- [x] Implementar cache-aside em `ListTecnicoController` (item 2) — feito em 04/09, TTL de 60s + invalidação ativa no create/remove. Detalhes em `GUIA-CACHE-REDIS.md`, seção 4.
- [ ] Instalar e configurar ESLint, depois adicionar `tsc --noEmit` + lint como steps separados no `test.yml`, antes do `test` (item 3).
- [ ] Primeiro teste de integração real (fluxo de autenticação, Postgres do Docker) — só depois, TestContainers e E2E (item 4).

Checklist completo, com o estado atual de cada item, está no `CHECKLIST-REFATORACAO-BACKEND.md`.
