import { z } from "zod";

import {
  atualizarGalpao as atualizarGalpaoRepository,
  buscarGalpaoPorId,
  buscarGalpaoPorNome,
} from "@/infrastructure/repositories/galpao-repository";

const atualizarGalpaoSchema = z.object({
  id: z.number().int().positive("Galpão inválido."),

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

export type AtualizarGalpaoInput = z.infer<typeof atualizarGalpaoSchema>;

export type AtualizarGalpaoResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function atualizarGalpao(
  dados: AtualizarGalpaoInput
): Promise<AtualizarGalpaoResultado> {
  const validacao = atualizarGalpaoSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const { id, nome, areaM2 } = validacao.data;

  const galpaoAtual = await buscarGalpaoPorId(id);

  if (!galpaoAtual) {
    return {
      sucesso: false,
      mensagem: "Galpão não encontrado.",
    };
  }

  const galpaoComMesmoNome = await buscarGalpaoPorNome(nome);

  if (galpaoComMesmoNome && galpaoComMesmoNome.gal_id !== id) {
    return {
      sucesso: false,
      mensagem: "Já existe outro galpão cadastrado com este nome.",
    };
  }

  await atualizarGalpaoRepository(id, {
    nome,
    areaM2,
  });

  return {
    sucesso: true,
  };
}
