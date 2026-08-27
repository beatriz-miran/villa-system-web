import { z } from "zod";

import {
  atualizarStatusUsuario,
  buscarUsuarioPorId,
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
  const validacao = alterarStatusUsuarioSchema.safeParse(dados);

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

  if (usuario.usu_status === status) {
    return {
      sucesso: true,
    };
  }

  await atualizarStatusUsuario(id, status);

  return {
    sucesso: true,
  };
}
