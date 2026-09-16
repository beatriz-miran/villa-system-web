import type { FaseLote } from "./status-lote";

const MILISSEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;

type CalcularIdadeAtualDiasParams = {
  idadeInicialDias: number;
  dataAlojamento: Date;
  dataReferencia?: Date;
};

function obterInicioDoDiaUtc(data: Date) {
  return Date.UTC(
    data.getUTCFullYear(),
    data.getUTCMonth(),
    data.getUTCDate(),
  );
}

export function calcularIdadeAtualDias({
  idadeInicialDias,
  dataAlojamento,
  dataReferencia = new Date(),
}: CalcularIdadeAtualDiasParams) {
  const idadeInicialValida = Math.max(0, Math.floor(idadeInicialDias));

  const diasDesdeAlojamento = Math.max(
    0,
    Math.floor(
      (obterInicioDoDiaUtc(dataReferencia) -
        obterInicioDoDiaUtc(dataAlojamento)) /
        MILISSEGUNDOS_POR_DIA,
    ),
  );

  return idadeInicialValida + diasDesdeAlojamento;
}

export function calcularSemanaAtual(idadeAtualDias: number) {
  const idadeValida = Math.max(0, Math.floor(idadeAtualDias));

  return Math.floor(idadeValida / 7) + 1;
}

export function calcularFaseAtual(idadeAtualDias: number): FaseLote {
  const semanaAtual = calcularSemanaAtual(idadeAtualDias);

  if (semanaAtual <= 6) {
    return "CRIA";
  }

  if (semanaAtual <= 15) {
    return "RECRIA";
  }

  if (semanaAtual <= 19) {
    return "PRE_POSTURA";
  }

  return "POSTURA";
}

export function calcularQuantidadeAtual(
  quantidadeInicial: number,
  totalBaixas: number,
) {
  const quantidadeInicialValida = Math.max(
    0,
    Math.floor(quantidadeInicial),
  );

  const totalBaixasValido = Math.max(0, Math.floor(totalBaixas));

  return Math.max(0, quantidadeInicialValida - totalBaixasValido);
}

export function calcularPercentualOcupacao(
  quantidadeAves: number,
  capacidadeMaxima: number,
) {
  if (capacidadeMaxima <= 0) {
    return 0;
  }

  const quantidadeValida = Math.max(0, quantidadeAves);

  return (quantidadeValida / capacidadeMaxima) * 100;
}