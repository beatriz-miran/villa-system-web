import { listarFornecedoresAtivos as listarFornecedoresAtivosRepository } from "@/infrastructure/repositories/fornecedor-repository";

export async function listarFornecedoresAtivos() {
  return listarFornecedoresAtivosRepository();
}
