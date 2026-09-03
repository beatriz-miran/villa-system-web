import { buscarHistoricoFornecimento as buscarHistoricoFornecimentoRepository } from "@/infrastructure/repositories/fornecedor-repository";

export async function buscarHistoricoFornecimento(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    return {
      lotesAves: [],
      entradasInsumo: [],
    };
  }

  return buscarHistoricoFornecimentoRepository(id);
}
