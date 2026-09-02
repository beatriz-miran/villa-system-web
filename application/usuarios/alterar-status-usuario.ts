import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  atualizarStatusUsuario,
  buscarUsuarioPorId,
  contarAdministradoresAtivos,
} from "@/infrastructure/repositories/usuario-repository";

const alterarStatusUsuarioSchema = z.object({
  id: z
    .number()
    .int()
    .positive("Usuário inválido."),

  status: z.enum(
    ["ATIVO", "INATIVO"],
    {
      error: "Status inválido.",
    }
  ),

  usuarioLogadoId: z
    .number()
    .int()
    .positive("Usuário autenticado inválido."),
});

export type AlterarStatusUsuarioInput = z.infer<
  typeof alterarStatusUsuarioSchema
>;

export type AlterarStatusUsuarioResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function alterarStatusUsuario(
  dados: AlterarStatusUsuarioInput
): Promise<AlterarStatusUsuarioResultado> {
  const validacao =
    alterarStatusUsuarioSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Não foi possível alterar o status do usuário.",
    };
  }

  const {
    id,
    status,
    usuarioLogadoId,
  } = validacao.data;

  try {
    const usuario = await buscarUsuarioPorId(id);

    if (!usuario) {
      return {
        sucesso: false,
        mensagem: "Usuário não encontrado.",
      };
    }

    if (
      id === usuarioLogadoId &&
      status === "INATIVO"
    ) {
      return {
        sucesso: false,
        mensagem:
          "Você não pode desativar o seu próprio usuário.",
      };
    }

    const estaDesativandoAdministradorAtivo =
      usuario.usu_perfil_acesso === "ADMIN" &&
      usuario.usu_status === "ATIVO" &&
      status === "INATIVO";

    if (estaDesativandoAdministradorAtivo) {
      const totalAdministradoresAtivos =
        await contarAdministradoresAtivos();

      if (totalAdministradoresAtivos <= 1) {
        return {
          sucesso: false,
          mensagem:
            "O sistema deve manter pelo menos um administrador ativo.",
        };
      }
    }

    if (usuario.usu_status === status) {
      return {
        sucesso: true,
      };
    }

    await atualizarStatusUsuario(id, status);

    return {
      sucesso: true,
    };
  } catch (error) {
    if (erroPrismaTemCodigo(error, "P2025")) {
      return {
        sucesso: false,
        mensagem: "Usuário não encontrado.",
      };
    }

    console.error(
      "Erro ao alterar o status do usuário:",
      error
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível alterar o status do usuário. Tente novamente.",
    };
  }
}