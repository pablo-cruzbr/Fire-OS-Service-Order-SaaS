import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/prisma.ts',
        'src/server.ts',
        'src/routes.ts',
      ],
      // Piso de hoje (15/09/2026), não meta final: os ~89 controllers que
      // ainda não passaram pelo rollout de Zod/Repository (item 1/3 do
      // checklist) não têm teste nenhum, então 60% travaria o CI agora sem
      // ninguém ter regredido nada. Documentar o número real primeiro,
      // subir o piso conforme o rollout avança — mesma lógica do ESLint
      // ficar `warn` em vez de `error` pra dívida antiga (GUIA-CI-LINT.md).
      thresholds: {
        lines: 30,
        functions: 35,
        branches: 45,
        statements: 30,
      },
    },
  },
})
