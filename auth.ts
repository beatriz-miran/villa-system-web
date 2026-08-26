import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import { authConfig } from "./auth.config";
import { prisma } from "@/infrastructure/database/prisma";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
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

      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        const usuario = await prisma.usuario.findUnique({
          where: {
            usu_email: email,
          },
        });

        if (!usuario || usuario.usu_status !== "ATIVO") {
          return null;
        }

        const senhaCorreta = await compare(password, usuario.usu_senha);

        if (!senhaCorreta) {
          return null;
        }

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