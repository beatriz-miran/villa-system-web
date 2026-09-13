import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { listarFornecedores as listarFornecedoresRepository } from "@/infrastructure/repositories/fornecedor-repository";

export async function listarFornecedores() {
  await exigirAdministrador();

  return listarFornecedoresRepository();
}