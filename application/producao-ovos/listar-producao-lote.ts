import { listarProducaoDoLote } from "@/infrastructure/repositories/producao-ovo-repository";

export async function listarProducaoLote(
  loteId: number,
) {
  if (
    !Number.isInteger(loteId) ||
    loteId <= 0
  ) {
    return [];
  }

  return listarProducaoDoLote(loteId);
}
