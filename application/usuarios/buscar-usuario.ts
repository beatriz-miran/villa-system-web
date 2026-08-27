import { buscarUsuarioPorId } from "@/infrastructure/repositories/usuario-repository";

export async function buscarUsuario(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return buscarUsuarioPorId(id);
}
