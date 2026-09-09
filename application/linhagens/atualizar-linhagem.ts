import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  atualizarLinhagem as atualizarLinhagemRepository,
  buscarLinhagemPorId,
  buscarLinhagemPorNome,
} from "@/infrastructure/repositories/linhagem-repository";
import { buscarTipoOvoPorId } from "@/infrastructure/repositories/tipo-ovo-repository";

import {
  existemSemanasDuplicadas,
  metaLinhagemSchema,
} from "./meta-linhagem-schema";

const atualizarLinhagemSchema = z.object({
  id: z
    .number()
    .int()
    .positive("Linhagem inválida."),

  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome da linhagem.")
    .max(100, "O nome deve possuir no máximo 100 caracteres."),

  descricao: z
    .string()
    .trim()
    .max(255, "A descrição deve possuir no máximo 255 caracteres.")
    .optional(),

  tipoOvoId: z
    .number({ error: "Selecione um tipo de ovo válido." })
    .int()
    .positive("Selecione um tipo de ovo válido."),

  metas: z.array(metaLinhagemSchema).default([]),
});

export type AtualizarLinhagemInput = z.infer<
  typeof atualizarLinhagemSchema
>;

export type AtualizarLinhagemResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function atualizarLinhagem(
  dados: AtualizarLinhagemInput
): Promise<AtualizarLinhagemResultado> {
  const validacao = atualizarLinhagemSchema.safeParse(dados);

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
    descricao,
    tipoOvoId,
    metas,
  } = validacao.data;

  if (existemSemanasDuplicadas(metas)) {
    return {
      sucesso: false,
      mensagem: "Não é possível repetir a mesma semana nas metas.",
    };
  }

  try {
    const [linhagemAtual, linhagemComMesmoNome, tipoOvo] =
      await Promise.all([
        buscarLinhagemPorId(id),
        buscarLinhagemPorNome(nome),
        buscarTipoOvoPorId(tipoOvoId),
      ]);

    if (!linhagemAtual) {
      return {
        sucesso: false,
        mensagem: "Linhagem não encontrada.",
      };
    }

    if (
      linhagemComMesmoNome &&
      linhagemComMesmoNome.lin_id !== id
    ) {
      return {
        sucesso: false,
        mensagem: "Já existe outra linhagem cadastrada com este nome.",
      };
    }

    if (!tipoOvo) {
      return {
        sucesso: false,
        mensagem: "O tipo de ovo selecionado não existe.",
      };
    }

    await atualizarLinhagemRepository(id, {
      nome,
      descricao: descricao || null,
      tipoOvoId,
      metas,
    });

    return {
      sucesso: true,
    };
  } catch (error) {
    if (erroPrismaTemCodigo(error, "P2002")) {
      return {
        sucesso: false,
        mensagem: "Já existe outra linhagem cadastrada com este nome.",
      };
    }

    if (erroPrismaTemCodigo(error, "P2025")) {
      return {
        sucesso: false,
        mensagem:
          "A linhagem ou o tipo de ovo selecionado não existe mais.",
      };
    }

    console.error("Erro ao atualizar linhagem:", error);

    return {
      sucesso: false,
      mensagem:
        "Não foi possível atualizar a linhagem. Tente novamente.",
    };
  }
}
