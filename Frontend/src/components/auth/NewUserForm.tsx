"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TbBuildingCommunity, TbBuildingStore } from "react-icons/tb";
import { api } from "@/services/api";
import { apiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/cn";
import { useLookups } from "@/components/data/useLookups";
import { Button, Field, Input, Select } from "@/components/ui";

export type Vinculo = "empresa" | "instituicao";

const lookups = {
  empresa: { endpoint: "/listcliente" },
  instituicao: { endpoint: "/listinstuicao" },
  setor: { endpoint: "/listsetores" },
};

/**
 * Registers a user linked either to a private client (empresa) or to a
 * municipal institution — the two old signup pages merged into one form.
 */
export function NewUserForm({ defaultVinculo }: { defaultVinculo: Vinculo }) {
  const router = useRouter();
  const [vinculo, setVinculo] = useState<Vinculo>(defaultVinculo);
  const [sending, setSending] = useState(false);
  const { options, loading, failed } = useLookups([lookups.empresa, lookups.instituicao, lookups.setor]);

  const orgOptions = options[lookups[vinculo].endpoint] ?? [];
  const setorOptions = options[lookups.setor.endpoint] ?? [];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const org = form.get("org")?.toString() ?? "";

    setSending(true);
    try {
      await api.post("/users", {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        ...(vinculo === "empresa" ? { cliente_id: org } : { instituicaoUnidade_id: org }),
        setor_id: form.get("setor"),
      });
      toast.success("Usuário cadastrado com sucesso!");
      if (form.get("another")) {
        formElement.reset();
      } else {
        router.push("/dashboard/usuarios");
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, "Erro ao cadastrar usuário."));
    } finally {
      setSending(false);
    }
  }

  const tabs: { key: Vinculo; label: string; icon: React.ReactNode }[] = [
    { key: "empresa", label: "Empresa", icon: <TbBuildingStore /> },
    { key: "instituicao", label: "Instituição", icon: <TbBuildingCommunity /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div role="radiogroup" aria-label="Vínculo do usuário" className="grid grid-cols-2 gap-2 rounded-lg bg-surface p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="radio"
            aria-checked={vinculo === tab.key}
            onClick={() => setVinculo(tab.key)}
            className={cn(
              "flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
              vinculo === tab.key ? "bg-card text-primary shadow-md dark:shadow-dark-md" : "text-bodytext hover:text-primary",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {failed.length > 0 && (
        <p className="rounded-md bg-lightwarning px-4 py-3 text-sm text-warningtext">
          Não foi possível carregar algumas listas. Verifique se você está logado como administrador.
        </p>
      )}

      <Field label="Nome completo" htmlFor="name" required>
        <Input id="name" name="name" autoComplete="name" required />
      </Field>
      <Field label="E-mail" htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Senha" htmlFor="password" required hint="Mínimo de 4 caracteres.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={4} required />
      </Field>
      <Field label={vinculo === "empresa" ? "Empresa" : "Instituição"} htmlFor="org" required>
        <Select id="org" name="org" required defaultValue="" key={vinculo} disabled={loading}>
          <option value="" disabled>
            {loading ? "Carregando..." : "Selecione"}
          </option>
          {orgOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Setor" htmlFor="setor" required>
        <Select id="setor" name="setor" required defaultValue="" disabled={loading}>
          <option value="" disabled>
            {loading ? "Carregando..." : "Selecione"}
          </option>
          {setorOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <label className="flex items-center gap-2 text-sm text-bodytext">
        <input type="checkbox" name="another" className="h-4 w-4 accent-[var(--primary)]" />
        Cadastrar outro em seguida
      </label>

      <Button type="submit" size="lg" loading={sending} disabled={loading} className="w-full">
        Cadastrar usuário
      </Button>
    </form>
  );
}
