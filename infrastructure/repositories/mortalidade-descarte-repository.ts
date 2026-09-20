import type { Prisma } from "../../generated/prisma/client";

import { prisma } from "../database/prisma";

type RegistrarBaixaLoteDados = {
  loteId: number;
  usuarioId: number;
  tipo: "MORTALIDADE" | "DESCARTE";
  quantidade: number;
  data: Date;
  motivo: string;
};

type EstornarBaixaLoteDados = {
  baixaId: number;
  usuarioId: number;
  motivo: string;
};

async function buscarLoteParaRegistrarBaixaComCliente(
  cliente: Prisma.TransactionClient,
  loteId: number,
) {
  return cliente.lote_aves.findUnique({
    where: {
      lta_id: loteId,
    },
    select: {
      lta_id: true,
      lta_codigo_qr_code: true,
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

async function registrarBaixaLoteComCliente(
  cliente: Prisma.TransactionClient,
  dados: RegistrarBaixaLoteDados,
) {
  return cliente.mortalidade_descarte.create({
    data: {
      mor_data: dados.data,
      mor_tipo: dados.tipo,
      mor_quantidade: dados.quantidade,
      mor_motivo: dados.motivo,
      lta_id: dados.loteId,
      usu_id: dados.usuarioId,
    },
    select: {
      mor_id: true,
    },
  });
}

type OperacoesRegistroBaixaLote = {
  buscarLoteParaRegistrarBaixa: () => ReturnType<
    typeof buscarLoteParaRegistrarBaixaComCliente
  >;

  registrarBaixaLote: (
    dados: RegistrarBaixaLoteDados,
  ) => ReturnType<
    typeof registrarBaixaLoteComCliente
  >;
};

export async function executarRegistroBaixaComBloqueio<T>(
  loteId: number,
  operacao: (
    repositorio: OperacoesRegistroBaixaLote,
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
        buscarLoteParaRegistrarBaixa: () =>
          buscarLoteParaRegistrarBaixaComCliente(
            transacao,
            loteId,
          ),

        registrarBaixaLote: (dados) =>
          registrarBaixaLoteComCliente(
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

export async function listarBaixasDoLote(
  loteId: number,
) {
  return prisma.mortalidade_descarte.findMany({
    where: {
      lta_id: loteId,
    },
    select: {
      mor_id: true,
      mor_data: true,
      mor_tipo: true,
      mor_quantidade: true,
      mor_motivo: true,
      mor_status_registro: true,
      mor_estornado_em: true,
      mor_motivo_estorno: true,
      created_at: true,
      usuario_mortalidade_descarte_usu_idTousuario: {
        select: {
          usu_nome: true,
        },
      },
      usuario_mortalidade_descarte_mor_estornado_porTousuario:
        {
          select: {
            usu_nome: true,
          },
        },
    },
    orderBy: [
      {
        mor_data: "desc",
      },
      {
        created_at: "desc",
      },
    ],
  });
}

export async function buscarBaixaPorId(
  baixaId: number,
) {
  return prisma.mortalidade_descarte.findUnique({
    where: {
      mor_id: baixaId,
    },
    select: {
      mor_id: true,
      lta_id: true,
      mor_quantidade: true,
      mor_status_registro: true,
      lote_aves: {
        select: {
          lta_status: true,
        },
      },
    },
  });
}

export async function estornarBaixaLote({
  baixaId,
  usuarioId,
  motivo,
}: EstornarBaixaLoteDados) {
  return prisma.mortalidade_descarte.updateMany({
    where: {
      mor_id: baixaId,
      mor_status_registro: "ATIVO",
    },
    data: {
      mor_status_registro: "ESTORNADO",
      mor_estornado_em: new Date(),
      mor_estornado_por: usuarioId,
      mor_motivo_estorno: motivo,
    },
  });
}