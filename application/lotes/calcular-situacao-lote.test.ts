import { describe, expect, it } from "vitest";

import {
  calcularFaseAtual,
  calcularIdadeAtualDias,
  calcularPercentualOcupacao,
  calcularQuantidadeAtual,
  calcularSemanaAtual,
} from "./calcular-situacao-lote";

describe("calcularIdadeAtualDias", () => {
  it("soma a idade inicial aos dias transcorridos desde o alojamento", () => {
    const idadeAtual = calcularIdadeAtualDias({
      idadeInicialDias: 2,
      dataAlojamento: new Date(Date.UTC(2025, 11, 2)),
      dataReferencia: new Date(Date.UTC(2026, 8, 15)),
    });

    expect(idadeAtual).toBe(289);
  });

  it("desconsidera os horários e compara somente as datas", () => {
    const idadeAtual = calcularIdadeAtualDias({
      idadeInicialDias: 1,
      dataAlojamento: new Date(Date.UTC(2026, 8, 10, 23, 30)),
      dataReferencia: new Date(Date.UTC(2026, 8, 11, 1, 30)),
    });

    expect(idadeAtual).toBe(2);
  });

  it("não diminui a idade quando a data de referência é anterior", () => {
    const idadeAtual = calcularIdadeAtualDias({
      idadeInicialDias: 3,
      dataAlojamento: new Date(Date.UTC(2026, 8, 15)),
      dataReferencia: new Date(Date.UTC(2026, 8, 14)),
    });

    expect(idadeAtual).toBe(3);
  });

  it("trata uma idade inicial negativa como zero", () => {
    const idadeAtual = calcularIdadeAtualDias({
      idadeInicialDias: -2,
      dataAlojamento: new Date(Date.UTC(2026, 8, 15)),
      dataReferencia: new Date(Date.UTC(2026, 8, 15)),
    });

    expect(idadeAtual).toBe(0);
  });
});

describe("calcularSemanaAtual", () => {
  it("considera os primeiros sete dias como primeira semana", () => {
    expect(calcularSemanaAtual(0)).toBe(1);
    expect(calcularSemanaAtual(6)).toBe(1);
    expect(calcularSemanaAtual(7)).toBe(2);
  });

  it("trata idades negativas como pertencentes à primeira semana", () => {
    expect(calcularSemanaAtual(-10)).toBe(1);
  });
});

describe("calcularFaseAtual", () => {
  it("classifica como cria até a sexta semana", () => {
    expect(calcularFaseAtual(0)).toBe("CRIA");
    expect(calcularFaseAtual(41)).toBe("CRIA");
  });

  it("classifica como recria da sétima até a décima quinta semana", () => {
    expect(calcularFaseAtual(42)).toBe("RECRIA");
    expect(calcularFaseAtual(104)).toBe("RECRIA");
  });

  it("classifica como pré-postura da décima sexta até a décima nona semana", () => {
    expect(calcularFaseAtual(105)).toBe("PRE_POSTURA");
    expect(calcularFaseAtual(132)).toBe("PRE_POSTURA");
  });

  it("classifica como postura a partir da vigésima semana", () => {
    expect(calcularFaseAtual(133)).toBe("POSTURA");
    expect(calcularFaseAtual(289)).toBe("POSTURA");
  });
});

describe("calcularQuantidadeAtual", () => {
  it("subtrai as baixas da quantidade inicial", () => {
    expect(calcularQuantidadeAtual(100, 8)).toBe(92);
  });

  it("não permite que a quantidade atual seja negativa", () => {
    expect(calcularQuantidadeAtual(100, 120)).toBe(0);
  });

  it("desconsidera valores negativos", () => {
    expect(calcularQuantidadeAtual(100, -5)).toBe(100);
    expect(calcularQuantidadeAtual(-100, 5)).toBe(0);
  });
});

describe("calcularPercentualOcupacao", () => {
  it("calcula o percentual ocupado da capacidade do galpão", () => {
    expect(calcularPercentualOcupacao(92, 240)).toBeCloseTo(
      38.33,
      2,
    );
  });

  it("retorna zero quando a capacidade não é válida", () => {
    expect(calcularPercentualOcupacao(100, 0)).toBe(0);
    expect(calcularPercentualOcupacao(100, -20)).toBe(0);
  });

  it("não permite percentual negativo", () => {
    expect(calcularPercentualOcupacao(-10, 200)).toBe(0);
  });
});