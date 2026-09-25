// Starts `next dev` with the fake API enabled (see src/mocks). Cross-platform
// alternative to `NEXT_PUBLIC_MOCK_API=true next dev`.
// Usage: npm run dev:mock [-- -p 3005]
import { spawn } from "node:child_process";

const args = process.argv.slice(2).filter((arg) => /^[\w.:=-]+$/.test(arg));
const command = ["npx", "next", "dev", "--turbo", ...args].join(" ");

const child = spawn(command, {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_PUBLIC_MOCK_API: "true" },
});

child.on("exit", (code) => process.exit(code ?? 0));
