import { describe, expect, it } from "vitest";

import { calcularCapacidadeMaximaAves } from "./capacidade-galpao";

describe("calcularCapacidadeMaximaAves", () => {
  it("multiplica a área pela densidade máxima e arredonda para baixo", () => {
    expect(calcularCapacidadeMaximaAves(100)).toBe(700);
    expect(calcularCapacidadeMaximaAves(10.5)).toBe(73);
  });

  it("retorna zero para área zero", () => {
    expect(calcularCapacidadeMaximaAves(0)).toBe(0);
  });
});
