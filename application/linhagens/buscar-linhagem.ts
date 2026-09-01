import { buscarLinhagemPorId } from "@/infrastructure/repositories/linhagem-repository";

export async function buscarLinhagem(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return buscarLinhagemPorId(id);
}
