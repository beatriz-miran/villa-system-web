import { z } from "zod";

import {
  buscarLinhagemPorNome,
  criarLinhagem as criarLinhagemRepository,
} from "@/infrastructure/repositories/linhagem-repository";
import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import { buscarTipoOvoPorId } from "@/infrastructure/repositories/tipo-ovo-repository";

import {
  existemSemanasDuplicadas,
  metaLinhagemSchema,
} from "./meta-linhagem-schema";

const criarLinhagemSchema = z.object({
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

export type CriarLinhagemInput = z.infer<typeof criarLinhagemSchema>;

export type CriarLinhagemResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function criarLinhagem(
  dados: CriarLinhagemInput
): Promise<CriarLinhagemResultado> {
  const validacao = criarLinhagemSchema.safeParse(dados);

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
    const [linhagemExistente, tipoOvo] = await Promise.all([
      buscarLinhagemPorNome(nome),
      buscarTipoOvoPorId(tipoOvoId),
    ]);

    if (linhagemExistente) {
      return {
        sucesso: false,
        mensagem: "Já existe uma linhagem cadastrada com este nome.",
      };
    }

    if (!tipoOvo) {
      return {
        sucesso: false,
        mensagem: "O tipo de ovo selecionado não existe.",
      };
    }

    await criarLinhagemRepository({
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
        mensagem: "Já existe uma linhagem cadastrada com este nome.",
      };
    }

    if (erroPrismaTemCodigo(error, "P2025")) {
      return {
        sucesso: false,
        mensagem: "O tipo de ovo selecionado não existe mais.",
      };
    }

    console.error("Erro ao cadastrar linhagem:", error);

    return {
      sucesso: false,
      mensagem:
        "Não foi possível cadastrar a linhagem. Tente novamente.",
    };
  }
}
