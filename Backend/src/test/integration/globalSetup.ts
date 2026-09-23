import { execSync } from "node:child_process";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { RedisContainer, StartedRedisContainer } from "@testcontainers/redis";

// globalSetup roda UMA vez, antes de qualquer arquivo de teste ser importado
// (Vitest garante essa ordem) — é por isso que dá pra setar DATABASE_URL e
// REDIS_URL aqui: quando os arquivos de teste importarem `src/prisma/index.ts`
// e `src/redis/index.ts`, as variáveis já vão estar apontando pro Postgres e
// pro Redis efêmeros, não pro banco/cache reais do .env.
//
// Redis via TestContainers (não mockado) — achado em 22/09, discutindo a
// distribuição de esforço dos testes (unitário/integração/E2E): até aqui,
// cache-aside e a fila de upload só tinham prova com Redis mockado
// (`vi.mock('../../redis')`), exatamente o tipo de "combinação crítica" que
// vale mais a pena provar contra o real do que mockada.
export default async function setup() {
  const [postgres, redis]: [StartedPostgreSqlContainer, StartedRedisContainer] = await Promise.all([
    new PostgreSqlContainer("postgres:15-alpine").start(),
    new RedisContainer("redis:7-alpine").start(),
  ]);

  process.env.DATABASE_URL = postgres.getConnectionUri();
  process.env.REDIS_URL = redis.getConnectionUrl();

  // `db push` em vez de `migrate deploy`: sincroniza o schema.prisma direto,
  // sem precisar da pasta prisma/migrations (mais rápido, e não gera
  // artefato de migration novo só pra rodar teste).
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: process.env,
  });

  return async () => {
    await Promise.all([postgres.stop(), redis.stop()]);
  };
}
