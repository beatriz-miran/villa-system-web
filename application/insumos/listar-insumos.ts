import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { listarInsumos as listarInsumosRepository } from "@/infrastructure/repositories/insumo-repository";

export async function listarInsumos(filtro?: { categoriaId?: number }) {
  await exigirAdministrador();

  return listarInsumosRepository(filtro);
}
