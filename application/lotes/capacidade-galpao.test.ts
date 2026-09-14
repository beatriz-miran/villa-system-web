import { describe, expect, it } from "vitest";

import { calcularCapacidadeMaximaAves } from "./capacidade-galpao";

describe("calcularCapacidadeMaximaAves", () => {
  it("multiplica a área pela densidade da linhagem e arredonda para baixo", () => {
    expect(calcularCapacidadeMaximaAves(100, 9)).toBe(900);
    expect(calcularCapacidadeMaximaAves(10.5, 7)).toBe(73);
    expect(calcularCapacidadeMaximaAves(50, 8.5)).toBe(425);
  });

  it("retorna zero quando a área não é válida", () => {
    expect(calcularCapacidadeMaximaAves(0, 7)).toBe(0);
    expect(calcularCapacidadeMaximaAves(-10, 7)).toBe(0);
    expect(calcularCapacidadeMaximaAves(Number.NaN, 7)).toBe(0);
  });

  it("retorna zero quando a densidade não é válida", () => {
    expect(calcularCapacidadeMaximaAves(100, 0)).toBe(0);
    expect(calcularCapacidadeMaximaAves(100, -7)).toBe(0);
    expect(calcularCapacidadeMaximaAves(100, Number.NaN)).toBe(0);
  });
});