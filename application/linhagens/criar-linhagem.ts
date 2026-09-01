import { z } from "zod";

import {
  buscarLinhagemPorNome,
  criarLinhagem as criarLinhagemRepository,
} from "@/infrastructure/repositories/linhagem-repository";

import {
  existemSemanasDuplicadas,
  metaLinhagemSchema,
} from "./meta-linhagem-schema";

const criarLinhagemSchema = z.object({
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

  const linhagemExistente = await buscarLinhagemPorNome(nome);

  if (linhagemExistente) {
    return {
      sucesso: false,
      mensagem: "Já existe uma linhagem cadastrada com este nome.",
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
}
