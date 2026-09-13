import type {
  cartilha_linhagem_ctl_sistema,
} from "@/generated/prisma/client";

import { prisma } from "../database/prisma";

type MetaLinhagemDados = {
  semana: number;
  pesoMetaGramas: number | null;
  consumoMetaGramas: number | null;
  produtividadeMetaPercentual: number | null;
};

type CartilhaLinhagemDados = {
  titulo: string;
  fonte: string;
  sistema: cartilha_linhagem_ctl_sistema;
  edicao: string | null;
  url: string;
};

type CriarLinhagemDados = {
  nome: string;
  descricao: string | null;
  tipoOvoId: number;
  metas: MetaLinhagemDados[];
  cartilhas: CartilhaLinhagemDados[];
};

type AtualizarLinhagemDados = CriarLinhagemDados;

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
      cartilhas: {
        select: {
          ctl_id: true,
          ctl_titulo: true,
          ctl_fonte: true,
          ctl_sistema: true,
          ctl_edicao: true,
          ctl_url: true,
          lin_id: true,
        },
        orderBy: {
          ctl_titulo: "asc",
        },
      },
      meta_linhagem_semanal: {
        select: {
          mls_id: true,
          mls_semana: true,
          mls_peso_meta_gramas: true,
          mls_consumo_meta_gramas: true,
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
  return prisma.linhagem.findFirst({
    where: {
      lin_nome: {
        equals: nome,
        mode: "insensitive",
      },
    },
    select: {
      lin_id: true,
    },
  });
}

export async function criarLinhagem(
  dados: CriarLinhagemDados
) {
  return prisma.linhagem.create({
    data: {
      lin_nome: dados.nome,
      lin_descricao: dados.descricao,
      lin_status: "ATIVO",
      tipo_ovo: {
        connect: {
          tov_id: dados.tipoOvoId,
        },
      },
      cartilhas: {
        create: dados.cartilhas.map((cartilha) => ({
          ctl_titulo: cartilha.titulo,
          ctl_fonte: cartilha.fonte,
          ctl_sistema: cartilha.sistema,
          ctl_edicao: cartilha.edicao,
          ctl_url: cartilha.url,
        })),
      },
      meta_linhagem_semanal: {
        create: dados.metas.map((meta) => ({
          mls_semana: meta.semana,
          mls_peso_meta_gramas: meta.pesoMetaGramas,
          mls_consumo_meta_gramas: meta.consumoMetaGramas,
          mls_produtividade_meta_percentual:
            meta.produtividadeMetaPercentual,
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
    const linhagemAtualizada = await tx.linhagem.update({
      where: {
        lin_id: id,
      },
      data: {
        lin_nome: dados.nome,
        lin_descricao: dados.descricao,
        updated_at: new Date(),
        tipo_ovo: {
          connect: {
            tov_id: dados.tipoOvoId,
          },
        },
      },
      select: selecaoLinhagem,
    });

    const semanasInformadas = dados.metas.map(
      (meta) => meta.semana
    );

    await tx.meta_linhagem_semanal.deleteMany({
      where: {
        lin_id: id,
        ...(semanasInformadas.length > 0
          ? {
              mls_semana: {
                notIn: semanasInformadas,
              },
            }
          : {}),
      },
    });

    await Promise.all(
      dados.metas.map((meta) =>
        tx.meta_linhagem_semanal.upsert({
          where: {
            lin_id_mls_semana: {
              lin_id: id,
              mls_semana: meta.semana,
            },
          },
          update: {
            mls_peso_meta_gramas: meta.pesoMetaGramas,
            mls_consumo_meta_gramas: meta.consumoMetaGramas,
            mls_produtividade_meta_percentual:
              meta.produtividadeMetaPercentual,
          },
          create: {
            lin_id: id,
            mls_semana: meta.semana,
            mls_peso_meta_gramas: meta.pesoMetaGramas,
            mls_consumo_meta_gramas: meta.consumoMetaGramas,
            mls_produtividade_meta_percentual:
              meta.produtividadeMetaPercentual,
          },
        })
      )
    );

    await tx.cartilha_linhagem.deleteMany({
      where: {
        lin_id: id,
      },
    });

    if (dados.cartilhas.length > 0) {
      await tx.cartilha_linhagem.createMany({
        data: dados.cartilhas.map((cartilha) => ({
          ctl_titulo: cartilha.titulo,
          ctl_fonte: cartilha.fonte,
          ctl_sistema: cartilha.sistema,
          ctl_edicao: cartilha.edicao,
          ctl_url: cartilha.url,
          lin_id: id,
        })),
      });
    }

    return linhagemAtualizada;
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
      updated_at: new Date(),
    },
    select: selecaoLinhagem,
  });
}