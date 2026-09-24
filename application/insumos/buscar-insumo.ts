import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { buscarInsumoPorId } from "@/infrastructure/repositories/insumo-repository";

export async function buscarInsumo(id: number) {
  await exigirAdministrador();

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return buscarInsumoPorId(id);
}
