import type {
  insumo_ins_fase_aplicacao,
  insumo_ins_status,
  insumo_ins_unidade_medida,
} from "@/generated/prisma/client";

import { prisma } from "../database/prisma";

type CriarInsumoDados = {
  nome: string;
  composicao: string | null;
  faseAplicacao: insumo_ins_fase_aplicacao;
  unidadeMedida: insumo_ins_unidade_medida;
  pontoRessuprimento: number;
  diasCarencia: number;
  categoriaId: number;
};

type AtualizarInsumoDados = CriarInsumoDados;

const selecaoInsumo = {
  ins_id: true,
  ins_nome: true,
  ins_composicao: true,
  ins_fase_aplicacao: true,
  ins_unidade_medida: true,
  ins_ponto_ressuprimento: true,
  ins_dias_carencia: true,
  ins_status: true,
  cti_id: true,
  categoria_insumo: {
    select: {
      cti_id: true,
      cti_descricao: true,
      cti_tipo: true,
    },
  },
} as const;

export async function listarInsumos(filtro?: { categoriaId?: number }) {
  return prisma.insumo.findMany({
    where: filtro?.categoriaId
      ? {
          cti_id: filtro.categoriaId,
        }
      : undefined,
    select: selecaoInsumo,
    orderBy: {
      ins_nome: "asc",
    },
  });
}

export async function listarInsumosAtivos() {
  return prisma.insumo.findMany({
    where: {
      ins_status: "ATIVO",
    },
    select: selecaoInsumo,
    orderBy: {
      ins_nome: "asc",
    },
  });
}

export async function buscarInsumoPorId(id: number) {
  return prisma.insumo.findUnique({
    where: {
      ins_id: id,
    },
    select: selecaoInsumo,
  });
}

export async function buscarInsumoPorNome(nome: string) {
  return prisma.insumo.findUnique({
    where: {
      ins_nome: nome,
    },
    select: {
      ins_id: true,
    },
  });
}

export async function criarInsumo(dados: CriarInsumoDados) {
  return prisma.insumo.create({
    data: {
      ins_nome: dados.nome,
      ins_composicao: dados.composicao,
      ins_fase_aplicacao: dados.faseAplicacao,
      ins_unidade_medida: dados.unidadeMedida,
      ins_ponto_ressuprimento: dados.pontoRessuprimento,
      ins_dias_carencia: dados.diasCarencia,
      ins_status: "ATIVO",
      categoria_insumo: {
        connect: { cti_id: dados.categoriaId },
      },
    },
    select: selecaoInsumo,
  });
}

export async function atualizarInsumo(
  id: number,
  dados: AtualizarInsumoDados
) {
  return prisma.insumo.update({
    where: {
      ins_id: id,
    },
    data: {
      ins_nome: dados.nome,
      ins_composicao: dados.composicao,
      ins_fase_aplicacao: dados.faseAplicacao,
      ins_unidade_medida: dados.unidadeMedida,
      ins_ponto_ressuprimento: dados.pontoRessuprimento,
      ins_dias_carencia: dados.diasCarencia,
      categoria_insumo: {
        connect: { cti_id: dados.categoriaId },
      },
    },
    select: selecaoInsumo,
  });
}

export async function atualizarStatusInsumo(
  id: number,
  status: insumo_ins_status
) {
  return prisma.insumo.update({
    where: {
      ins_id: id,
    },
    data: {
      ins_status: status,
    },
    select: selecaoInsumo,
  });
}
