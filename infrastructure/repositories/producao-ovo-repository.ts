import type { Prisma } from "../../generated/prisma/client";

import { prisma } from "../database/prisma";

const DIAS_VALIDADE_PADRAO = 30;

type EstornarProducaoLoteDados = {
  movimentoId: number;
  usuarioId: number;
  motivo: string;
};

function calcularDataValidade(dataColeta: Date) {
  const validade = new Date(dataColeta);
  validade.setUTCDate(
    validade.getUTCDate() + DIAS_VALIDADE_PADRAO,
  );
  return validade;
}

async function buscarLoteParaRegistrarProducaoComCliente(
  cliente: Prisma.TransactionClient,
  loteId: number,
) {
  return cliente.lote_aves.findUnique({
    where: {
      lta_id: loteId,
    },
    select: {
      lta_id: true,
      lta_quant_inicial: true,
      lta_data_alojamento: true,
      lta_status: true,
      mortalidade_descarte: {
        where: {
          mor_status_registro: "ATIVO",
        },
        select: {
          mor_quantidade: true,
        },
      },
    },
  });
}

async function buscarOuCriarLoteEstoqueOvoDoDiaComCliente(
  cliente: Prisma.TransactionClient,
  loteId: number,
  dataColeta: Date,
) {
  const dataValidade = calcularDataValidade(dataColeta);

  return cliente.lote_estoque_ovo.upsert({
    where: {
      lta_id_leo_data_coleta_leo_data_validade: {
        lta_id: loteId,
        leo_data_coleta: dataColeta,
        leo_data_validade: dataValidade,
      },
    },
    create: {
      leo_data_coleta: dataColeta,
      leo_data_validade: dataValidade,
      lote_aves: {
        connect: {
          lta_id: loteId,
        },
      },
    },
    update: {},
    select: {
      leo_id: true,
    },
  });
}

async function registrarMovimentoOvoComCliente(
  cliente: Prisma.TransactionClient,
  dados: {
    leoId: number;
    usuarioId: number;
    data: Date;
    tipo: "COLETA" | "PERDA";
    quantidade: number;
  },
) {
  return cliente.movimento_ovo.create({
    data: {
      mvo_data_movimento: dados.data,
      mvo_tipo_movimento: dados.tipo,
      mvo_quantidade: dados.quantidade,
      lote_estoque_ovo: {
        connect: {
          leo_id: dados.leoId,
        },
      },
      usuario_movimento_ovo_usu_idTousuario: {
        connect: {
          usu_id: dados.usuarioId,
        },
      },
    },
    select: {
      mvo_id: true,
    },
  });
}

async function buscarMovimentoPorIdComCliente(
  cliente: Prisma.TransactionClient,
  movimentoId: number,
) {
  return cliente.movimento_ovo.findUnique({
    where: {
      mvo_id: movimentoId,
    },
    select: {
      mvo_id: true,
      mvo_status_registro: true,
      lote_estoque_ovo: {
        select: {
          lta_id: true,
          lote_aves: {
            select: {
              lta_status: true,
            },
          },
        },
      },
    },
  });
}

async function estornarMovimentoOvoComCliente(
  cliente: Prisma.TransactionClient,
  {
    movimentoId,
    usuarioId,
    motivo,
  }: EstornarProducaoLoteDados,
) {
  return cliente.movimento_ovo.updateMany({
    where: {
      mvo_id: movimentoId,
      mvo_status_registro: "ATIVO",
    },
    data: {
      mvo_status_registro: "ESTORNADO",
      mvo_estornado_em: new Date(),
      mvo_estornado_por: usuarioId,
      mvo_motivo_estorno: motivo,
    },
  });
}

type OperacoesRegistroProducaoLote = {
  buscarLoteParaRegistrarProducao: () => ReturnType<
    typeof buscarLoteParaRegistrarProducaoComCliente
  >;

  buscarOuCriarLoteEstoqueOvoDoDia: (
    dataColeta: Date,
  ) => ReturnType<
    typeof buscarOuCriarLoteEstoqueOvoDoDiaComCliente
  >;

  registrarMovimentoOvo: (
    dados: Omit<
      Parameters<typeof registrarMovimentoOvoComCliente>[1],
      "usuarioId" | "data"
    > & {
      usuarioId: number;
      data: Date;
    },
  ) => ReturnType<typeof registrarMovimentoOvoComCliente>;
};

type OperacoesEstornoProducaoLote = {
  buscarMovimentoPorId: () => ReturnType<
    typeof buscarMovimentoPorIdComCliente
  >;

  estornarMovimento: (
    dados: Omit<EstornarProducaoLoteDados, "movimentoId">,
  ) => ReturnType<typeof estornarMovimentoOvoComCliente>;
};

export async function executarRegistroProducaoComBloqueio<T>(
  loteId: number,
  operacao: (
    repositorio: OperacoesRegistroProducaoLote,
  ) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(
    async (transacao) => {
      await transacao.$queryRaw`
        SELECT "lta_id"
        FROM "lote_aves"
        WHERE "lta_id" = ${loteId}
        FOR UPDATE
      `;

      return operacao({
        buscarLoteParaRegistrarProducao: () =>
          buscarLoteParaRegistrarProducaoComCliente(
            transacao,
            loteId,
          ),

        buscarOuCriarLoteEstoqueOvoDoDia: (dataColeta) =>
          buscarOuCriarLoteEstoqueOvoDoDiaComCliente(
            transacao,
            loteId,
            dataColeta,
          ),

        registrarMovimentoOvo: (dados) =>
          registrarMovimentoOvoComCliente(
            transacao,
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

export async function executarEstornoProducaoComBloqueio<T>(
  movimentoId: number,
  operacao: (
    repositorio: OperacoesEstornoProducaoLote,
  ) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(
    async (transacao) => {
      await transacao.$queryRaw`
        SELECT lote."lta_id"
        FROM "lote_aves" AS lote
        INNER JOIN "lote_estoque_ovo" AS leo
          ON leo."lta_id" = lote."lta_id"
        INNER JOIN "movimento_ovo" AS movimento
          ON movimento."leo_id" = leo."leo_id"
        WHERE movimento."mvo_id" = ${movimentoId}
        FOR UPDATE OF lote
      `;

      return operacao({
        buscarMovimentoPorId: () =>
          buscarMovimentoPorIdComCliente(
            transacao,
            movimentoId,
          ),

        estornarMovimento: (dados) =>
          estornarMovimentoOvoComCliente(transacao, {
            movimentoId,
            ...dados,
          }),
      });
    },
    {
      maxWait: 5000,
      timeout: 10000,
    },
  );
}

export async function listarProducaoDoLote(
  loteId: number,
) {
  return prisma.movimento_ovo.findMany({
    where: {
      lote_estoque_ovo: {
        lta_id: loteId,
      },
    },
    select: {
      mvo_id: true,
      mvo_data_movimento: true,
      mvo_tipo_movimento: true,
      mvo_quantidade: true,
      mvo_status_registro: true,
      mvo_estornado_em: true,
      mvo_motivo_estorno: true,
      created_at: true,
      usuario_movimento_ovo_usu_idTousuario: {
        select: {
          usu_nome: true,
        },
      },
      usuario_movimento_ovo_mvo_estornado_porTousuario: {
        select: {
          usu_nome: true,
        },
      },
    },
    orderBy: [
      {
        mvo_data_movimento: "desc",
      },
      {
        created_at: "desc",
      },
    ],
  });
}
