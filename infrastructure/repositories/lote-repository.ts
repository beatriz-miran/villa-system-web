import { prisma } from "../database/prisma";

type CriarLoteDados = {
  codigo: string;
  linhagemId: number;
  galpaoId: number;
  fornecedorId: number;
  quantidadeInicial: number;
  dataAlojamento: Date;
  registradoPorId: number;
};

type AtualizarLoteDados = {
  linhagemId: number;
  galpaoId: number;
  fornecedorId: number;
  quantidadeInicial: number;
  dataAlojamento: Date;
};

const selectLoteResumo = {
  lta_id: true,
  lta_codigo_qr_code: true,
  lta_quant_inicial: true,
  lta_data_alojamento: true,
  lta_status: true,
  linhagem: {
    select: {
      lin_nome: true,
    },
  },
  galpao: {
    select: {
      gal_nome: true,
    },
  },
  fornecedor: {
    select: {
      for_razao_social: true,
    },
  },
} as const;

const selectLoteDetalhado = {
  lta_id: true,
  lta_codigo_qr_code: true,
  lta_quant_inicial: true,
  lta_data_alojamento: true,
  lta_idade_inicial: true,
  lta_fase: true,
  lta_status: true,
  created_at: true,
  linhagem: {
    select: {
      lin_id: true,
      lin_nome: true,
    },
  },
  galpao: {
    select: {
      gal_id: true,
      gal_nome: true,
      gal_area_m2: true,
    },
  },
  fornecedor: {
    select: {
      for_id: true,
      for_razao_social: true,
      for_nome_fantasia: true,
    },
  },
  usuario: {
    select: {
      usu_nome: true,
    },
  },
} as const;

const selectLoteEdicao = {
  lta_id: true,
  lta_quant_inicial: true,
  lta_data_alojamento: true,
  lin_id: true,
  gal_id: true,
  for_id: true,
} as const;

export async function listarLotes() {
  return prisma.lote_aves.findMany({
    select: selectLoteResumo,
    orderBy: {
      lta_data_alojamento: "desc",
    },
  });
}

export async function buscarLotePorId(id: number) {
  return prisma.lote_aves.findUnique({
    where: {
      lta_id: id,
    },
    select: selectLoteEdicao,
  });
}

export async function buscarLoteDetalhadoPorId(id: number) {
  return prisma.lote_aves.findUnique({
    where: {
      lta_id: id,
    },
    select: selectLoteDetalhado,
  });
}

export async function buscarLotePorCodigo(codigo: string) {
  return prisma.lote_aves.findUnique({
    where: {
      lta_codigo_qr_code: codigo,
    },
    select: {
      lta_id: true,
    },
  });
}

export async function criarLote(dados: CriarLoteDados) {
  return prisma.lote_aves.create({
    data: {
      lta_codigo_qr_code: dados.codigo,
      lta_quant_inicial: dados.quantidadeInicial,
      lta_data_alojamento: dados.dataAlojamento,
      linhagem: {
        connect: { lin_id: dados.linhagemId },
      },
      galpao: {
        connect: { gal_id: dados.galpaoId },
      },
      fornecedor: {
        connect: { for_id: dados.fornecedorId },
      },
      usuario: {
        connect: { usu_id: dados.registradoPorId },
      },
    },
    select: selectLoteResumo,
  });
}

export async function atualizarLote(
  id: number,
  dados: AtualizarLoteDados
) {
  return prisma.lote_aves.update({
    where: {
      lta_id: id,
    },
    data: {
      lta_quant_inicial: dados.quantidadeInicial,
      lta_data_alojamento: dados.dataAlojamento,
      linhagem: {
        connect: { lin_id: dados.linhagemId },
      },
      galpao: {
        connect: { gal_id: dados.galpaoId },
      },
      fornecedor: {
        connect: { for_id: dados.fornecedorId },
      },
    },
    select: selectLoteResumo,
  });
}
