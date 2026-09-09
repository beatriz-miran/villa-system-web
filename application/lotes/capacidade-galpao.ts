// Densidade de referência para aviários de postura em sistema alternativo
// (aprox. 7 aves/m²), usada como limite de lotação por não haver um campo
// de capacidade cadastrado no galpão.
export const DENSIDADE_MAXIMA_AVES_POR_M2 = 7;

export function calcularCapacidadeMaximaAves(areaM2: number) {
  return Math.floor(areaM2 * DENSIDADE_MAXIMA_AVES_POR_M2);
}
