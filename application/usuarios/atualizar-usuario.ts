import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import { executarAlteracaoUsuarioComBloqueio } from "@/infrastructure/repositories/usuario-repository";

const atualizarUsuarioSchema = z.object({
  id: z
    .number()
    .int()
    .positive("Usuário inválido."),

  usuarioLogadoId: z
    .number()
    .int()
    .positive("Usuário autenticado inválido."),

  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do usuário.")
    .max(
      100,
      "O nome deve possuir no máximo 100 caracteres.",
    ),

  email: z
    .string()
    .trim()
    .max(
      150,
      "O e-mail deve possuir no máximo 150 caracteres.",
    )
    .email("Informe um e-mail válido."),

  perfil: z.enum(
    ["ADMIN", "OPERADOR"],
    {
      error: "Selecione um perfil válido.",
    },
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
  dados: AtualizarUsuarioInput,
): Promise<AtualizarUsuarioResultado> {
  const validacao =
    atualizarUsuarioSchema.safeParse(dados);

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
    usuarioLogadoId,
    nome,
    email,
    perfil,
  } = validacao.data;

  const emailNormalizado =
    email.toLowerCase();

  try {
    const resultado =
      await executarAlteracaoUsuarioComBloqueio<
        AtualizarUsuarioResultado
      >(async (repositorio) => {
        const usuarioAtual =
          await repositorio.buscarUsuarioPorId(
            id,
          );

        if (!usuarioAtual) {
          return {
            sucesso: false,
            mensagem: "Usuário não encontrado.",
          };
        }

        const estaRebaixandoProprioPerfil =
          id === usuarioLogadoId &&
          usuarioAtual.usu_perfil_acesso ===
            "ADMIN" &&
          perfil !== "ADMIN";

        if (estaRebaixandoProprioPerfil) {
          return {
            sucesso: false,
            mensagem:
              "Você não pode alterar o seu próprio perfil de administrador para operador.",
          };
        }

        const usuarioComMesmoEmail =
          await repositorio.buscarUsuarioPorEmail(
            emailNormalizado,
          );

        if (
          usuarioComMesmoEmail &&
          usuarioComMesmoEmail.usu_id !== id
        ) {
          return {
            sucesso: false,
            mensagem:
              "Já existe outro usuário com este e-mail.",
          };
        }

        const estaRebaixandoAdministradorAtivo =
          usuarioAtual.usu_perfil_acesso ===
            "ADMIN" &&
          usuarioAtual.usu_status ===
            "ATIVO" &&
          perfil !== "ADMIN";

        if (
          estaRebaixandoAdministradorAtivo
        ) {
          const totalAdministradoresAtivos =
            await repositorio.contarAdministradoresAtivos();

          if (
            totalAdministradoresAtivos <= 1
          ) {
            return {
              sucesso: false,
              mensagem:
                "O sistema deve manter pelo menos um administrador ativo.",
            };
          }
        }

        await repositorio.atualizarUsuario(
          id,
          {
            nome,
            email: emailNormalizado,
            perfil,
          },
        );

        return {
          sucesso: true,
        };
      });

    return resultado;
  } catch (error) {
    if (erroPrismaTemCodigo(error, "P2002")) {
      return {
        sucesso: false,
        mensagem:
          "Já existe outro usuário com este e-mail.",
      };
    }

    if (erroPrismaTemCodigo(error, "P2025")) {
      return {
        sucesso: false,
        mensagem: "Usuário não encontrado.",
      };
    }

    console.error(
      "Erro ao atualizar usuário:",
      error,
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível atualizar o usuário. Tente novamente.",
    };
  }
}