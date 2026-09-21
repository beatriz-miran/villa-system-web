import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { listarGalpoes as listarGalpoesRepository } from "@/infrastructure/repositories/galpao-repository";

export async function listarGalpoes() {
  await exigirAdministrador();

  return listarGalpoesRepository();
}