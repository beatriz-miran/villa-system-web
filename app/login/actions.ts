"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function autenticar(
  _prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData, {
      redirectTo: "/",
    });
  } catch (error) {
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