import { redirect } from "next/navigation";

import { auth } from "@/auth";

import LoginDesktop from "./components/LoginDesktop";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    if (session.user.perfil === "ADMIN") {
      redirect("/admin");
    }

    redirect("/operador");
  }

  return <LoginDesktop />;
}