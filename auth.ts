import NextAuth, {
  CredentialsSignin,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import { authConfig } from "./auth.config";
import { prisma } from "@/infrastructure/database/prisma";
import {
  criarChaveTentativaLogin,
  limparTentativasLogin,
  registrarFalhaLogin,
  tentativaLoginEstaBloqueada,
} from "@/infrastructure/seguranca/limitador-tentativas-login";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

class MuitasTentativasLoginError extends CredentialsSignin {
  code = "muitas_tentativas";
}

function rejeitarTentativaLogin(chave: string) {
  registrarFalhaLogin(chave);

  if (tentativaLoginEstaBloqueada(chave)) {
    throw new MuitasTentativasLoginError();
  }

  return null;
}

const nextAuth = NextAuth({
  ...authConfig,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.perfil = user.perfil;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.perfil = token.perfil;

      return session;
    },
  },

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "E-mail",
          type: "email",
        },
        password: {
          label: "Senha",
          type: "password",
        },
      },

      async authorize(credentials, request) {
        const parsedCredentials =
          credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const email =
          parsedCredentials.data.email.toLowerCase();

        const password =
          parsedCredentials.data.password;

        const chaveTentativa =
          criarChaveTentativaLogin(email, request);

        if (
          tentativaLoginEstaBloqueada(chaveTentativa)
        ) {
          throw new MuitasTentativasLoginError();
        }

        const usuario = await prisma.usuario.findUnique({
          where: {
            usu_email: email,
          },
        });

        if (
          !usuario ||
          usuario.usu_status !== "ATIVO"
        ) {
          return rejeitarTentativaLogin(
            chaveTentativa
          );
        }

        const senhaCorreta = await compare(
          password,
          usuario.usu_senha
        );

        if (!senhaCorreta) {
          return rejeitarTentativaLogin(
            chaveTentativa
          );
        }

        limparTentativasLogin(chaveTentativa);

        return {
          id: String(usuario.usu_id),
          name: usuario.usu_nome,
          email: usuario.usu_email,
          perfil: usuario.usu_perfil_acesso,
        };
      },
    }),
  ],
});

const authBase = nextAuth.auth;

export const {
  signIn,
  signOut,
  handlers,
} = nextAuth;

export async function auth() {
  const session = await authBase();

  if (!session?.user?.id) {
    return null;
  }

  const usuarioId = Number(session.user.id);

  if (
    !Number.isInteger(usuarioId) ||
    usuarioId <= 0
  ) {
    return null;
  }

  const usuarioAtual =
    await prisma.usuario.findUnique({
      where: {
        usu_id: usuarioId,
      },
      select: {
        usu_id: true,
        usu_nome: true,
        usu_email: true,
        usu_perfil_acesso: true,
        usu_status: true,
      },
    });

  if (
    !usuarioAtual ||
    usuarioAtual.usu_status !== "ATIVO"
  ) {
    return null;
  }

  session.user.id = String(usuarioAtual.usu_id);
  session.user.name = usuarioAtual.usu_nome;
  session.user.email = usuarioAtual.usu_email;
  session.user.perfil =
    usuarioAtual.usu_perfil_acesso;

  return session;
}