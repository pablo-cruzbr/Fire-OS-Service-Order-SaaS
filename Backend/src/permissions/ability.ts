import { AbilityBuilder, createMongoAbility, MongoAbility } from "@casl/ability";

type Actions = "manage" | "read" | "update";
type Subjects = "OrdemdeServico" | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

interface UserForAbility {
  role: string;
  tecnico_id?: string | null;
}

// Regras de autorização por role, centralizadas aqui em vez de espalhadas
// em `if` por service. Ver estudos-pleno/ROADMAP-PLENO.md, item 1 ("Próximo nível"),
// pro raciocínio: can.ts decide "pode chamar a rota", isso aqui decide
// "pode agir NESSE recurso específico".
export function defineAbilityFor(user: UserForAbility): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (user.role === "ADMIN") {
    can("manage", "all");
    return build();
  }

  if (user.role === "TECNICO") {
    can("read", "OrdemdeServico");
    // Só pode dar update na OS se ela estiver atribuída a ele mesmo.
    can("update", "OrdemdeServico", { tecnico_id: user.tecnico_id ?? "__sem_tecnico__" });
    return build();
  }

  // USER (ex.: staff de uma instituição que abre chamado): só leitura.
  can("read", "OrdemdeServico");
  return build();
}
