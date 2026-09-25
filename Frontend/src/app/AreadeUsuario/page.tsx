import Link from "next/link";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { api } from "@/services/api";
import { loginSchema } from "@/lib/schemas/loginSchema";
import { loginErrorMessage, setSessionCookie } from "@/lib/auth";
import { AuthDivider, AuthError, AuthShell, authSlides } from "@/components/auth/AuthShell";
import { EmailInput, PasswordInput } from "@/components/auth/AuthFields";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { Field } from "@/components/ui";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

async function handleLogin(formData: FormData) {
  "use server";

  const parsed = loginSchema.safeParse({
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  });
  if (!parsed.success) {
    redirect(`/AreadeUsuario?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos")}`);
  }

  try {
    const { data } = await api.post("/session", parsed.data);
    if (!data?.token) redirect("/AreadeUsuario?error=credentials");
    await setSessionCookie(data.token);
  } catch (err: any) {
    if (isRedirectError(err)) throw err;
    redirect(err?.response ? "/AreadeUsuario?error=credentials" : "/AreadeUsuario?error=server");
  }

  redirect("/AreadeUsuario/formularioAddTickets");
}

export default async function AreadeUsuario({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Área do usuário"
      subtitle="Entre para abrir e acompanhar seus chamados."
      slides={authSlides.client}
      asideTitle="Atendimento técnico descomplicado"
      asideText="Abra chamados em poucos cliques e acompanhe cada etapa até a solução."
      asidePoints={["Abra um chamado em menos de um minuto", "Seus dados já vão junto com o pedido", "Técnicos atendendo no seu local"]}
      topLink={
        <>
          É colaborador?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Portal administrativo
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
      <p className="text-center text-sm text-bodytext">
        Ainda não tem acesso? Peça à empresa que presta o atendimento para criar o seu usuário.
      </p>
    </AuthShell>
  );
}
