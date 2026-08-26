import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function OperadorPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.perfil !== "OPERADOR") {
    redirect("/admin");
  }

  return (
    <main>
      <h1>Área do Operador</h1>
      <p>Olá, {session.user.name}.</p>
    </main>
  );
}