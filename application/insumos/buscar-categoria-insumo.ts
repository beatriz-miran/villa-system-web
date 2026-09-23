import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { buscarCategoriaInsumoPorId } from "@/infrastructure/repositories/categoria-insumo-repository";

export async function buscarCategoriaInsumo(id: number) {
  await exigirAdministrador();

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return buscarCategoriaInsumoPorId(id);
}
