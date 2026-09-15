import { describe, it, expect } from "vitest";
import { createInformacoesSetorSchema, updateInformacoesSetorSchema } from "./informacoesSetor.schema";

const validId = "11111111-1111-4111-8111-111111111111";

describe("createInformacoesSetorSchema", () => {
  it("aceita informação de setor válida", () => {
    const result = createInformacoesSetorSchema.safeParse({
      setorId: validId,
      usuario: "João",
      andar: "3",
      ramal: "1234",
      clienteId: null,
      instituicaoUnidadeId: null,
    });

    expect(result.success).toBe(true);
  });

  it("rejeita setorId ausente (é obrigatório, é FK não-nula no schema.prisma)", () => {
    const result = createInformacoesSetorSchema.safeParse({
      usuario: "João",
    });

    expect(result.success).toBe(false);
  });

  it("aceita clienteId e instituicaoUnidadeId como null (o formulário manda null quando nada é selecionado)", () => {
    const result = createInformacoesSetorSchema.safeParse({
      setorId: validId,
      clienteId: null,
      instituicaoUnidadeId: null,
    });

    expect(result.success).toBe(true);
  });

  it("rejeita setorId que não é uuid", () => {
    const result = createInformacoesSetorSchema.safeParse({
      setorId: "not-a-uuid",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateInformacoesSetorSchema", () => {
  it("aceita atualização parcial só com ramal", () => {
    const result = updateInformacoesSetorSchema.safeParse({ ramal: "5678" });
    expect(result.success).toBe(true);
  });
});
