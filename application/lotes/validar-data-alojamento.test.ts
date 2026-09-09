import { describe, expect, it } from "vitest";

import { dataAlojamentoEhFutura } from "./validar-data-alojamento";

describe("dataAlojamentoEhFutura", () => {
  const agora = new Date(Date.UTC(2026, 8, 9, 12, 0, 0));

  it("retorna false para uma data no passado", () => {
    const dataPassada = new Date(Date.UTC(2026, 8, 1));

    expect(dataAlojamentoEhFutura(dataPassada, agora)).toBe(false);
  });

  it("retorna false para a data de hoje", () => {
    const hoje = new Date(Date.UTC(2026, 8, 9));

    expect(dataAlojamentoEhFutura(hoje, agora)).toBe(false);
  });

  it("retorna true para uma data futura", () => {
    const dataFutura = new Date(Date.UTC(2026, 8, 10));

    expect(dataAlojamentoEhFutura(dataFutura, agora)).toBe(true);
  });

  it("retorna false quando a data de hoje inclui um horário (não apenas meia-noite)", () => {
    const agoraComHorario = new Date(Date.UTC(2026, 8, 9, 23, 59, 59));
    const dataDeHojeComHorario = new Date(
      Date.UTC(2026, 8, 9, 14, 30, 0)
    );

    expect(
      dataAlojamentoEhFutura(dataDeHojeComHorario, agoraComHorario)
    ).toBe(false);
  });
});
