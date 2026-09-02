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

export async function buscarTipoOvoPorId(id: number) {
  return prisma.tipo_ovo.findUnique({
    where: {
      tov_id: id,
    },
    select: {
      tov_id: true,
    },
  });
}
