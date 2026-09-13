import {
  galpaoSchema,
  type GalpaoDados,
} from "@/application/galpoes/galpao-schema";
import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  buscarGalpaoPorNome,
  criarGalpao as criarGalpaoRepository,
} from "@/infrastructure/repositories/galpao-repository";

export type CriarGalpaoInput = GalpaoDados;

export type CriarGalpaoResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function criarGalpao(
  dados: CriarGalpaoInput
): Promise<CriarGalpaoResultado> {
  const validacao = galpaoSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const { nome, areaM2 } = validacao.data;

  try {
    const galpaoComMesmoNome = await buscarGalpaoPorNome(nome);

    if (galpaoComMesmoNome) {
      return {
        sucesso: false,
        mensagem: "Já existe um galpão cadastrado com este nome.",
      };
    }

    await criarGalpaoRepository({
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
        mensagem: "Já existe um galpão cadastrado com este nome.",
      };
    }

    console.error("Falha ao cadastrar o galpão:", erro);

    return {
      sucesso: false,
      mensagem:
        "Não foi possível cadastrar o galpão no momento. Tente novamente.",
    };
  }
}