import { listarGalpoes as listarGalpoesRepository } from "@/infrastructure/repositories/galpao-repository";

export async function listarGalpoes() {
  return listarGalpoesRepository();
}
