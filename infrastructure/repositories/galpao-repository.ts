import { prisma } from "../database/prisma";

type CriarGalpaoDados = {
  nome: string;
  areaM2: number;
};

type AtualizarGalpaoDados = CriarGalpaoDados;

type GalpaoStatus =
  | "ATIVO"
  | "VAZIO_SANITARIO"
  | "MANUTENCAO"
  | "DESATIVADO";

const selectGalpao = {
  gal_id: true,
  gal_nome: true,
  gal_area_m2: true,
  gal_status: true,
} as const;

export async function listarGalpoes() {
  return prisma.galpao.findMany({
    select: selectGalpao,
    orderBy: {
      gal_nome: "asc",
    },
  });
}

export async function listarGalpoesDisponiveis() {
  return prisma.galpao.findMany({
    where: {
      gal_status: "ATIVO",
    },
    select: {
      gal_id: true,
      gal_nome: true,
      gal_area_m2: true,
    },
    orderBy: {
      gal_nome: "asc",
    },
  });
}

export async function buscarGalpaoPorId(id: number) {
  return prisma.galpao.findUnique({
    where: {
      gal_id: id,
    },
    select: selectGalpao,
  });
}

export async function buscarGalpaoPorNome(nome: string) {
  return prisma.galpao.findUnique({
    where: {
      gal_nome: nome,
    },
    select: {
      gal_id: true,
    },
  });
}

export async function criarGalpao(dados: CriarGalpaoDados) {
  return prisma.galpao.create({
    data: {
      gal_nome: dados.nome,
      gal_area_m2: dados.areaM2,
      gal_status: "ATIVO",
    },
    select: selectGalpao,
  });
}

export async function atualizarGalpao(
  id: number,
  dados: AtualizarGalpaoDados
) {
  return prisma.galpao.update({
    where: {
      gal_id: id,
    },
    data: {
      gal_nome: dados.nome,
      gal_area_m2: dados.areaM2,
    },
    select: selectGalpao,
  });
}

export async function atualizarStatusGalpao(
  id: number,
  status: GalpaoStatus
) {
  return prisma.galpao.update({
    where: {
      gal_id: id,
    },
    data: {
      gal_status: status,
    },
    select: selectGalpao,
  });
}

export async function existeLoteAtivoNoGalpao(id: number) {
  const lote = await prisma.lote_aves.findFirst({
    where: {
      gal_id: id,
      lta_status: "ATIVO",
    },
    select: {
      lta_id: true,
    },
  });

  return lote !== null;
}
