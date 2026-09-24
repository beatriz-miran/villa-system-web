import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import { executarRegistroProducaoComBloqueio } from "@/infrastructure/repositories/producao-ovo-repository";

import { calcularQuantidadeAtual } from "../lotes/calcular-situacao-lote";
import { dataAlojamentoEhFutura } from "../lotes/validar-data-alojamento";

const registrarProducaoLoteSchema = z
  .object({
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

    quantidadeComercial: z
      .number({
        error: "Informe a quantidade de ovos comerciais.",
      })
      .int("A quantidade deve ser um número inteiro.")
      .min(0, "A quantidade não pode ser negativa.")
      .max(
        500000,
        "A quantidade deve ser de no máximo 500.000 ovos.",
      ),

    quantidadePerda: z
      .number({
        error: "Informe a quantidade de perdas.",
      })
      .int("A quantidade deve ser um número inteiro.")
      .min(0, "A quantidade não pode ser negativa.")
      .max(
        500000,
        "A quantidade deve ser de no máximo 500.000 ovos.",
      ),

    data: z.coerce.date({
      error: "Informe uma data válida.",
    }),
  })
  .refine(
    (dados) =>
      dados.quantidadeComercial + dados.quantidadePerda > 0,
    {
      message:
        "Informe uma quantidade de ovos maior que zero.",
      path: ["quantidadeComercial"],
    },
  );

export type RegistrarProducaoLoteInput = {
  loteId: number;
  usuarioId: number;
  quantidadeComercial: number;
  quantidadePerda: number;
  data: Date;
};

export type RegistrarProducaoLoteResultado =
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

function dataEhAnterior(data: Date, dataLimite: Date) {
  return (
    inicioDoDiaUtc(data) < inicioDoDiaUtc(dataLimite)
  );
}

export async function registrarProducaoLote(
  dados: RegistrarProducaoLoteInput,
): Promise<RegistrarProducaoLoteResultado> {
  const validacao =
    registrarProducaoLoteSchema.safeParse(dados);

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
    quantidadeComercial,
    quantidadePerda,
    data,
  } = validacao.data;

  const quantidadeTotal =
    quantidadeComercial + quantidadePerda;

  if (dataAlojamentoEhFutura(data)) {
    return {
      sucesso: false,
      mensagem:
        "A data da produção não pode ser uma data futura.",
    };
  }

  try {
    return await executarRegistroProducaoComBloqueio<
      RegistrarProducaoLoteResultado
    >(loteId, async ({
      buscarLoteParaRegistrarProducao,
      buscarOuCriarLoteEstoqueOvoDoDia,
      registrarMovimentoOvo,
    }) => {
      const lote =
        await buscarLoteParaRegistrarProducao();

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
            "Não é possível registrar produção em um lote finalizado.",
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
            "A data da produção não pode ser anterior à data de alojamento do lote.",
        };
      }

      const totalBaixas =
        lote.mortalidade_descarte.reduce(
          (total, registro) =>
            total + registro.mor_quantidade,
          0,
        );

      const quantidadeAtual = calcularQuantidadeAtual(
        lote.lta_quant_inicial,
        totalBaixas,
      );

      if (quantidadeAtual <= 0) {
        return {
          sucesso: false,
          mensagem:
            "Este lote não possui aves disponíveis para registrar produção.",
        };
      }

      if (quantidadeTotal > quantidadeAtual) {
        return {
          sucesso: false,
          mensagem: `A quantidade informada excede o saldo atual de ${quantidadeAtual.toLocaleString(
            "pt-BR",
          )} aves do lote.`,
        };
      }

      const loteEstoqueOvo =
        await buscarOuCriarLoteEstoqueOvoDoDia(data);

      await registrarMovimentoOvo({
        leoId: loteEstoqueOvo.leo_id,
        usuarioId,
        data,
        tipo: "COLETA",
        quantidade: quantidadeTotal,
      });

      if (quantidadePerda > 0) {
        await registrarMovimentoOvo({
          leoId: loteEstoqueOvo.leo_id,
          usuarioId,
          data,
          tipo: "PERDA",
          quantidade: quantidadePerda,
        });
      }

      return {
        sucesso: true,
      };
    });
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
      "Erro ao registrar produção do lote:",
      error,
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível registrar a produção. Tente novamente.",
    };
  }
}
