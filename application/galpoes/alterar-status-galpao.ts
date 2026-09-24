import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  atualizarStatusGalpao,
  buscarGalpaoPorId,
  existeLoteAtivoNoGalpao,
} from "@/infrastructure/repositories/galpao-repository";

import { statusGalpaoValores } from "./status-galpao";

const alterarStatusGalpaoSchema = z.object({
  id: z.number().int().positive("Galpão inválido."),

  status: z.enum(statusGalpaoValores, {
    error: "Status inválido.",
  }),
});

export type AlterarStatusGalpaoInput = z.infer<
  typeof alterarStatusGalpaoSchema
>;

export type AlterarStatusGalpaoResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function alterarStatusGalpao(
  dados: AlterarStatusGalpaoInput
): Promise<AlterarStatusGalpaoResultado> {
  const validacao = alterarStatusGalpaoSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Não foi possível alterar o status do galpão.",
    };
  }

  const { id, status } = validacao.data;

  try {
    const galpao = await buscarGalpaoPorId(id);

    if (!galpao) {
      return {
        sucesso: false,
        mensagem: "Galpão não encontrado.",
      };
    }

    if (galpao.gal_status === status) {
      return {
        sucesso: true,
      };
    }

    if (status !== "ATIVO") {
      const temLoteAtivo = await existeLoteAtivoNoGalpao(id);

      if (temLoteAtivo) {
        return {
          sucesso: false,
          mensagem:
            "Não é possível alterar o galpão para manutenção, vazio sanitário ou desativado enquanto existir um lote ativo nele.",
        };
      }
    }

    await atualizarStatusGalpao(id, status);

    return {
      sucesso: true,
    };
  } catch (erro) {
    if (erroPrismaTemCodigo(erro, "P2025")) {
      return {
        sucesso: false,
        mensagem:
          "O galpão não foi encontrado ou foi alterado por outro usuário.",
      };
    }

    console.error("Falha ao alterar o status do galpão:", erro);

    return {
      sucesso: false,
      mensagem:
        "Não foi possível alterar o status do galpão no momento. Tente novamente.",
    };
  }
}