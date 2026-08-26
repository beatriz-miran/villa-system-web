import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.perfil !== "ADMIN") {
    redirect("/operador");
  }

  return (
    <main>
      <h1>Área do Administrador</h1>
      <p>Olá, {session.user.name}.</p>
    </main>
  );
}