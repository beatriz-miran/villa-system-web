import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { buscarLinhagemPorId } from "@/infrastructure/repositories/linhagem-repository";

export async function buscarLinhagem(id: number) {
  await exigirAdministrador();

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return buscarLinhagemPorId(id);
}
