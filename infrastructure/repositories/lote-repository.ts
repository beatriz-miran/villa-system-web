import type { Prisma } from "../../generated/prisma/client";

import { prisma } from "../database/prisma";

type CriarLoteDados = {
  codigo: string;
  linhagemId: number;
  galpaoId: number;
  fornecedorId: number;
  quantidadeInicial: number;
  idadeInicialDias: number;
  dataAlojamento: Date;
  registradoPorId: number;
};

type AtualizarLoteDados = {
  linhagemId: number;
  galpaoId: number;
  fornecedorId: number;
  quantidadeInicial: number;
  idadeInicialDias: number;
  dataAlojamento: Date;
};

type FinalizarLoteDados = {
  dataEncerramento: Date;
  motivoEncerramento: string;
  destinoAves: string;
};

const selectLoteResumo = {
  lta_id: true,
  lta_codigo_qr_code: true,
  lta_quant_inicial: true,
  lta_idade_inicial: true,
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
  lta_data_encerramento: true,
  lta_motivo_encerramento: true,
  lta_destino_descarte: true,
  created_at: true,
  linhagem: {
    select: {
      lin_id: true,
      lin_nome: true,
      lin_densidade_maxima_aves_m2:
        true,
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
  mortalidade_descarte: {
    where: {
      mor_status_registro: "ATIVO",
    },
    select: {
      mor_quantidade: true,
    },
  },
} as const;

const selectLoteEdicao = {
  lta_id: true,
  lta_quant_inicial: true,
  lta_idade_inicial: true,
  lta_data_alojamento: true,
  lin_id: true,
  gal_id: true,
  for_id: true,
} as const;

const selectLoteAtualizacao = {
  lta_id: true,
  lta_quant_inicial: true,
  lta_idade_inicial: true,
  lta_data_alojamento: true,
  lta_status: true,
  lin_id: true,
  gal_id: true,
  for_id: true,
  mortalidade_descarte: {
    select: {
      mor_data: true,
      mor_quantidade: true,
      mor_status_registro: true,
    },
  },
} as const;

const selectLoteFinalizacao = {
  lta_id: true,
  lta_status: true,
  lta_data_alojamento: true,
  mortalidade_descarte: {
    where: {
      mor_status_registro: "ATIVO",
    },
    select: {
      mor_data: true,
    },
  },
} as const;

async function buscarLoteParaAtualizacaoComCliente(
  cliente: Prisma.TransactionClient,
  id: number,
) {
  return cliente.lote_aves.findUnique({
    where: {
      lta_id: id,
    },
    select: selectLoteAtualizacao,
  });
}

async function atualizarLoteComCliente(
  cliente: Prisma.TransactionClient,
  id: number,
  dados: AtualizarLoteDados,
) {
  return cliente.lote_aves.update({
    where: {
      lta_id: id,
    },
    data: {
      lta_quant_inicial:
        dados.quantidadeInicial,
      lta_idade_inicial:
        dados.idadeInicialDias,
      lta_data_alojamento:
        dados.dataAlojamento,
      updated_at: new Date(),
      linhagem: {
        connect: {
          lin_id: dados.linhagemId,
        },
      },
      galpao: {
        connect: {
          gal_id: dados.galpaoId,
        },
      },
      fornecedor: {
        connect: {
          for_id: dados.fornecedorId,
        },
      },
    },
    select: selectLoteResumo,
  });
}

async function buscarLoteParaFinalizacaoComCliente(
  cliente: Prisma.TransactionClient,
  id: number,
) {
  return cliente.lote_aves.findUnique({
    where: {
      lta_id: id,
    },
    select: selectLoteFinalizacao,
  });
}

async function finalizarLoteComCliente(
  cliente: Prisma.TransactionClient,
  id: number,
  dados: FinalizarLoteDados,
) {
  return cliente.lote_aves.update({
    where: {
      lta_id: id,
    },
    data: {
      lta_status: "FINALIZADO",
      lta_data_encerramento:
        dados.dataEncerramento,
      lta_motivo_encerramento:
        dados.motivoEncerramento,
      lta_destino_descarte:
        dados.destinoAves,
      updated_at: new Date(),
    },
    select: {
      lta_id: true,
      lta_status: true,
      lta_data_encerramento: true,
      lta_motivo_encerramento: true,
      lta_destino_descarte: true,
    },
  });
}

type OperacoesAtualizacaoLote = {
  buscarLoteParaAtualizacao: () => ReturnType<
    typeof buscarLoteParaAtualizacaoComCliente
  >;

  atualizarLote: (
    dados: AtualizarLoteDados,
  ) => ReturnType<
    typeof atualizarLoteComCliente
  >;
};

type OperacoesFinalizacaoLote = {
  buscarLoteParaFinalizacao: () => ReturnType<
    typeof buscarLoteParaFinalizacaoComCliente
  >;

  finalizarLote: (
    dados: FinalizarLoteDados,
  ) => ReturnType<
    typeof finalizarLoteComCliente
  >;
};

export async function executarAtualizacaoLoteComBloqueio<T>(
  id: number,
  operacao: (
    repositorio: OperacoesAtualizacaoLote,
  ) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(
    async (transacao) => {
      await transacao.$queryRaw`
        SELECT "lta_id"
        FROM "lote_aves"
        WHERE "lta_id" = ${id}
        FOR UPDATE
      `;

      return operacao({
        buscarLoteParaAtualizacao: () =>
          buscarLoteParaAtualizacaoComCliente(
            transacao,
            id,
          ),

        atualizarLote: (dados) =>
          atualizarLoteComCliente(
            transacao,
            id,
            dados,
          ),
      });
    },
    {
      maxWait: 5000,
      timeout: 10000,
    },
  );
}

export async function executarFinalizacaoLoteComBloqueio<T>(
  id: number,
  operacao: (
    repositorio: OperacoesFinalizacaoLote,
  ) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(
    async (transacao) => {
      await transacao.$queryRaw`
        SELECT "lta_id"
        FROM "lote_aves"
        WHERE "lta_id" = ${id}
        FOR UPDATE
      `;

      return operacao({
        buscarLoteParaFinalizacao: () =>
          buscarLoteParaFinalizacaoComCliente(
            transacao,
            id,
          ),

        finalizarLote: (dados) =>
          finalizarLoteComCliente(
            transacao,
            id,
            dados,
          ),
      });
    },
    {
      maxWait: 5000,
      timeout: 10000,
    },
  );
}

export async function listarLotes() {
  return prisma.lote_aves.findMany({
    select: selectLoteResumo,
    orderBy: {
      lta_data_alojamento: "desc",
    },
  });
}

export async function buscarLotePorId(
  id: number,
) {
  return prisma.lote_aves.findUnique({
    where: {
      lta_id: id,
    },
    select: selectLoteEdicao,
  });
}

export async function buscarLoteDetalhadoPorId(
  id: number,
) {
  return prisma.lote_aves.findUnique({
    where: {
      lta_id: id,
    },
    select: selectLoteDetalhado,
  });
}

export async function buscarLotePorCodigo(
  codigo: string,
) {
  return prisma.lote_aves.findUnique({
    where: {
      lta_codigo_qr_code: codigo,
    },
    select: {
      lta_id: true,
    },
  });
}

export async function criarLote(
  dados: CriarLoteDados,
) {
  return prisma.lote_aves.create({
    data: {
      lta_codigo_qr_code: dados.codigo,
      lta_quant_inicial:
        dados.quantidadeInicial,
      lta_idade_inicial:
        dados.idadeInicialDias,
      lta_data_alojamento:
        dados.dataAlojamento,
      linhagem: {
        connect: {
          lin_id: dados.linhagemId,
        },
      },
      galpao: {
        connect: {
          gal_id: dados.galpaoId,
        },
      },
      fornecedor: {
        connect: {
          for_id: dados.fornecedorId,
        },
      },
      usuario: {
        connect: {
          usu_id: dados.registradoPorId,
        },
      },
    },
    select: selectLoteResumo,
  });
}