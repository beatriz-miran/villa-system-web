import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  atualizarStatusLinhagem,
  buscarLinhagemPorId,
} from "@/infrastructure/repositories/linhagem-repository";

const alterarStatusLinhagemSchema = z.object({
  id: z
    .number()
    .int()
    .positive("Linhagem inválida."),

  status: z.enum(
    ["ATIVO", "INATIVO"],
    {
      error: "Status inválido.",
    }
  ),
});

export type AlterarStatusLinhagemInput = z.infer<
  typeof alterarStatusLinhagemSchema
>;

export type AlterarStatusLinhagemResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function alterarStatusLinhagem(
  dados: AlterarStatusLinhagemInput
): Promise<AlterarStatusLinhagemResultado> {
  const validacao = alterarStatusLinhagemSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Não foi possível alterar o status da linhagem.",
    };
  }

  const {
    id,
    status,
  } = validacao.data;

  try {
    const linhagem = await buscarLinhagemPorId(id);

    if (!linhagem) {
      return {
        sucesso: false,
        mensagem: "Linhagem não encontrada.",
      };
    }

    if (linhagem.lin_status === status) {
      return {
        sucesso: true,
      };
    }

    await atualizarStatusLinhagem(id, status);

    return {
      sucesso: true,
    };
  } catch (error) {
    if (erroPrismaTemCodigo(error, "P2025")) {
      return {
        sucesso: false,
        mensagem: "Linhagem não encontrada.",
      };
    }

    console.error("Erro ao alterar o status da linhagem:", error);

    return {
      sucesso: false,
      mensagem:
        "Não foi possível alterar o status da linhagem. Tente novamente.",
    };
  }
}
