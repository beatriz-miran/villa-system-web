import { listarCategoriasFornecedor as listarCategoriasFornecedorRepository } from "@/infrastructure/repositories/categoria-fornecedor-repository";

export async function listarCategoriasFornecedor() {
  return listarCategoriasFornecedorRepository();
}
