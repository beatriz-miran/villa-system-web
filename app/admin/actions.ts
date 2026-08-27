"use server";

import { signOut } from "@/auth";

export async function sairDoSistema() {
  await signOut({
    redirectTo: "/login",
  });
}