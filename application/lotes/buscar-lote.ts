import { buscarLotePorId } from "@/infrastructure/repositories/lote-repository";

export async function buscarLote(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return buscarLotePorId(id);
}
