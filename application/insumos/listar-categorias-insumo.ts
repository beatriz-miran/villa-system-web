import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { listarCategoriasInsumo as listarCategoriasInsumoRepository } from "@/infrastructure/repositories/categoria-insumo-repository";

export async function listarCategoriasInsumo() {
  await exigirAdministrador();

  return listarCategoriasInsumoRepository();
}
