import { listarInsumosAtivos as listarInsumosAtivosRepository } from "@/infrastructure/repositories/insumo-repository";

/**
 * Usado nas movimentações de estoque e nas rotinas de manejo: somente
 * insumos ativos podem ser selecionados.
 */
export async function listarInsumosAtivos() {
  return listarInsumosAtivosRepository();
}
