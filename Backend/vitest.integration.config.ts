import { defineConfig } from 'vitest/config'

// Config separada da unit (vitest.config.ts) de propósito: isso aqui sobe um
// Postgres real via TestContainers (precisa do Docker rodando, é lento — 10s+
// só pra subir o container) e nunca deve rodar junto do `npm test` normal,
// que precisa ser rápido pra todo commit. Rodar com `npm run test:integration`.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/test/integration/**/*.test.ts'],
    globalSetup: ['./src/test/integration/globalSetup.ts'],
    // Container leva um tempo real pra subir + prisma db push — timeout
    // maior que o padrão (5s) pra não falhar por lentidão de infra, não por
    // teste quebrado.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
})
