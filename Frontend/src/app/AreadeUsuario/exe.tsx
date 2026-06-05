import Image from "next/image";
import styles from '../../src/app/page.module.scss';
import logoImg from "../../public/logo.svg";
import Link from "next/link";
import { cookies } from "next/headers";
import { api } from "@/services/api";
import { redirect } from "next/navigation";

export default function Home() {
  async function handleLogin(formData: FormData) {
    "use server";

    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password || email.toString().trim() === "" || password.toString().trim() === "") {
      return;
    }
    try {
      const response = await api.post("/session", {
        email,
        password,
      });

      if (!response.data.token) {
        return;
      }

      const maxAgeSeconds = 60 * 60 * 24 * 30;

      const cookieStore = await cookies();
      cookieStore.set("session", response.data.token, {
        maxAge: maxAgeSeconds,
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
      });

      redirect("/dashboard");
    } catch (err) {
      return;
    }
  }

  return (
    <div className={styles.container}>
      <Image
        src={logoImg}
        alt="Logo SF2"
        width={400}
        height={100} 
      />

      <div className={styles.conteiner}>
        <section className={styles.login}>
          <h1>Faça seu Login</h1>
          <form action={handleLogin}>
            <input
              type="email"
              required
              name="email"
              placeholder="Digite seu email"
              className={styles.input}
            />

            <input
              type="password"
              required
              name="password"
              placeholder="Digite sua senha"
              className={styles.input}
            />

            <button type="submit">Acessar</button>
          </form>

          <Link href="/signup_empresa" className={styles.text}>
            Não possui uma conta? Cadastre uma empresa
          </Link>

          <Link href="/signup_instituicao" className={styles.text}>
            Não possui uma conta? Cadastre uma instituição
          </Link>

          <Link href="/dashboard" className={styles.text}>
            Dashboard
          </Link>
        </section>
      </div>
    </div>
  );
}
