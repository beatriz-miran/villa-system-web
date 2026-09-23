import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import { buscarCategoriaInsumoPorId } from "@/infrastructure/repositories/categoria-insumo-repository";
import {
  buscarInsumoPorNome,
  criarInsumo as criarInsumoRepository,
} from "@/infrastructure/repositories/insumo-repository";

import {
  VALORES_FASE_APLICACAO_INSUMO,
  VALORES_UNIDADE_MEDIDA_INSUMO,
} from "./insumo-opcoes";

const criarInsumoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do insumo.")
    .max(100, "O nome deve possuir no máximo 100 caracteres."),

  composicao: z
    .string()
    .trim()
    .max(255, "A composição deve possuir no máximo 255 caracteres.")
    .optional(),

  faseAplicacao: z.enum(VALORES_FASE_APLICACAO_INSUMO, {
    error: "Selecione uma fase de aplicação válida.",
  }),

  unidadeMedida: z.enum(VALORES_UNIDADE_MEDIDA_INSUMO, {
    error: "Selecione uma unidade de medida válida.",
  }),

  pontoRessuprimento: z
    .number({ error: "Informe o ponto de ressuprimento." })
    .min(0, "O ponto de ressuprimento não pode ser negativo."),

  diasCarencia: z
    .number({ error: "Informe os dias de carência." })
    .int("Os dias de carência devem ser um número inteiro.")
    .min(0, "Os dias de carência não podem ser negativos."),

  categoriaId: z
    .number({ error: "Selecione uma categoria válida." })
    .int()
    .positive("Selecione uma categoria válida."),
});

export type CriarInsumoInput = z.infer<typeof criarInsumoSchema>;

export type CriarInsumoResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function criarInsumo(
  dados: CriarInsumoInput
): Promise<CriarInsumoResultado> {
  const validacao = criarInsumoSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const {
    nome,
    composicao,
    faseAplicacao,
    unidadeMedida,
    pontoRessuprimento,
    diasCarencia,
    categoriaId,
  } = validacao.data;

  try {
    const [insumoExistente, categoria] = await Promise.all([
      buscarInsumoPorNome(nome),
      buscarCategoriaInsumoPorId(categoriaId),
    ]);

    if (insumoExistente) {
      return {
        sucesso: false,
        mensagem: "Já existe um insumo cadastrado com este nome.",
      };
    }

    if (!categoria) {
      return {
        sucesso: false,
        mensagem: "A categoria selecionada não existe.",
      };
    }

    await criarInsumoRepository({
      nome,
      composicao: composicao || null,
      faseAplicacao,
      unidadeMedida,
      pontoRessuprimento,
      diasCarencia,
      categoriaId,
    });

    return {
      sucesso: true,
    };
  } catch (error) {
    if (erroPrismaTemCodigo(error, "P2002")) {
      return {
        sucesso: false,
        mensagem: "Já existe um insumo cadastrado com este nome.",
      };
    }

    if (erroPrismaTemCodigo(error, "P2025")) {
      return {
        sucesso: false,
        mensagem: "A categoria selecionada não existe mais.",
      };
    }

    console.error("Erro ao cadastrar insumo:", error);

    return {
      sucesso: false,
      mensagem: "Não foi possível cadastrar o insumo. Tente novamente.",
    };
  }
}
