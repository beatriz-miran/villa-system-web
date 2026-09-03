import { prisma } from "../database/prisma";

export async function listarCategoriasFornecedor() {
  return prisma.categoria_fornecedor.findMany({
    select: {
      ctf_id: true,
      ctf_descricao: true,
    },
    orderBy: {
      ctf_descricao: "asc",
    },
  });
}
