import { listarBaixasDoLote } from "@/infrastructure/repositories/mortalidade-descarte-repository";

export async function listarBaixasLote(
  loteId: number,
) {
  if (
    !Number.isInteger(loteId) ||
    loteId <= 0
  ) {
    return [];
  }

  return listarBaixasDoLote(loteId);
}