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

export async function buscarLoteParaRegistrarBaixa(
  loteId: number,
) {
  return prisma.lote_aves.findUnique({
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

export async function registrarBaixaLote(
  dados: RegistrarBaixaLoteDados,
) {
  return prisma.mortalidade_descarte.create({
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