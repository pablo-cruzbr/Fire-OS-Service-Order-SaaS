import { describe, it, expect } from "vitest";
import { createLookupCategoriaSchema, deleteStatusOrdemdeServicoQuerySchema } from "./lookupCategoria.schema";

describe("createLookupCategoriaSchema", () => {
  it("aceita um name válido", () => {
    const result = createLookupCategoriaSchema.safeParse({ name: "Aberta" });
    expect(result.success).toBe(true);
  });

  it("rejeita name vazio", () => {
    const result = createLookupCategoriaSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita quando name não vem no payload", () => {
    const result = createLookupCategoriaSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("deleteStatusOrdemdeServicoQuerySchema", () => {
  it("aceita statusOrdem_id como uuid válido", () => {
    const result = deleteStatusOrdemdeServicoQuerySchema.safeParse({
      statusOrdem_id: "11111111-1111-4111-8111-111111111111",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita statusOrdem_id que não é uuid", () => {
    const result = deleteStatusOrdemdeServicoQuerySchema.safeParse({ statusOrdem_id: "abc" });
    expect(result.success).toBe(false);
  });
});
