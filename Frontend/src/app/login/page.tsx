import Link from "next/link";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { api } from "@/services/api";
import { loginSchema } from "@/lib/schemas/loginSchema";
import { loginErrorMessage, setSessionCookie } from "@/lib/auth";
import { AuthDivider, AuthError, AuthShell, authSlides } from "@/components/auth/AuthShell";
import { EmailInput, PasswordInput } from "@/components/auth/AuthFields";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { ButtonLink, Field } from "@/components/ui";

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
      title="Bem-vindo de volta"
      subtitle="Portal administrativo para administradores e técnicos."
      slides={authSlides.staff}
      asideTitle="Sua equipe em campo, organizada do chamado à OS assinada"
      asideText="Agende atendimentos, acompanhe cada ordem de serviço e tenha o histórico de todos os equipamentos."
      topLink={
        <>
          É cliente?{" "}
          <Link href="/AreadeUsuario" className="font-medium text-primary hover:underline">
            Área do usuário
          </Link>
        </>
      }
    >
      <AuthError message={loginErrorMessage(error)} />
      <form action={handleLogin} className="flex flex-col gap-5">
        <Field label="E-mail" htmlFor="email">
          <EmailInput id="email" name="email" required />
        </Field>
        <Field label="Senha" htmlFor="password">
          <PasswordInput id="password" name="password" autoComplete="current-password" required minLength={4} />
        </Field>
        <SubmitButton>Entrar</SubmitButton>
      </form>
      <AuthDivider>ou</AuthDivider>
      <ButtonLink href="/AreadeUsuario" variant="outline" size="lg" className="w-full">
        Sou cliente, quero abrir um chamado
      </ButtonLink>
    </AuthShell>
  );
}
