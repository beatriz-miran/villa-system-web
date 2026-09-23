import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  buscarCategoriaInsumoPorDescricao,
  criarCategoriaInsumo as criarCategoriaInsumoRepository,
} from "@/infrastructure/repositories/categoria-insumo-repository";

import { VALORES_TIPO_CATEGORIA_INSUMO } from "./insumo-opcoes";

const criarCategoriaInsumoSchema = z.object({
  descricao: z
    .string()
    .trim()
    .min(2, "Informe a descrição da categoria.")
    .max(100, "A descrição deve possuir no máximo 100 caracteres."),

  tipo: z.enum(VALORES_TIPO_CATEGORIA_INSUMO, {
    error: "Selecione um tipo de categoria válido.",
  }),
});

export type CriarCategoriaInsumoInput = z.infer<
  typeof criarCategoriaInsumoSchema
>;

export type CriarCategoriaInsumoResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function criarCategoriaInsumo(
  dados: CriarCategoriaInsumoInput
): Promise<CriarCategoriaInsumoResultado> {
  const validacao = criarCategoriaInsumoSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const { descricao, tipo } = validacao.data;

  try {
    const categoriaExistente =
      await buscarCategoriaInsumoPorDescricao(descricao);

    if (categoriaExistente) {
      return {
        sucesso: false,
        mensagem: "Já existe uma categoria cadastrada com esta descrição.",
      };
    }

    await criarCategoriaInsumoRepository({
      descricao,
      tipo,
    });

    return {
      sucesso: true,
    };
  } catch (error) {
    if (erroPrismaTemCodigo(error, "P2002")) {
      return {
        sucesso: false,
        mensagem: "Já existe uma categoria cadastrada com esta descrição.",
      };
    }

    console.error("Erro ao cadastrar categoria de insumo:", error);

    return {
      sucesso: false,
      mensagem:
        "Não foi possível cadastrar a categoria. Tente novamente.",
    };
  }
}
