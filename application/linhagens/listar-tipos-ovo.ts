import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { listarTiposOvo as listarTiposOvoRepository } from "@/infrastructure/repositories/tipo-ovo-repository";

export async function listarTiposOvo() {
  await exigirAdministrador();

  return listarTiposOvoRepository();
}
