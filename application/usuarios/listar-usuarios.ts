import { listarUsuarios as listarUsuariosRepository } from "@/infrastructure/repositories/usuario-repository";

export async function listarUsuarios() {
  return listarUsuariosRepository();
}
