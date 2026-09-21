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
    // Todos os arquivos de integração batem no MESMO Postgres efêmero (um só
    // container, subido uma vez no globalSetup) e cada um limpa suas tabelas
    // no beforeEach — rodando em paralelo (padrão do Vitest), o cleanup de
    // um arquivo apaga dado que outro está usando no meio de uma request.
    // Achado ao adicionar o 3º arquivo de teste: sem isso, criar uma OS
    // falhava com 404 porque o `user.deleteMany()` de outro arquivo corria
    // por baixo no meio do teste. Sequencial evita a corrida.
    fileParallelism: false,
  },
})
