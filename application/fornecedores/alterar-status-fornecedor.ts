import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  atualizarStatusFornecedor,
  buscarFornecedorPorId,
} from "@/infrastructure/repositories/fornecedor-repository";

const statusFornecedorValores = ["ATIVO", "INATIVO"] as const;

const alterarStatusFornecedorSchema = z.object({
  id: z.number().int().positive("Fornecedor inválido."),

  status: z.enum(statusFornecedorValores, {
    error: "Status inválido.",
  }),
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

  try {
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
  } catch (erro) {
    if (erroPrismaTemCodigo(erro, "P2025")) {
      return {
        sucesso: false,
        mensagem:
          "O fornecedor não foi encontrado ou foi alterado por outro usuário.",
      };
    }

    console.error("Falha ao alterar o status do fornecedor:", erro);

    return {
      sucesso: false,
      mensagem:
        "Não foi possível alterar o status do fornecedor no momento. Tente novamente.",
    };
  }
}