import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { buscarFornecedorPorId } from "@/infrastructure/repositories/fornecedor-repository";

export async function buscarFornecedor(id: number) {
  await exigirAdministrador();

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return buscarFornecedorPorId(id);
}