import { prisma } from "../database/prisma";

type MetaLinhagemDados = {
  semana: number;
  pesoMetaGramas: number | null;
  produtividadeMetaPercentual: number | null;
};

type CriarLinhagemDados = {
  nome: string;
  descricao: string | null;
  tipoOvoId: number;
  metas: MetaLinhagemDados[];
};

type AtualizarLinhagemDados = {
  nome: string;
  descricao: string | null;
  tipoOvoId: number;
  metas: MetaLinhagemDados[];
};

type LinhagemStatus = "ATIVO" | "INATIVO";

const selecaoLinhagem = {
  lin_id: true,
  lin_nome: true,
  lin_descricao: true,
  lin_status: true,
  tov_id: true,
  tipo_ovo: {
    select: {
      tov_id: true,
      tov_nome: true,
    },
  },
} as const;

export async function listarLinhagens() {
  return prisma.linhagem.findMany({
    select: selecaoLinhagem,
    orderBy: {
      lin_nome: "asc",
    },
  });
}

export async function listarLinhagensAtivas() {
  return prisma.linhagem.findMany({
    where: {
      lin_status: "ATIVO",
    },
    select: selecaoLinhagem,
    orderBy: {
      lin_nome: "asc",
    },
  });
}

export async function buscarLinhagemPorId(id: number) {
  return prisma.linhagem.findUnique({
    where: {
      lin_id: id,
    },
    select: {
      ...selecaoLinhagem,
      meta_linhagem_semanal: {
        select: {
          mls_id: true,
          mls_semana: true,
          mls_peso_meta_gramas: true,
          mls_produtividade_meta_percentual: true,
        },
        orderBy: {
          mls_semana: "asc",
        },
      },
    },
  });
}

export async function buscarLinhagemPorNome(nome: string) {
  return prisma.linhagem.findUnique({
    where: {
      lin_nome: nome,
    },
    select: {
      lin_id: true,
    },
  });
}

export async function criarLinhagem(dados: CriarLinhagemDados) {
  return prisma.linhagem.create({
    data: {
      lin_nome: dados.nome,
      lin_descricao: dados.descricao,
      lin_status: "ATIVO",
      tipo_ovo: {
        connect: { tov_id: dados.tipoOvoId },
      },
      meta_linhagem_semanal: {
        create: dados.metas.map((meta) => ({
          mls_semana: meta.semana,
          mls_peso_meta_gramas: meta.pesoMetaGramas,
          mls_produtividade_meta_percentual: meta.produtividadeMetaPercentual,
        })),
      },
    },
    select: selecaoLinhagem,
  });
}

export async function atualizarLinhagem(
  id: number,
  dados: AtualizarLinhagemDados
) {
  return prisma.$transaction(async (tx) => {
    await tx.meta_linhagem_semanal.deleteMany({
      where: { lin_id: id },
    });

    return tx.linhagem.update({
      where: { lin_id: id },
      data: {
        lin_nome: dados.nome,
        lin_descricao: dados.descricao,
        tipo_ovo: {
          connect: { tov_id: dados.tipoOvoId },
        },
        meta_linhagem_semanal: {
          create: dados.metas.map((meta) => ({
            mls_semana: meta.semana,
            mls_peso_meta_gramas: meta.pesoMetaGramas,
            mls_produtividade_meta_percentual:
              meta.produtividadeMetaPercentual,
          })),
        },
      },
      select: selecaoLinhagem,
    });
  });
}

export async function atualizarStatusLinhagem(
  id: number,
  status: LinhagemStatus
) {
  return prisma.linhagem.update({
    where: {
      lin_id: id,
    },
    data: {
      lin_status: status,
    },
    select: selecaoLinhagem,
  });
}
