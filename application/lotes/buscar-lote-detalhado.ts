import { buscarLoteDetalhadoPorId } from "@/infrastructure/repositories/lote-repository";

export async function buscarLoteDetalhado(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return buscarLoteDetalhadoPorId(id);
}
