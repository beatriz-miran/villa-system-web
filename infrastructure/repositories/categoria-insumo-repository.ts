import type { categoria_insumo_cti_tipo } from "@/generated/prisma/client";

import { prisma } from "../database/prisma";

type CriarCategoriaInsumoDados = {
  descricao: string;
  tipo: categoria_insumo_cti_tipo;
};

type AtualizarCategoriaInsumoDados = CriarCategoriaInsumoDados;

const selecaoCategoriaInsumo = {
  cti_id: true,
  cti_descricao: true,
  cti_tipo: true,
} as const;

export async function listarCategoriasInsumo() {
  return prisma.categoria_insumo.findMany({
    select: selecaoCategoriaInsumo,
    orderBy: {
      cti_descricao: "asc",
    },
  });
}

export async function buscarCategoriaInsumoPorId(id: number) {
  return prisma.categoria_insumo.findUnique({
    where: {
      cti_id: id,
    },
    select: selecaoCategoriaInsumo,
  });
}

export async function buscarCategoriaInsumoPorDescricao(descricao: string) {
  return prisma.categoria_insumo.findUnique({
    where: {
      cti_descricao: descricao,
    },
    select: {
      cti_id: true,
    },
  });
}

export async function criarCategoriaInsumo(
  dados: CriarCategoriaInsumoDados
) {
  return prisma.categoria_insumo.create({
    data: {
      cti_descricao: dados.descricao,
      cti_tipo: dados.tipo,
    },
    select: selecaoCategoriaInsumo,
  });
}

export async function atualizarCategoriaInsumo(
  id: number,
  dados: AtualizarCategoriaInsumoDados
) {
  return prisma.categoria_insumo.update({
    where: {
      cti_id: id,
    },
    data: {
      cti_descricao: dados.descricao,
      cti_tipo: dados.tipo,
    },
    select: selecaoCategoriaInsumo,
  });
}
