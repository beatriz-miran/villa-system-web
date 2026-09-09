"use server";

import {
  AuthError,
  CredentialsSignin,
} from "next-auth";

import { signIn } from "@/auth";

export async function autenticar(
  _prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (
      error instanceof CredentialsSignin &&
      error.code === "muitas_tentativas"
    ) {
      return "Muitas tentativas incorretas. Aguarde 15 minutos e tente novamente.";
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "E-mail ou senha inválidos.";

        default:
          return "Não foi possível realizar o login.";
      }
    }

    throw error;
  }
}