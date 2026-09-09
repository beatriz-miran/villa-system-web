import { describe, expect, it } from "vitest";

import { gerarCodigoLote } from "./gerar-codigo-lote";

describe("gerarCodigoLote", () => {
  it("gera um código no formato LT-AAAAMMDD-XXXXXX", () => {
    const data = new Date(2026, 8, 9);

    expect(gerarCodigoLote(data)).toMatch(/^LT-20260909-[A-Z0-9]{6}$/);
  });

  it("gera códigos diferentes em chamadas sucessivas", () => {
    const data = new Date(2026, 8, 9);

    const codigos = new Set(
      Array.from({ length: 20 }, () => gerarCodigoLote(data))
    );

    expect(codigos.size).toBe(20);
  });
});
