import { AbilityBuilder, createMongoAbility, MongoAbility } from "@casl/ability";

// Os 4 recursos que têm "dono" (um tecnico_id) e por isso passam pela mesma
// regra de ownership — ver authorizeOwnership.ts. Achado em 14/09: os 3
// módulos técnicos tinham o mesmo gap que a OrdemdeServico já tinha (um
// TECNICO editando registro de outro técnico), corrigido em 15/09 com o
// mesmo padrão generalizado em vez de copiar o `if` 3 vezes.
export type OwnableSubject =
  | "OrdemdeServico"
  | "ControleDeAssistenciaTecnica"
  | "ControleDeLaudoTecnico"
  | "DocumentacaoTecnica";

type Actions = "manage" | "read" | "update";
type Subjects = OwnableSubject | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

interface UserForAbility {
  role: string;
  tecnico_id?: string | null;
}

const OWNABLE_SUBJECTS: OwnableSubject[] = [
  "OrdemdeServico",
  "ControleDeAssistenciaTecnica",
  "ControleDeLaudoTecnico",
  "DocumentacaoTecnica",
];

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
    for (const resource of OWNABLE_SUBJECTS) {
      can("read", resource);
      // Só pode dar update no registro se ele estiver atribuído a ele mesmo.
      can("update", resource, { tecnico_id: user.tecnico_id ?? "__sem_tecnico__" });
    }
    return build();
  }

  // USER (ex.: staff de uma instituição que abre chamado): só leitura.
  for (const resource of OWNABLE_SUBJECTS) {
    can("read", resource);
  }
  return build();
}
