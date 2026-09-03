import { z } from "zod";

import {
  buscarGalpaoPorNome,
  criarGalpao as criarGalpaoRepository,
} from "@/infrastructure/repositories/galpao-repository";

const criarGalpaoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do galpão.")
    .max(100, "O nome do galpão deve possuir no máximo 100 caracteres."),

  areaM2: z
    .number({ error: "Informe a área do galpão em m²." })
    .positive("A área do galpão deve ser maior que zero.")
    .max(9999.99, "A área do galpão deve ser de no máximo 9999,99 m²."),
});

export type CriarGalpaoInput = z.infer<typeof criarGalpaoSchema>;

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
  const validacao = criarGalpaoSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const { nome, areaM2 } = validacao.data;

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
}
