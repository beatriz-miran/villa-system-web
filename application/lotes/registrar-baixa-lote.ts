import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  buscarLoteParaRegistrarBaixa,
  registrarBaixaLote as registrarBaixaLoteRepository,
} from "@/infrastructure/repositories/mortalidade-descarte-repository";

import { calcularQuantidadeAtual } from "./calcular-situacao-lote";
import {
  tipoBaixaLoteValores,
  type TipoBaixaLote,
} from "./tipo-baixa-lote";
import { dataAlojamentoEhFutura } from "./validar-data-alojamento";

const registrarBaixaLoteSchema = z.object({
  loteId: z
    .number({
      error: "Lote inválido.",
    })
    .int("Lote inválido.")
    .positive("Lote inválido."),

  usuarioId: z
    .number({
      error: "Usuário responsável inválido.",
    })
    .int("Usuário responsável inválido.")
    .positive("Usuário responsável inválido."),

  tipo: z.enum(tipoBaixaLoteValores, {
    error: "Selecione o tipo da baixa.",
  }),

  quantidade: z
    .number({
      error: "Informe a quantidade de aves.",
    })
    .int("A quantidade deve ser um número inteiro.")
    .positive("A quantidade deve ser maior que zero.")
    .max(
      500000,
      "A quantidade deve ser de no máximo 500.000 aves.",
    ),

  data: z.coerce.date({
    error: "Informe uma data válida.",
  }),

  motivo: z
    .string({
      error: "Informe o motivo da baixa.",
    })
    .trim()
    .min(3, "O motivo deve possuir pelo menos 3 caracteres.")
    .max(
      255,
      "O motivo deve possuir no máximo 255 caracteres.",
    ),
});

export type RegistrarBaixaLoteInput = {
  loteId: number;
  usuarioId: number;
  tipo: TipoBaixaLote;
  quantidade: number;
  data: Date;
  motivo: string;
};

export type RegistrarBaixaLoteResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

function inicioDoDiaUtc(data: Date) {
  return Date.UTC(
    data.getUTCFullYear(),
    data.getUTCMonth(),
    data.getUTCDate(),
  );
}

function dataEhAnterior(
  data: Date,
  dataLimite: Date,
) {
  return inicioDoDiaUtc(data) < inicioDoDiaUtc(dataLimite);
}

export async function registrarBaixaLote(
  dados: RegistrarBaixaLoteInput,
): Promise<RegistrarBaixaLoteResultado> {
  const validacao =
    registrarBaixaLoteSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const {
    loteId,
    usuarioId,
    tipo,
    quantidade,
    data,
    motivo,
  } = validacao.data;

  if (dataAlojamentoEhFutura(data)) {
    return {
      sucesso: false,
      mensagem:
        "A data da baixa não pode ser uma data futura.",
    };
  }

  try {
    const lote =
      await buscarLoteParaRegistrarBaixa(loteId);

    if (!lote) {
      return {
        sucesso: false,
        mensagem: "Lote não encontrado.",
      };
    }

    if (lote.lta_status !== "ATIVO") {
      return {
        sucesso: false,
        mensagem:
          "Não é possível registrar baixas em um lote finalizado.",
      };
    }

    if (
      dataEhAnterior(
        data,
        lote.lta_data_alojamento,
      )
    ) {
      return {
        sucesso: false,
        mensagem:
          "A data da baixa não pode ser anterior à data de alojamento do lote.",
      };
    }

    const totalBaixas =
      lote.mortalidade_descarte.reduce(
        (total, registro) =>
          total + registro.mor_quantidade,
        0,
      );

    const quantidadeAtual =
      calcularQuantidadeAtual(
        lote.lta_quant_inicial,
        totalBaixas,
      );

    if (quantidadeAtual <= 0) {
      return {
        sucesso: false,
        mensagem:
          "Este lote não possui aves disponíveis para registrar uma nova baixa.",
      };
    }

    if (quantidade > quantidadeAtual) {
      return {
        sucesso: false,
        mensagem: `A quantidade informada excede o saldo atual de ${quantidadeAtual.toLocaleString(
          "pt-BR",
        )} aves do lote.`,
      };
    }

    await registrarBaixaLoteRepository({
      loteId,
      usuarioId,
      tipo,
      quantidade,
      data,
      motivo,
    });

    return {
      sucesso: true,
    };
  } catch (error) {
    if (
      erroPrismaTemCodigo(error, "P2003") ||
      erroPrismaTemCodigo(error, "P2025")
    ) {
      return {
        sucesso: false,
        mensagem:
          "O lote ou o usuário responsável não existe mais.",
      };
    }

    console.error(
      "Erro ao registrar baixa do lote:",
      error,
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível registrar a baixa. Tente novamente.",
    };
  }
}