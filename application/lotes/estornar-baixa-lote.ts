import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import { executarEstornoBaixaComBloqueio } from "@/infrastructure/repositories/mortalidade-descarte-repository";

const estornarBaixaLoteSchema = z.object({
  baixaId: z
    .number({
      error: "Registro de baixa inválido.",
    })
    .int("Registro de baixa inválido.")
    .positive("Registro de baixa inválido."),

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

export type EstornarBaixaLoteInput = z.infer<
  typeof estornarBaixaLoteSchema
>;

export type EstornarBaixaLoteResultado =
  | {
      sucesso: true;
      loteId: number;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function estornarBaixaLote(
  dados: EstornarBaixaLoteInput,
): Promise<EstornarBaixaLoteResultado> {
  const validacao =
    estornarBaixaLoteSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const {
    baixaId,
    usuarioId,
    motivo,
  } = validacao.data;

  try {
    return await executarEstornoBaixaComBloqueio<
      EstornarBaixaLoteResultado
    >(
      baixaId,
      async ({
        buscarBaixaPorId,
        estornarBaixaLote:
          estornarBaixaLoteRepository,
      }) => {
        const baixa =
          await buscarBaixaPorId();

        if (!baixa) {
          return {
            sucesso: false,
            mensagem:
              "O registro de baixa não foi encontrado.",
          };
        }

        if (
          baixa.mor_status_registro ===
          "ESTORNADO"
        ) {
          return {
            sucesso: false,
            mensagem:
              "Este registro já foi estornado.",
          };
        }

        if (
          baixa.lote_aves.lta_status !==
          "ATIVO"
        ) {
          return {
            sucesso: false,
            mensagem:
              "Não é possível estornar baixas de um lote finalizado.",
          };
        }

        const resultado =
          await estornarBaixaLoteRepository({
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
          loteId: baixa.lta_id,
        };
      },
    );
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
      "Erro ao estornar baixa do lote:",
      error,
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível estornar a baixa. Tente novamente.",
    };
  }
}