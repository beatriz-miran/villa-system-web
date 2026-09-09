import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { buscarUsuarioPorId } from "@/infrastructure/repositories/usuario-repository";

export async function buscarUsuario(id: number) {
  await exigirAdministrador();

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return buscarUsuarioPorId(id);
}