import { z } from "zod";

import {
  atualizarUsuario as atualizarUsuarioRepository,
  buscarUsuarioPorEmail,
  buscarUsuarioPorId,
} from "@/infrastructure/repositories/usuario-repository";

const atualizarUsuarioSchema = z.object({
  id: z
    .number()
    .int()
    .positive("Usuário inválido."),

  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do usuário."),

  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido."),

  perfil: z.enum(
    ["ADMIN", "OPERADOR"],
    {
      error: "Selecione um perfil válido.",
    }
  ),
});

export type AtualizarUsuarioInput = z.infer<
  typeof atualizarUsuarioSchema
>;

export type AtualizarUsuarioResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function atualizarUsuario(
  dados: AtualizarUsuarioInput
): Promise<AtualizarUsuarioResultado> {
  const validacao = atualizarUsuarioSchema.safeParse(dados);

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
    email,
    perfil,
  } = validacao.data;

  const usuarioAtual = await buscarUsuarioPorId(id);

  if (!usuarioAtual) {
    return {
      sucesso: false,
      mensagem: "Usuário não encontrado.",
    };
  }

  const emailNormalizado = email.toLowerCase();

  const usuarioComMesmoEmail =
    await buscarUsuarioPorEmail(emailNormalizado);

  if (
    usuarioComMesmoEmail &&
    usuarioComMesmoEmail.usu_id !== id
  ) {
    return {
      sucesso: false,
      mensagem: "Já existe outro usuário com este e-mail.",
    };
  }

  await atualizarUsuarioRepository(id, {
    nome,
    email: emailNormalizado,
    perfil,
  });

  return {
    sucesso: true,
  };
}
