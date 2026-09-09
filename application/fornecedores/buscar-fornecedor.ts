import { buscarFornecedorPorId } from "@/infrastructure/repositories/fornecedor-repository";

export async function buscarFornecedor(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return buscarFornecedorPorId(id);
}
