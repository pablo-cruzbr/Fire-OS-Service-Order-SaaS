# Guia de Cache (Redis) no Fire OS — cache-aside vs. colapsar queries

Documento separado do `ROADMAP-PLENO.md`, mesmo espírito do `GUIA-FILA-BULLMQ.md`: explicar esse assunto do zero, num lugar só, grounded no código real do projeto — pra virar resposta pronta de entrevista.

---

## 1. O que é cache, sem assumir que você já viu isso

**Cache** é guardar o *resultado* de um cálculo caro num lugar de leitura rápida, pra não recalcular esse resultado toda vez que alguém pede a mesma coisa. A troca (trade-off) é: você aceita que a resposta pode ficar levemente desatualizada por um tempo (o **TTL** — time to live), em troca de não bater no banco a cada request.

**Redis** entra aqui pelo mesmo motivo que entra em fila (ver `GUIA-FILA-BULLMQ.md`): é um banco em memória (RAM), absurdamente rápido pra leitura/escrita, e compartilhado entre processos — por isso serve tanto pra fila quanto pra cache, são dois usos diferentes da mesma peça de infraestrutura.

**Cache-aside** (o padrão usado no Fire OS) é uma estratégia específica de onde a responsabilidade de checar e popular o cache fica: fica na própria aplicação, não no banco nem numa camada separada. O fluxo:

```
1. Aplicação pergunta pro cache: "já tenho isso guardado?"
2. Se SIM (hit): devolve o valor guardado, nunca toca o banco.
3. Se NÃO (miss): calcula do jeito caro (bate no banco), guarda o
   resultado no cache com um TTL, e só então devolve.
```

O nome vem de "ao lado" (aside) — o cache não fica no meio do caminho obrigatório, a aplicação decide quando consultar e quando popular.

---

## 2. Onde isso está implementado de verdade no Fire OS

`ListOrdemdeServicoService.getTotais()` ([src/services/controles_forms/OrdemdeServico/ListOrdemdeServicoService.ts:207-257](../src/services/controles_forms/OrdemdeServico/ListOrdemdeServicoService.ts#L207-L257)) resolve um problema real: toda vez que a listagem de OS carrega, o frontend precisa dos totais por status (aberta, em andamento, concluída...) e por tipo (ticket, ordem de serviço) pra mostrar nos cards do topo da tela. Isso é **8 `count()` separados** no Prisma, um por card.

**Antes (sem cache) — o que rodava a cada request:**

```ts
const total = await prismaClient.ordemdeServico.count({ where: whereCondition });
const totalAberta = await prismaClient.ordemdeServico.count({ where: { ...whereCondition, statusOrdemdeServico: { name: "ABERTA" } } });
// ...mais 6 counts iguais, um por status/tipo
```

Cada carregamento da tela de listagem = 8 round-trips ao Postgres, sempre — mesmo que ninguém tenha criado ou fechado uma OS nos últimos segundos, e mesmo que dois técnicos abram a mesma tela dentro do mesmo minuto.

**Depois (cache-aside com Redis):**

```ts
private async getTotais(whereCondition: any) {
  const cacheKey = `os:totais:${JSON.stringify(whereCondition)}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);        // HIT: nem chega no Postgres
  } catch (error) {
    console.error("Redis indisponível, seguindo sem cache:", error); // FALLBACK
  }

  const [total, totalAberta, /* ...os outros 6 */] = await Promise.all([
    prismaClient.ordemdeServico.count({ where: whereCondition }),
    // ...
  ]);

  const totais = { total, totalAberta, /* ... */ };

  try {
    await redisClient.set(cacheKey, JSON.stringify(totais), "EX", 30); // TTL 30s
  } catch (error) {
    console.error("Redis indisponível, não deu pra salvar o cache:", error);
  }

  return totais;
}
```

Três decisões de design que valem explicar numa entrevista:

- **A cache key inclui os filtros** (`JSON.stringify(whereCondition)`) — um `TECNICO` vendo só as próprias OS não recebe o cache de outro `TECNICO`, nem o cache de uma busca filtrada por cliente. Cada combinação de filtro tem sua própria entrada no cache.
- **TTL curto (30s) foi uma escolha consciente**, não arbitrária: um contador de status levemente desatualizado não tem custo real pro usuário — não é saldo bancário, é "quantas OS estão abertas agora", tolera alguns segundos de atraso.
- **Fallback pra Redis fora do ar**: os dois `try/catch` garantem que, se o Redis cair, a rota continua funcionando (só volta a bater direto no Postgres, sem cache) — cache é uma otimização, não uma dependência crítica. Isso foi testado nos 3 casos (miss, hit, fallback) em `ListOrdemdeServicoController.test.ts`.

---

## 3. A outra pergunta: por que não colapsar os 8 `count()` numa query só?

Essa foi a dúvida que puxou esse documento. Tecnicamente é possível reduzir os 8 round-trips a **1 único round-trip**, usando agregação condicional em SQL — não é bem um `GROUP BY` simples (isso serviria se você quisesse *uma linha por status*), e sim `COUNT(*) FILTER (WHERE ...)` (Postgres) ou `SUM(CASE WHEN ... THEN 1 ELSE 0 END)` (portável), porque você quer *uma linha só*, com uma coluna por contagem — status e tipo são duas dimensões diferentes, não dá pra agrupar por ambas ao mesmo tempo numa única linha com `GROUP BY` puro:

```sql
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status_id = '...ABERTA...')       AS total_aberta,
  COUNT(*) FILTER (WHERE status_id = '...EM_ANDAMENTO...') AS total_em_andamento,
  COUNT(*) FILTER (WHERE status_id = '...PAUSADA...')      AS total_pausada,
  COUNT(*) FILTER (WHERE status_id = '...CONCLUIDA...')    AS total_concluida,
  COUNT(*) FILTER (WHERE tipo_id = '...TICKET...')         AS total_ticket,
  COUNT(*) FILTER (WHERE tipo_id = '...ORDEM_SERVICO...')  AS total_ordemdeservico
FROM "OrdemdeServico"
WHERE ...
```

### Por que essa ideia foi adiada, e por que isso não é a resposta completa

O `CHECKLIST-REFATORACAO-BACKEND.md` (item 6) registrou isso como "ideia descartada por ora: o ganho fica pequeno já que o cache faz a query rodar só a cada 30s". Essa frase está certa, mas incompleta — **cache e agregação condicional resolvem problemas diferentes, não são a mesma otimização com dois nomes**:

| | O que resolve | O que NÃO resolve |
|---|---|---|
| **Cache (Redis, TTL 30s)** | **Frequência** — 8 queries a cada 30s em vez de a cada request | Quando o cache dá miss, ainda são 8 round-trips de uma vez |
| **Agregação condicional (1 query)** | **Custo por execução** — 1 round-trip em vez de 8, sempre que roda | Não guarda nada entre requests — sem cache, roda em toda chamada |

Ou seja: são **complementares**, não substitutos. E existem dois cenários concretos, ambos reais no Fire OS, em que o cache sozinho não cobre o que a agregação condicional cobriria:

1. **Cache stampede / thundering herd**: quando o TTL de 30s expira, se várias requisições chegarem nesse instante (ex.: vários técnicos abrindo a listagem ao mesmo tempo), **todas** dão miss simultaneamente — não existe lock nem "quem primeiro recalcula, os outros esperam" nesse código. Sem agregação condicional, isso é 8 queries × N requisições simultâneas batendo no Postgres de uma vez.
2. **Redis fora do ar**: o fallback (`catch` dos dois lados) faz a rota continuar funcionando, mas *volta ao comportamento pré-cache* — 8 round-trips por request, sem TTL nenhum aliviando. Se o Redis cair durante um pico de uso, é exatamente quando o custo por execução mais pesa.

### A resposta correta pra entrevista

Não é "cache resolve, GROUP BY é desnecessário" — é: **cache resolve o caso feliz (Redis de pé, tráfego normal); agregação condicional resolve os dois casos de borda que o cache não cobre (stampede no miss, Redis fora do ar)**. A decisão de adiar foi razoável — 8 counts com índice em cima de uma tabela de porte médio não é caro o suficiente pra justificar reescrever pra SQL bruto agora, e o ganho real só aparece nesses dois cenários de borda, que hoje não são o gargalo do Fire OS. Mas é uma decisão que vale documentar como trade-off explícito, não como "não vale a pena" — a diferença entre as duas frases é o que soa como Pleno numa entrevista.

---

## 4. Segunda implementação: `ListTecnicoService` — o mesmo padrão, mais um conceito novo

**Feito em 04/09.** O `getTotais()` de OrdemdeServico prova cache-aside com **TTL puro**: o dado só fica "velho" até o relógio de 30s zerar, ninguém avisa o cache ativamente quando algo muda. Isso funciona bem lá porque o total de status muda toda hora (uma OS muda de status o tempo todo) — não faria sentido tentar invalidar em cada mudança.

Em `ListTecnicoService` o cenário é o oposto: técnico é cadastrado raramente, mas quando é, você **quer ver na hora** — um admin que acabou de cadastrar um técnico e vai atribuir uma OS a ele não deveria esperar até 60s pra esse técnico aparecer na lista. TTL puro resolveria "errado por pouco tempo", mas dava pra fazer melhor.

### O conceito novo: invalidação ativa (cache invalidation)

Além de "expira sozinho depois de N segundos" (TTL), existe a outra metade do cache-aside que o `getTotais()` não precisava: **quem escreve avisa o cache que o dado mudou**, apagando a entrada velha na hora — em vez de esperar o TTL, a próxima leitura já dá miss e busca fresco do banco.

```
Antes (só TTL):
  cria técnico → banco atualizado → cache continua com a lista antiga
                                     até 60s se passarem sozinhos

Depois (TTL + invalidação):
  cria técnico → banco atualizado → cache.del("tecnicos:list")
                                     → próxima leitura já dá miss e
                                       busca a lista atualizada na hora
```

**Implementado** ([ListTecnicoService.ts](../src/services/status_categorias/tecnico/ListTecnicoService.ts)) — mesmo formato do `getTotais()`, só que sem filtro nenhum (a lista de técnicos não varia por usuário nem por query, então a chave é fixa: `tecnicos:list`) e com TTL maior (60s, contra os 30s de OS — reflete que a lista muda com frequência ainda menor):

```ts
export const TECNICOS_CACHE_KEY = "tecnicos:list";
const TECNICOS_CACHE_TTL_SECONDS = 60;

class ListTecnicoService {
  async execute() {
    try {
      const cached = await redisClient.get(TECNICOS_CACHE_KEY);
      if (cached) return JSON.parse(cached);           // hit
    } catch (error) {
      console.error("Redis indisponível, seguindo sem cache:", error);
    }

    const tecnicos = await prismaClient.tecnico.findMany({ /* ... */ });
    const total = await prismaClient.tecnico.count();
    const resultado = { controles: tecnicos, total };

    try {
      await redisClient.set(TECNICOS_CACHE_KEY, JSON.stringify(resultado), "EX", TECNICOS_CACHE_TTL_SECONDS);
    } catch (error) {
      console.error("Redis indisponível, não deu pra salvar o cache:", error);
    }

    return resultado;
  }
}
```

E a invalidação, adicionada em [CreateTecnicoService.ts](../src/services/status_categorias/tecnico/CreateTecnicoService.ts) e [RemoveTecnicoService.ts](../src/services/status_categorias/tecnico/RemoveTecnicoService.ts) — os dois únicos lugares que mudam a tabela `tecnico`:

```ts
// depois de criar/remover o técnico no banco:
try {
  await redisClient.del(TECNICOS_CACHE_KEY);
} catch (error) {
  console.error("Redis indisponível, não deu pra invalidar o cache de técnicos:", error);
}
```

Mesmo princípio de resiliência do `getTotais()`: se o Redis estiver fora do ar, o `del()` falha silenciosamente (só loga) e o create/remove continuam funcionando — o pior cenário é o cache ficar desatualizado até o TTL expirar sozinho, nunca a operação de escrita falhar por causa do cache.

### Por que essa segunda aplicação confirma (e corrige) a expectativa do checklist

O `CHECKLIST-REFATORACAO-BACKEND.md` já registrava a suspeita: "o ganho ali é menor do que parece" — porque `ListTecnicoService` fazia só 2 queries simples (1 `findMany` + 1 `count`, sem filtro por relação), contra os 8 `count()` filtrados do `getTotais()`. Isso se confirmou: o ganho por cache *hit* aqui é bem menor (evita 2 round-trips triviais, não 8 com join). Mas replicar o padrão trouxe dois resultados que compensam o ganho pequeno:

1. **Custo de implementar foi baixo** — copiar a estrutura pronta do `getTotais()` levou minutos, não horas.
2. **Forçou a pensar em invalidação**, que o primeiro caso não precisava — isso é conhecimento novo (não só "copiei o padrão"), e é exatamente o tipo de nuance que mostra domínio do assunto numa entrevista: saber quando TTL puro basta e quando vale a pena invalidar ativamente.

**Resultado:** 58 testes passando (6 novos — miss/hit/fallback da listagem, igual ao padrão de OrdemdeServico, mais 3 cobrindo a invalidação no create/remove, incluindo o caso do Redis fora do ar), `tsc --noEmit` limpo.

---

## 5. Glossário rápido

| Termo | O que é |
|---|---|
| **Cache-aside** | Padrão onde a aplicação (não o banco) decide quando ler e quando popular o cache — "olha o cache primeiro, se não tiver, calcula e guarda" |
| **TTL (time to live)** | Por quanto tempo um valor guardado no cache é considerado válido antes de expirar |
| **Cache hit** | Pediu algo e achou no cache — não precisou recalcular |
| **Cache miss** | Pediu algo e não achou (expirou ou nunca foi guardado) — precisa recalcular |
| **Cache key** | O identificador usado pra guardar/buscar no cache — aqui, os filtros da busca viram a chave, pra não misturar totais de buscas diferentes |
| **Cache stampede / thundering herd** | Quando o cache expira e várias requisições simultâneas dão miss ao mesmo tempo, todas recalculando junto — sem uma trava (lock), o "problema que o cache resolveria" volta a acontecer, só que concentrado num instante |
| **Round-trip** | Uma ida-e-volta de rede até o banco — cada `count()` separado é um round-trip |
| **Agregação condicional** (`COUNT(*) FILTER (WHERE ...)` / `SUM(CASE WHEN ...)`) | Técnica SQL pra calcular várias contagens diferentes numa única query, numa única linha de resultado — reduz N round-trips a 1 |
| **Invalidação ativa (cache invalidation)** | Apagar a entrada do cache assim que o dado de origem muda (`redisClient.del(key)`), em vez de esperar o TTL expirar sozinho — usado no create/remove de técnico, não usado no `getTotais()` porque lá o dado muda rápido demais pra valer a pena |

---

## 6. O que ainda falta (próximos passos)

- [x] Replicar o padrão de cache-aside em `ListTecnicoController`/`ListTecnicoService` (item 6 do checklist) — feito em 04/09, com TTL de 60s e invalidação ativa no create/remove (seção 4 acima).
- [ ] Se algum dia o volume de OS crescer a ponto dos 8 `count()` pesarem mesmo no cache miss, trocar por agregação condicional (`COUNT(*) FILTER (WHERE ...)`) dentro do `getTotais()` — mantém o cache-aside por fora, só troca o "como calcula" por dentro.
- [ ] Considerar um lock simples (ex.: `SETNX` no Redis) pra evitar cache stampede, se o tráfego real algum dia justificar — hoje é um risco teórico documentado, não medido.

Checklist completo, com o "molde" de narrativa pra entrevista, está no `ROADMAP-PLENO.md` (item 6, "Cache").
