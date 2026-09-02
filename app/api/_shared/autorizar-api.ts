import { NextResponse } from "next/server";

import { auth } from "@/auth";

type PerfilAcesso = "ADMIN" | "OPERADOR";

type AutorizacaoApiSucesso = {
  autorizado: true;
  session: NonNullable<Awaited<ReturnType<typeof auth>>>;
};

type AutorizacaoApiFalha = {
  autorizado: false;
  resposta: NextResponse;
};

type AutorizacaoApi =
  | AutorizacaoApiSucesso
  | AutorizacaoApiFalha;

export async function autorizarApi(
  perfisPermitidos?: PerfilAcesso[]
): Promise<AutorizacaoApi> {
  const session = await auth();

  if (!session?.user) {
    return {
      autorizado: false,
      resposta: NextResponse.json(
        {
          erro: "Não autenticado.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  if (
    perfisPermitidos &&
    !perfisPermitidos.includes(session.user.perfil)
  ) {
    return {
      autorizado: false,
      resposta: NextResponse.json(
        {
          erro: "Acesso não autorizado.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    autorizado: true,
    session,
  };
}