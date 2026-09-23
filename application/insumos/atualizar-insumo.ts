import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import { buscarCategoriaInsumoPorId } from "@/infrastructure/repositories/categoria-insumo-repository";
import {
  atualizarInsumo as atualizarInsumoRepository,
  buscarInsumoPorId,
  buscarInsumoPorNome,
} from "@/infrastructure/repositories/insumo-repository";

import {
  VALORES_FASE_APLICACAO_INSUMO,
  VALORES_UNIDADE_MEDIDA_INSUMO,
} from "./insumo-opcoes";

const atualizarInsumoSchema = z.object({
  id: z.number().int().positive("Insumo inválido."),

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

export type AtualizarInsumoInput = z.infer<typeof atualizarInsumoSchema>;

export type AtualizarInsumoResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function atualizarInsumo(
  dados: AtualizarInsumoInput
): Promise<AtualizarInsumoResultado> {
  const validacao = atualizarInsumoSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const {
    id,
    nome,
    composicao,
    faseAplicacao,
    unidadeMedida,
    pontoRessuprimento,
    diasCarencia,
    categoriaId,
  } = validacao.data;

  try {
    const [insumoAtual, insumoComMesmoNome, categoria] = await Promise.all([
      buscarInsumoPorId(id),
      buscarInsumoPorNome(nome),
      buscarCategoriaInsumoPorId(categoriaId),
    ]);

    if (!insumoAtual) {
      return {
        sucesso: false,
        mensagem: "Insumo não encontrado.",
      };
    }

    if (insumoComMesmoNome && insumoComMesmoNome.ins_id !== id) {
      return {
        sucesso: false,
        mensagem: "Já existe outro insumo cadastrado com este nome.",
      };
    }

    if (!categoria) {
      return {
        sucesso: false,
        mensagem: "A categoria selecionada não existe.",
      };
    }

    await atualizarInsumoRepository(id, {
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
        mensagem: "Já existe outro insumo cadastrado com este nome.",
      };
    }

    if (erroPrismaTemCodigo(error, "P2025")) {
      return {
        sucesso: false,
        mensagem: "O insumo ou a categoria selecionada não existe mais.",
      };
    }

    console.error("Erro ao atualizar insumo:", error);

    return {
      sucesso: false,
      mensagem: "Não foi possível atualizar o insumo. Tente novamente.",
    };
  }
}
