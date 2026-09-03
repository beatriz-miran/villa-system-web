import { listarGalpoesDisponiveis as listarGalpoesDisponiveisRepository } from "@/infrastructure/repositories/galpao-repository";

export async function listarGalpoesDisponiveis() {
  return listarGalpoesDisponiveisRepository();
}
