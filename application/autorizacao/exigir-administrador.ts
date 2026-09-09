import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function exigirAdministrador() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.perfil !== "ADMIN") {
    redirect("/operador");
  }

  return session;
}