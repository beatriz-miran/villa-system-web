import { listarFornecedores as listarFornecedoresRepository } from "@/infrastructure/repositories/fornecedor-repository";

export async function listarFornecedores() {
  return listarFornecedoresRepository();
}
