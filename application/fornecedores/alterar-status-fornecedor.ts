import { z } from "zod";

import {
  atualizarStatusFornecedor,
  buscarFornecedorPorId,
} from "@/infrastructure/repositories/fornecedor-repository";

const alterarStatusFornecedorSchema = z.object({
  id: z
    .number()
    .int()
    .positive("Fornecedor inválido."),

  status: z.enum(
    ["ATIVO", "INATIVO"],
    {
      error: "Status inválido.",
    }
  ),
});

export type AlterarStatusFornecedorInput = z.infer<
  typeof alterarStatusFornecedorSchema
>;

export type AlterarStatusFornecedorResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function alterarStatusFornecedor(
  dados: AlterarStatusFornecedorInput
): Promise<AlterarStatusFornecedorResultado> {
  const validacao = alterarStatusFornecedorSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Não foi possível alterar o status do fornecedor.",
    };
  }

  const { id, status } = validacao.data;

  const fornecedor = await buscarFornecedorPorId(id);

  if (!fornecedor) {
    return {
      sucesso: false,
      mensagem: "Fornecedor não encontrado.",
    };
  }

  if (fornecedor.for_status === status) {
    return {
      sucesso: true,
    };
  }

  await atualizarStatusFornecedor(id, status);

  return {
    sucesso: true,
  };
}
