import {
  cartilha_linhagem_ctl_sistema,
} from "@/generated/prisma/client";

import { prisma } from "../database/prisma";

export type CartilhaLinhagemDados = {
  titulo: string;
  fonte: string;
  sistema: cartilha_linhagem_ctl_sistema;
  edicao: string | null;
  url: string;
};

const selecaoCartilha = {
  ctl_id: true,
  ctl_titulo: true,
  ctl_fonte: true,
  ctl_sistema: true,
  ctl_edicao: true,
  ctl_url: true,
  lin_id: true,
} as const;

export async function listarCartilhasDaLinhagem(
  linhagemId: number
) {
  return prisma.cartilha_linhagem.findMany({
    where: {
      lin_id: linhagemId,
    },
    select: selecaoCartilha,
    orderBy: {
      ctl_titulo: "asc",
    },
  });
}

export async function buscarCartilhaPorId(id: number) {
  return prisma.cartilha_linhagem.findUnique({
    where: {
      ctl_id: id,
    },
    select: selecaoCartilha,
  });
}

export async function buscarCartilhaPorUrl(
  linhagemId: number,
  url: string
) {
  return prisma.cartilha_linhagem.findFirst({
    where: {
      lin_id: linhagemId,
      ctl_url: url,
    },
    select: {
      ctl_id: true,
    },
  });
}

export async function criarCartilhaLinhagem(
  linhagemId: number,
  dados: CartilhaLinhagemDados
) {
  return prisma.cartilha_linhagem.create({
    data: {
      ctl_titulo: dados.titulo,
      ctl_fonte: dados.fonte,
      ctl_sistema: dados.sistema,
      ctl_edicao: dados.edicao,
      ctl_url: dados.url,
      lin_id: linhagemId,
    },
    select: selecaoCartilha,
  });
}

export async function atualizarCartilhaLinhagem(
  id: number,
  dados: CartilhaLinhagemDados
) {
  return prisma.cartilha_linhagem.update({
    where: {
      ctl_id: id,
    },
    data: {
      ctl_titulo: dados.titulo,
      ctl_fonte: dados.fonte,
      ctl_sistema: dados.sistema,
      ctl_edicao: dados.edicao,
      ctl_url: dados.url,
      updated_at: new Date(),
    },
    select: selecaoCartilha,
  });
}

export async function excluirCartilhaLinhagem(id: number) {
  return prisma.cartilha_linhagem.delete({
    where: {
      ctl_id: id,
    },
  });
}