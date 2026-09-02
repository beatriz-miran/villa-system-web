import { exigirAdministrador } from "@/application/autorizacao/exigir-administrador";
import { listarLinhagens as listarLinhagensRepository } from "@/infrastructure/repositories/linhagem-repository";

export async function listarLinhagens() {
  await exigirAdministrador();

  return listarLinhagensRepository();
}
