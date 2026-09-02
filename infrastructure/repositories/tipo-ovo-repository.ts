import { prisma } from "../database/prisma";

export async function listarTiposOvo() {
  return prisma.tipo_ovo.findMany({
    select: {
      tov_id: true,
      tov_nome: true,
    },
    orderBy: {
      tov_nome: "asc",
    },
  });
}
