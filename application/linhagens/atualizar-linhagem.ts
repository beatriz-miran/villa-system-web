import { z } from "zod";

import {
  atualizarLinhagem as atualizarLinhagemRepository,
  buscarLinhagemPorId,
  buscarLinhagemPorNome,
} from "@/infrastructure/repositories/linhagem-repository";

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
    .min(2, "Informe o nome da linhagem."),

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

  const linhagemAtual = await buscarLinhagemPorId(id);

  if (!linhagemAtual) {
    return {
      sucesso: false,
      mensagem: "Linhagem não encontrada.",
    };
  }

  const linhagemComMesmoNome = await buscarLinhagemPorNome(nome);

  if (
    linhagemComMesmoNome &&
    linhagemComMesmoNome.lin_id !== id
  ) {
    return {
      sucesso: false,
      mensagem: "Já existe outra linhagem cadastrada com este nome.",
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
}
