import { z } from "zod";

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

  if (status === "MANUTENCAO" || status === "DESATIVADO") {
    const temLoteAtivo = await existeLoteAtivoNoGalpao(id);

    if (temLoteAtivo) {
      return {
        sucesso: false,
        mensagem:
          "Não é possível colocar em manutenção ou desativar um galpão com lote ativo.",
      };
    }
  }

  await atualizarStatusGalpao(id, status);

  return {
    sucesso: true,
  };
}
