import { describe, it, expect } from "vitest";
import { updateInstituicaoUnidadeSchema } from "./instituicaoUnidade.schema";

const validId = "11111111-1111-4111-8111-111111111111";

describe("updateInstituicaoUnidadeSchema", () => {
  it("aceita um payload válido", () => {
    const result = updateInstituicaoUnidadeSchema.safeParse({
      name: "Secretaria Municipal",
      endereco: "Rua 1, 100",
      telefone: "1199999999",
      tipodeInstituicaoUnidade_id: validId,
    });
    expect(result.success).toBe(true);
  });

  it("aceita sem telefone (é opcional no schema.prisma)", () => {
    const result = updateInstituicaoUnidadeSchema.safeParse({
      name: "Secretaria Municipal",
      endereco: "Rua 1, 100",
      tipodeInstituicaoUnidade_id: validId,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita name vazio", () => {
    const result = updateInstituicaoUnidadeSchema.safeParse({
      name: "",
      endereco: "Rua 1, 100",
      tipodeInstituicaoUnidade_id: validId,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita sem tipodeInstituicaoUnidade_id", () => {
    const result = updateInstituicaoUnidadeSchema.safeParse({
      name: "Secretaria Municipal",
      endereco: "Rua 1, 100",
    });
    expect(result.success).toBe(false);
  });
});
