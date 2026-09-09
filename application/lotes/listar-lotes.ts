import { listarLotes as listarLotesRepository } from "@/infrastructure/repositories/lote-repository";

export async function listarLotes() {
  return listarLotesRepository();
}
