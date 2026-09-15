# Guia de RBAC + CASL (Autorização) no Fire OS

Documento separado do `ROADMAP-PLENO.md`, mesmo espírito do `GUIA-FILA-BULLMQ.md` e do `GUIA-CACHE-REDIS.md`: o relato completo de como o item de autorização foi implementado, num lugar só, sem deixar o roadmap principal gigante. O conceito (o que é RBAC, por que os dois middlewares existem separados) continua no `ROADMAP-PLENO.md`, glossário e item 1 — aqui é só o "o que eu de fato fiz".

---

## O que foi implementado (RBAC básico + CASL) — 17/08/2026

**1. `routes.ts` virou `publicRouter` + `privateRouter`**, exatamente como no exemplo de código do `ROADMAP-PLENO.md`. `privateRouter.use(isAuthenticated)` roda uma vez só; nenhuma rota nova precisa mais lembrar de colar `isAuthenticated` na mão.

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

**Preenchendo o molde da narrativa (o mais forte pra entrevista):**

> Encontrei que `PATCH /ordemdeservico/update/:id` não validava quem era o dono da ordem de serviço — só validava que o usuário estava logado. Problema real: um técnico mal-intencionado (ou só um bug no app mobile) podia alterar diagnóstico, solução ou status de uma OS atribuída a outro técnico, só sabendo o ID. Considerei validar isso com um `if (ordem.tecnico_id !== req.user_tecnico_id)` direto no service, mas essa mesma regra também faltava no endpoint de detalhe (`GET /ordemdeservico/:id`) — duplicar o `if` em dois lugares (e futuramente mais) ia divergir com o tempo. Optei por centralizar com CASL num middleware reutilizável (`authorizeOrdemdeServico`), aplicado nos dois endpoints. Troquei "duas verificações manuais que podem divergir" por "uma peça central que preciso lembrar de aplicar em rotas novas de OS" — trade-off aceitável, e documentado aqui pra não esquecer.

---

## Revisão 14/09/2026 — o mesmo gap, achado em mais 3 módulos

O checklist do `ROADMAP-PLENO.md` tinha um item marcado feito ("mapear onde mais existe ownership escondida"), mas o mapeamento nunca tinha sido escrito de fato, e o gap que ele deveria ter fechado continuava aberto. Rodando o mesmo grep (`tecnico_id` em `services/` e `controllers/`), apareceram 3 módulos com **exatamente o mesmo bug que foi corrigido acima** — um campo `tecnico_id` que é só *dado a atualizar*, nunca *condição de quem pode atualizar*:

- `UpdateAssistenciaTecnicaService.ts` (rota `PATCH /assistenciatecnica/update/:id`)
- `UpdateControledeLaudoTecnicoService.ts` (rota `PATCH /laudotecnico/update/:id`)
- `UpdateDocumentacaoTecnicaService.ts` (rota `PATCH /documentacaotecnica/update/:id`)

As três rotas estão só atrás de `isAuthenticated` (`privateRouter`, sem `can()` nem `authorizeOrdemdeServico`-equivalente) — ou seja, hoje qualquer `TECNICO` autenticado edita ou apaga a assistência técnica, o laudo técnico ou a documentação técnica **de qualquer outro técnico**, só sabendo o `id`. É o mesmo achado do item 5 acima, só que ainda não corrigido — e é maior alavancagem do que continuar o rollout de Zod/Repository pro próximo módulo qualquer, porque esse aqui já tem o padrão de correção pronto (`defineAbilityFor` + um middleware `authorize*` por módulo, ou generalizar `authorizeOrdemdeServico` pra receber o nome do model).

- [x] Generalizar `authorizeOrdemdeServico` (ou criar 3 equivalentes) pros 3 módulos acima — mesmo padrão, mesma regra ("TECNICO só edita o que é seu, ADMIN edita tudo"). **Feito em 15/09** — ver "O que foi implementado" logo abaixo.

---

## O que foi implementado (generalizado pros 3 módulos) — 15/09/2026

Escolhi **generalizar** em vez de criar 3 middlewares quase idênticos — era literalmente a pergunta que o próprio achado de 14/09 deixou em aberto ("generalizar `authorizeOrdemdeServico` ou criar 3 equivalentes?"). Copiar o middleware 3 vezes ia repetir o mesmo risco que motivou usar CASL em primeiro lugar no item 5: duas (ou quatro) verificações manuais que podem divergir com o tempo.

**1. `ability.ts` ganhou uma lista de "recursos com dono" (`OwnableSubject`)** em vez de só `"OrdemdeServico"` fixo:

```ts
// antes: só um recurso, regra escrita na mão pra ele
type Subjects = "OrdemdeServico" | "all";
// ...
if (user.role === "TECNICO") {
  can("read", "OrdemdeServico");
  can("update", "OrdemdeServico", { tecnico_id: user.tecnico_id ?? "__sem_tecnico__" });
  return build();
}
```

```ts
// depois: qualquer recurso da lista recebe a MESMA regra, num loop
export type OwnableSubject = "OrdemdeServico" | "ControleDeAssistenciaTecnica" | "ControleDeLaudoTecnico" | "DocumentacaoTecnica";
const OWNABLE_SUBJECTS: OwnableSubject[] = [ /* os 4 */ ];
// ...
if (user.role === "TECNICO") {
  for (const resource of OWNABLE_SUBJECTS) {
    can("read", resource);
    can("update", resource, { tecnico_id: user.tecnico_id ?? "__sem_tecnico__" });
  }
  return build();
}
```

Adicionar um 5º recurso no futuro (se aparecer outro módulo com o mesmo formato de dono) vira **uma linha** na lista, não uma regra nova pra escrever.

**2. `authorizeOrdemdeServico.ts` virou a peça original generalizada, num arquivo novo — `authorizeOwnership.ts`.** Em vez de "buscar a OS, montar ability, checar" só pra `OrdemdeServico`, a versão genérica recebe **como parâmetro** o nome do subject e a função de buscar o registro:

```ts
export function authorizeOwnership(
  subjectName: OwnableSubject,
  action: "read" | "update",
  findRecord: (id: string) => Promise<{ id: string; tecnico_id: string | null } | null>,
  notFoundMessage: string,
  forbiddenMessage?: string
) {
  return async (req, res, next) => {
    const record = await findRecord(req.params.id);
    if (!record) return res.status(404).json({ error: notFoundMessage });

    const ability = defineAbilityFor({ role: req.user_role, tecnico_id: req.user_tecnico_id });
    if (ability.cannot(action, subject(subjectName, record))) {
      return res.status(403).json({ error: forbiddenMessage ?? "Você não tem permissão para acessar este registro." });
    }
    return next();
  };
}
```

`authorizeOrdemdeServico.ts` não sumiu — virou uma casca fina que chama `authorizeOwnership("OrdemdeServico", ...)`, mantendo o nome e a mensagem de erro exatos que já existiam (pra não quebrar nada que já dependesse dele — nem o teste antigo precisou mudar uma linha).

**3. As 3 rotas em `routes.ts` ganharam o middleware, cada uma passando só "como buscar esse registro":**

```ts
privateRouter.patch(
  '/assistenciatecnica/update/:id',
  authorizeOwnership(
    "ControleDeAssistenciaTecnica",
    "update",
    (id) => prismaClient.controleDeAssistenciaTecnica.findUnique({ where: { id }, select: { id: true, tecnico_id: true } }),
    "Controle de assistência técnica não encontrado."
  ),
  new UpdateAssistenciaTecnicaController().handle
)
```

Mesma coisa pra `/laudotecnico/update/:id` e `/documentacaotecnica/update/:id`, cada um só trocando o nome do subject, o método do Prisma (`controleDeLaudoTecnico`, `documentacaoTecnica`) e a mensagem de "não encontrado".

**Antes:** um `TECNICO` autenticado editava a assistência técnica, o laudo técnico ou a documentação técnica de **qualquer outro técnico**, só sabendo o `id`.
**Depois:** mesma tentativa retorna `403`. `ADMIN` continua podendo editar qualquer registro.

**4. Testes novos — 79 no total agora (17 novos desde a última contagem):**
- `src/permissions/ability.test.ts` ganhou um describe novo com `it.each` cobrindo os 3 recursos × 4 cenários (ADMIN edita qualquer um / TECNICO edita o próprio / TECNICO não edita o de outro / USER só lê) — 12 testes novos, sem repetir o corpo do teste 3 vezes.
- `src/Middleware/authorizeOwnership.test.ts` (novo) — 5 testes cobrindo o middleware genérico isolado (404, 403, dono passa, ADMIN passa, mensagem customizada), com um `findRecord` fake em vez de mockar o Prisma — mesmo princípio do Repository fake usado no resto do projeto.

**Preenchendo o molde da narrativa:**

> O achado de 14/09 (o mesmo bug de ownership da OrdemdeServico aberto em mais 3 módulos) deixou uma pergunta em aberto: generalizar o middleware ou copiar 3 vezes? Copiar seria mais rápido de escrever, mas reproduziria o mesmo risco que motivou centralizar com CASL da primeira vez — regras que divergem com o tempo porque vivem em lugares diferentes. Extraí a parte genérica (`authorizeOwnership`) do que antes só existia hard-coded pra OrdemdeServico, e transformei `authorizeOrdemdeServico` numa casca fina por cima dela, pra não quebrar nada que já usava esse nome. Troquei "3 arquivos quase iguais" por "1 função configurável + 4 linhas de wiring em `routes.ts`" — e o próximo módulo com esse mesmo formato de dono custa uma linha na lista de subjects, não um middleware novo.

---

Checklist de estado atual e ordem de prioridade: `CHECKLIST-REFATORACAO-BACKEND.md`. Conceito (RBAC vs. autenticação, os dois middlewares, o exemplo de "fail-secure"): `ROADMAP-PLENO.md`, glossário item 1 e item "1. Autorização (RBAC)".
