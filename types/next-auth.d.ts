import "next-auth";
import "next-auth/jwt";

type PerfilAcesso = "ADMIN" | "OPERADOR";

declare module "next-auth" {
  interface User {
    perfil: PerfilAcesso;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      perfil: PerfilAcesso;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    perfil: PerfilAcesso;
  }
}