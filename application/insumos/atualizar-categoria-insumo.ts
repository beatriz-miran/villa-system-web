import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  atualizarCategoriaInsumo as atualizarCategoriaInsumoRepository,
  buscarCategoriaInsumoPorDescricao,
  buscarCategoriaInsumoPorId,
} from "@/infrastructure/repositories/categoria-insumo-repository";

import { VALORES_TIPO_CATEGORIA_INSUMO } from "./insumo-opcoes";

const atualizarCategoriaInsumoSchema = z.object({
  id: z.number().int().positive("Categoria inválida."),

  descricao: z
    .string()
    .trim()
    .min(2, "Informe a descrição da categoria.")
    .max(100, "A descrição deve possuir no máximo 100 caracteres."),

  tipo: z.enum(VALORES_TIPO_CATEGORIA_INSUMO, {
    error: "Selecione um tipo de categoria válido.",
  }),
});

export type AtualizarCategoriaInsumoInput = z.infer<
  typeof atualizarCategoriaInsumoSchema
>;

export type AtualizarCategoriaInsumoResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function atualizarCategoriaInsumo(
  dados: AtualizarCategoriaInsumoInput
): Promise<AtualizarCategoriaInsumoResultado> {
  const validacao = atualizarCategoriaInsumoSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const { id, descricao, tipo } = validacao.data;

  try {
    const [categoriaAtual, categoriaComMesmaDescricao] = await Promise.all([
      buscarCategoriaInsumoPorId(id),
      buscarCategoriaInsumoPorDescricao(descricao),
    ]);

    if (!categoriaAtual) {
      return {
        sucesso: false,
        mensagem: "Categoria não encontrada.",
      };
    }

    if (
      categoriaComMesmaDescricao &&
      categoriaComMesmaDescricao.cti_id !== id
    ) {
      return {
        sucesso: false,
        mensagem:
          "Já existe outra categoria cadastrada com esta descrição.",
      };
    }

    await atualizarCategoriaInsumoRepository(id, {
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
        mensagem:
          "Já existe outra categoria cadastrada com esta descrição.",
      };
    }

    if (erroPrismaTemCodigo(error, "P2025")) {
      return {
        sucesso: false,
        mensagem: "Categoria não encontrada.",
      };
    }

    console.error("Erro ao atualizar categoria de insumo:", error);

    return {
      sucesso: false,
      mensagem: "Não foi possível atualizar a categoria. Tente novamente.",
    };
  }
}
