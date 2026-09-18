import { execSync } from "node:child_process";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";

// globalSetup roda UMA vez, antes de qualquer arquivo de teste ser importado
// (Vitest garante essa ordem) — é por isso que dá pra setar DATABASE_URL
// aqui: quando os arquivos de teste importarem `src/prisma/index.ts` (que faz
// `new PrismaClient()`), a variável já vai estar apontando pro Postgres
// efêmero, não pro banco real do .env (Neon, em produção).
export default async function setup() {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(
    "postgres:15-alpine"
  ).start();

  process.env.DATABASE_URL = container.getConnectionUri();

  // `db push` em vez de `migrate deploy`: sincroniza o schema.prisma direto,
  // sem precisar da pasta prisma/migrations (mais rápido, e não gera
  // artefato de migration novo só pra rodar teste).
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: process.env,
  });

  return async () => {
    await container.stop();
  };
}
