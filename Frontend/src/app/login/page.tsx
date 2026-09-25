import Link from "next/link";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { api } from "@/services/api";
import { loginSchema } from "@/lib/schemas/loginSchema";
import { loginErrorMessage, setSessionCookie } from "@/lib/auth";
import { AuthError, AuthShell } from "@/components/auth/AuthShell";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { Field, Input } from "@/components/ui";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

async function handleLogin(formData: FormData) {
  "use server";

  const parsed = loginSchema.safeParse({
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  });
  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos")}`);
  }

  try {
    const { data } = await api.post("/session", parsed.data);
    if (!data?.token) redirect("/login?error=credentials");

    const role = data.role?.toUpperCase() ?? "USER";
    if (role === "USER") redirect("/login?error=no_admin");

    await setSessionCookie(data.token);
    redirect(role === "ADMIN" ? "/dashboard" : "/dashboard/tickets");
  } catch (err: any) {
    if (isRedirectError(err)) throw err;
    redirect(err?.response ? "/login?error=credentials" : "/login?error=server");
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Portal administrativo"
      subtitle="Acesso para administradores e técnicos."
      footer={
        <>
          É um cliente?{" "}
          <Link href="/AreadeUsuario" className="font-medium text-primary hover:underline">
            Entre na Área do Usuário
          </Link>
        </>
      }
    >
      <AuthError message={loginErrorMessage(error)} />
      <form action={handleLogin} className="flex flex-col gap-5">
        <Field label="E-mail" htmlFor="email">
          <Input id="email" type="email" name="email" autoComplete="email" placeholder="voce@empresa.com" required />
        </Field>
        <Field label="Senha" htmlFor="password">
          <Input id="password" type="password" name="password" autoComplete="current-password" required minLength={4} />
        </Field>
        <SubmitButton>Entrar</SubmitButton>
      </form>
    </AuthShell>
  );
}
