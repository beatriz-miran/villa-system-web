import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import { executarEstornoProducaoComBloqueio } from "@/infrastructure/repositories/producao-ovo-repository";

const estornarProducaoLoteSchema = z.object({
  movimentoId: z
    .number({
      error: "Registro de produção inválido.",
    })
    .int("Registro de produção inválido.")
    .positive("Registro de produção inválido."),

  usuarioId: z
    .number({
      error: "Usuário responsável inválido.",
    })
    .int("Usuário responsável inválido.")
    .positive("Usuário responsável inválido."),

  motivo: z
    .string({
      error: "Informe o motivo do estorno.",
    })
    .trim()
    .min(
      5,
      "O motivo do estorno deve possuir pelo menos 5 caracteres.",
    )
    .max(
      255,
      "O motivo do estorno deve possuir no máximo 255 caracteres.",
    ),
});

export type EstornarProducaoLoteInput = z.infer<
  typeof estornarProducaoLoteSchema
>;

export type EstornarProducaoLoteResultado =
  | {
      sucesso: true;
      loteId: number;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function estornarProducaoLote(
  dados: EstornarProducaoLoteInput,
): Promise<EstornarProducaoLoteResultado> {
  const validacao =
    estornarProducaoLoteSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const { movimentoId, usuarioId, motivo } =
    validacao.data;

  try {
    return await executarEstornoProducaoComBloqueio<
      EstornarProducaoLoteResultado
    >(movimentoId, async ({
      buscarMovimentoPorId,
      estornarMovimento,
    }) => {
      const movimento = await buscarMovimentoPorId();

      if (!movimento) {
        return {
          sucesso: false,
          mensagem:
            "O registro de produção não foi encontrado.",
        };
      }

      if (
        movimento.mvo_status_registro === "ESTORNADO"
      ) {
        return {
          sucesso: false,
          mensagem: "Este registro já foi estornado.",
        };
      }

      if (
        movimento.lote_estoque_ovo.lote_aves
          .lta_status !== "ATIVO"
      ) {
        return {
          sucesso: false,
          mensagem:
            "Não é possível estornar produção de um lote finalizado.",
        };
      }

      const resultado = await estornarMovimento({
        usuarioId,
        motivo,
      });

      if (resultado.count === 0) {
        return {
          sucesso: false,
          mensagem:
            "Este registro já foi estornado por outro usuário.",
        };
      }

      return {
        sucesso: true,
        loteId:
          movimento.lote_estoque_ovo.lta_id,
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
          "O registro ou o usuário responsável não existe mais.",
      };
    }

    console.error(
      "Erro ao estornar produção do lote:",
      error,
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível estornar a produção. Tente novamente.",
    };
  }
}
