import { listarTiposOvo as listarTiposOvoRepository } from "@/infrastructure/repositories/tipo-ovo-repository";

export async function listarTiposOvo() {
  return listarTiposOvoRepository();
}
