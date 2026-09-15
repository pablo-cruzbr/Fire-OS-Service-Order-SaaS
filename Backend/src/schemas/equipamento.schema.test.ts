import { describe, it, expect } from "vitest";
import { createEquipamentoSchema, updateEquipamentoSchema } from "./equipamento.schema";

describe("createEquipamentoSchema", () => {
  it("aceita um equipamento válido", () => {
    const result = createEquipamentoSchema.safeParse({
      name: "Notebook Dell",
      patrimonio: "PAT-001",
      instituicaoUnidade_id: "11111111-1111-4111-8111-111111111111",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita name vazio", () => {
    const result = createEquipamentoSchema.safeParse({
      name: "",
      patrimonio: "PAT-001",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita patrimonio vazio", () => {
    const result = createEquipamentoSchema.safeParse({
      name: "Notebook Dell",
      patrimonio: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita instituicaoUnidade_id que não é uuid", () => {
    const result = createEquipamentoSchema.safeParse({
      name: "Notebook Dell",
      patrimonio: "PAT-001",
      instituicaoUnidade_id: "not-a-uuid",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateEquipamentoSchema", () => {
  it("aceita atualização parcial só com patrimonio", () => {
    const result = updateEquipamentoSchema.safeParse({ patrimonio: "PAT-002" });
    expect(result.success).toBe(true);
  });

  it("aceita objeto vazio (nenhum campo obrigatório no update)", () => {
    const result = updateEquipamentoSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
