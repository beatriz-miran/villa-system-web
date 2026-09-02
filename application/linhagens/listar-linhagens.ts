import { listarLinhagens as listarLinhagensRepository } from "@/infrastructure/repositories/linhagem-repository";

export async function listarLinhagens() {
  return listarLinhagensRepository();
}
