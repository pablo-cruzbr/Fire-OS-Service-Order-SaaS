import tseslint from "typescript-eslint";

// Config enxuta de propósito: recommended (não recommendedTypeChecked) porque
// o type-checked exige apontar cada arquivo pro tsconfig certo e é lento — não
// vale o custo ainda num repo que nunca rodou lint. Regras de "código morto"
// (variável/import não usado) ficam warn, não error, porque o repo tem ~110
// controllers nunca lintados: forçar error travaria o rollout incremental que
// já está em andamento no resto do projeto (ver GUIA-PRIORIZACAO-PROXIMOS-PASSOS.md).
export default tseslint.config(
  {
    // "@prisma/**" é o client gerado pelo `prisma generate` (output custom do
    // schema.prisma) — código de terceiros que mora dentro do repo, não
    // nosso; lintar ele só gera ~2400 avisos sem sinal nenhum (achado ao
    // rodar `npx eslint .` pela primeira vez).
    ignores: ["dist/**", "node_modules/**", "generated/**", "@prisma/**"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "warn",
    },
  }
);
