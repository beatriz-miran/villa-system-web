import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { listarCategoriasFornecedor as listarCategoriasFornecedorRepository } from "@/infrastructure/repositories/categoria-fornecedor-repository";

export async function listarCategoriasFornecedor() {
  await exigirAdministrador();

  return listarCategoriasFornecedorRepository();
}