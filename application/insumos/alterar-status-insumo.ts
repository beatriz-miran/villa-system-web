import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  atualizarStatusInsumo,
  buscarInsumoPorId,
} from "@/infrastructure/repositories/insumo-repository";

const alterarStatusInsumoSchema = z.object({
  id: z.number().int().positive("Insumo inválido."),

  status: z.enum(["ATIVO", "INATIVO"], {
    error: "Status inválido.",
  }),
});

export type AlterarStatusInsumoInput = z.infer<
  typeof alterarStatusInsumoSchema
>;

export type AlterarStatusInsumoResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function alterarStatusInsumo(
  dados: AlterarStatusInsumoInput
): Promise<AlterarStatusInsumoResultado> {
  const validacao = alterarStatusInsumoSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Não foi possível alterar o status do insumo.",
    };
  }

  const { id, status } = validacao.data;

  try {
    const insumo = await buscarInsumoPorId(id);

    if (!insumo) {
      return {
        sucesso: false,
        mensagem: "Insumo não encontrado.",
      };
    }

    if (insumo.ins_status === status) {
      return {
        sucesso: true,
      };
    }

    await atualizarStatusInsumo(id, status);

    return {
      sucesso: true,
    };
  } catch (error) {
    if (erroPrismaTemCodigo(error, "P2025")) {
      return {
        sucesso: false,
        mensagem: "Insumo não encontrado.",
      };
    }

    console.error("Erro ao alterar o status do insumo:", error);

    return {
      sucesso: false,
      mensagem: "Não foi possível alterar o status do insumo. Tente novamente.",
    };
  }
}
