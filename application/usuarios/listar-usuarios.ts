import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { listarUsuarios as listarUsuariosRepository } from "@/infrastructure/repositories/usuario-repository";

export async function listarUsuarios() {
  await exigirAdministrador();

  return listarUsuariosRepository();
}