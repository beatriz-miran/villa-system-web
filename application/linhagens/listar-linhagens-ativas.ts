import { listarLinhagensAtivas as listarLinhagensAtivasRepository } from "@/infrastructure/repositories/linhagem-repository";

/**
 * Usado no cadastro de lotes: somente linhagens ativas podem ser
 * selecionadas para um novo lote.
 */
export async function listarLinhagensAtivas() {
  return listarLinhagensAtivasRepository();
}
