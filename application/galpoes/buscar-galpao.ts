import { buscarGalpaoPorId } from "@/infrastructure/repositories/galpao-repository";

export async function buscarGalpao(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return buscarGalpaoPorId(id);
}
