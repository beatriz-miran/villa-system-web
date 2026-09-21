import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import { executarFinalizacaoLoteComBloqueio } from "@/infrastructure/repositories/lote-repository";

import { dataAlojamentoEhFutura } from "./validar-data-alojamento";

const finalizarLoteSchema = z.object({
  loteId: z
    .number({
      error: "Lote inválido.",
    })
    .int("Lote inválido.")
    .positive("Lote inválido."),

  dataEncerramento: z.coerce.date({
    error: "Informe uma data de encerramento válida.",
  }),

  motivoEncerramento: z
    .string({
      error: "Informe o motivo do encerramento.",
    })
    .trim()
    .min(
      5,
      "O motivo do encerramento deve possuir pelo menos 5 caracteres.",
    )
    .max(
      255,
      "O motivo do encerramento deve possuir no máximo 255 caracteres.",
    ),

  destinoAves: z
    .string({
      error: "Informe o destino das aves.",
    })
    .trim()
    .min(
      2,
      "O destino das aves deve possuir pelo menos 2 caracteres.",
    )
    .max(
      255,
      "O destino das aves deve possuir no máximo 255 caracteres.",
    ),
});

export type FinalizarLoteInput = {
  loteId: number;
  dataEncerramento: Date;
  motivoEncerramento: string;
  destinoAves: string;
};

export type FinalizarLoteResultado =
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
  return (
    inicioDoDiaUtc(data) <
    inicioDoDiaUtc(dataLimite)
  );
}

export async function finalizarLote(
  dados: FinalizarLoteInput,
): Promise<FinalizarLoteResultado> {
  const validacao =
    finalizarLoteSchema.safeParse(dados);

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
    dataEncerramento,
    motivoEncerramento,
    destinoAves,
  } = validacao.data;

  if (
    dataAlojamentoEhFutura(
      dataEncerramento,
    )
  ) {
    return {
      sucesso: false,
      mensagem:
        "A data de encerramento não pode ser uma data futura.",
    };
  }

  try {
    return await executarFinalizacaoLoteComBloqueio<
      FinalizarLoteResultado
    >(
      loteId,
      async ({
        buscarLoteParaFinalizacao,
        finalizarLote:
          finalizarLoteRepository,
      }) => {
        const lote =
          await buscarLoteParaFinalizacao();

        if (!lote) {
          return {
            sucesso: false,
            mensagem: "Lote não encontrado.",
          };
        }

        if (
          lote.lta_status !== "ATIVO"
        ) {
          return {
            sucesso: false,
            mensagem:
              "Este lote já está finalizado.",
          };
        }

        if (
          dataEhAnterior(
            dataEncerramento,
            lote.lta_data_alojamento,
          )
        ) {
          return {
            sucesso: false,
            mensagem:
              "A data de encerramento não pode ser anterior à data de alojamento do lote.",
          };
        }

        const existeBaixaPosterior =
          lote.mortalidade_descarte.some(
            (baixa) =>
              dataEhAnterior(
                dataEncerramento,
                baixa.mor_data,
              ),
          );

        if (existeBaixaPosterior) {
          return {
            sucesso: false,
            mensagem:
              "A data de encerramento não pode ser anterior à última baixa válida do lote.",
          };
        }

        await finalizarLoteRepository({
          dataEncerramento,
          motivoEncerramento,
          destinoAves,
        });

        return {
          sucesso: true,
        };
      },
    );
  } catch (error) {
    if (erroPrismaTemCodigo(error, "P2025")) {
      return {
        sucesso: false,
        mensagem: "Lote não encontrado.",
      };
    }

    console.error(
      "Erro ao finalizar lote:",
      error,
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível finalizar o lote. Tente novamente.",
    };
  }
}
