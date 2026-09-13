import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { buscarGalpaoPorId } from "@/infrastructure/repositories/galpao-repository";

export async function buscarGalpao(id: number) {
  await exigirAdministrador();

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return buscarGalpaoPorId(id);
}