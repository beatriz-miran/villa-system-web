import { z } from "zod";

import { galpaoSchema } from "@/application/galpoes/galpao-schema";
import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  atualizarGalpao as atualizarGalpaoRepository,
  buscarGalpaoPorId,
  buscarGalpaoPorNome,
} from "@/infrastructure/repositories/galpao-repository";

const atualizarGalpaoSchema = galpaoSchema.extend({
  id: z.number().int().positive("Galpão inválido."),
});

export type AtualizarGalpaoInput = z.infer<
  typeof atualizarGalpaoSchema
>;

export type AtualizarGalpaoResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function atualizarGalpao(
  dados: AtualizarGalpaoInput
): Promise<AtualizarGalpaoResultado> {
  const validacao = atualizarGalpaoSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const { id, nome, areaM2 } = validacao.data;

  try {
    const galpaoAtual = await buscarGalpaoPorId(id);

    if (!galpaoAtual) {
      return {
        sucesso: false,
        mensagem: "Galpão não encontrado.",
      };
    }

    const galpaoComMesmoNome = await buscarGalpaoPorNome(nome);

    if (galpaoComMesmoNome && galpaoComMesmoNome.gal_id !== id) {
      return {
        sucesso: false,
        mensagem: "Já existe outro galpão cadastrado com este nome.",
      };
    }

    await atualizarGalpaoRepository(id, {
      nome,
      areaM2,
    });

    return {
      sucesso: true,
    };
  } catch (erro) {
    if (erroPrismaTemCodigo(erro, "P2002")) {
      return {
        sucesso: false,
        mensagem: "Já existe outro galpão cadastrado com este nome.",
      };
    }

    if (erroPrismaTemCodigo(erro, "P2025")) {
      return {
        sucesso: false,
        mensagem:
          "O galpão não foi encontrado ou foi alterado por outro usuário.",
      };
    }

    console.error("Falha ao atualizar o galpão:", erro);

    return {
      sucesso: false,
      mensagem:
        "Não foi possível atualizar o galpão no momento. Tente novamente.",
    };
  }
}