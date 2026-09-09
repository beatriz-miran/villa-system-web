import { hash } from "bcryptjs";
import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  buscarUsuarioPorEmail,
  criarUsuario as criarUsuarioRepository,
} from "@/infrastructure/repositories/usuario-repository";

const criarUsuarioSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do usuário.")
    .max(
      100,
      "O nome deve possuir no máximo 100 caracteres."
    ),

  email: z
    .string()
    .trim()
    .max(
      150,
      "O e-mail deve possuir no máximo 150 caracteres."
    )
    .email("Informe um e-mail válido."),

  perfil: z.enum(
    ["ADMIN", "OPERADOR"],
    {
      error: "Selecione um perfil válido.",
    }
  ),

  senha: z
    .string()
    .min(
      8,
      "A senha deve possuir pelo menos 8 caracteres."
    )
    .max(
      72,
      "A senha deve possuir no máximo 72 caracteres."
    ),
});

export type CriarUsuarioInput = z.infer<
  typeof criarUsuarioSchema
>;

export type CriarUsuarioResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function criarUsuario(
  dados: CriarUsuarioInput
): Promise<CriarUsuarioResultado> {
  const validacao =
    criarUsuarioSchema.safeParse(dados);

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
    email,
    perfil,
    senha,
  } = validacao.data;

  const emailNormalizado = email.toLowerCase();

  try {
    const usuarioExistente =
      await buscarUsuarioPorEmail(emailNormalizado);

    if (usuarioExistente) {
      return {
        sucesso: false,
        mensagem:
          "Já existe um usuário com este e-mail.",
      };
    }

    const senhaHash = await hash(senha, 12);

    await criarUsuarioRepository({
      nome,
      email: emailNormalizado,
      perfil,
      senhaHash,
    });

    return {
      sucesso: true,
    };
  } catch (error) {
    if (erroPrismaTemCodigo(error, "P2002")) {
      return {
        sucesso: false,
        mensagem:
          "Já existe um usuário com este e-mail.",
      };
    }

    console.error(
      "Erro ao cadastrar usuário:",
      error
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível cadastrar o usuário. Tente novamente.",
    };
  }
}