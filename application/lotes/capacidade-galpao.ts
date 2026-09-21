export function calcularCapacidadeMaximaAves(
  areaM2: number,
  densidadeMaximaAvesPorM2: number,
) {
  const areaValida = Number.isFinite(areaM2) && areaM2 > 0;
  const densidadeValida =
    Number.isFinite(densidadeMaximaAvesPorM2) &&
    densidadeMaximaAvesPorM2 > 0;

  if (!areaValida || !densidadeValida) {
    return 0;
  }

  return Math.floor(areaM2 * densidadeMaximaAvesPorM2);
}