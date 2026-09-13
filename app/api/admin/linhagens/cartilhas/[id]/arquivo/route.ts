import { auth } from "@/auth";
import { buscarCartilhaPorId } from "@/infrastructure/repositories/cartilha-linhagem-repository";

const hostsPermitidos = new Set([
  "hyline.com",
  "www.hyline.com",
  "embrapa.br",
  "www.embrapa.br",
]);

function hostEstaPermitido(hostname: string) {
  const host = hostname.toLowerCase();

  return Array.from(hostsPermitidos).some(
    (permitido) =>
      host === permitido || host.endsWith(`.${permitido}`)
  );
}

function respostaErro(status: number, mensagem: string) {
  return Response.json(
    {
      erro: mensagem,
    },
    {
      status,
    }
  );
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const session = await auth();

  if (!session?.user) {
    return respostaErro(401, "Você precisa estar autenticado.");
  }

  if (session.user.perfil !== "ADMIN") {
    return respostaErro(403, "Acesso restrito a administradores.");
  }

  const { id } = await context.params;
  const cartilhaId = Number(id);

  if (!Number.isInteger(cartilhaId) || cartilhaId <= 0) {
    return respostaErro(400, "Cartilha inválida.");
  }

  const cartilha = await buscarCartilhaPorId(cartilhaId);

  if (!cartilha) {
    return respostaErro(404, "Cartilha não encontrada.");
  }

  let url: URL;

  try {
    url = new URL(cartilha.ctl_url);
  } catch {
    return respostaErro(400, "A URL da cartilha é inválida.");
  }

  if (url.protocol !== "https:" || !hostEstaPermitido(url.hostname)) {
    return respostaErro(
      400,
      "A fonte desta cartilha não está autorizada para visualização interna."
    );
  }

  try {
    const resposta = await fetch(url, {
      headers: {
        Accept: "application/pdf",
        "User-Agent": "VillaSystem/1.0",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (!resposta.ok) {
      return respostaErro(
        502,
        "A fonte oficial não respondeu ao solicitar a cartilha."
      );
    }

    const urlFinal = new URL(resposta.url);

    if (
      urlFinal.protocol !== "https:" ||
      !hostEstaPermitido(urlFinal.hostname)
    ) {
      return respostaErro(
        502,
        "A fonte redirecionou para um domínio não autorizado."
      );
    }

    const contentType =
      resposta.headers.get("content-type")?.toLowerCase() ?? "";

    if (!contentType.includes("application/pdf")) {
      return respostaErro(
        502,
        "A fonte não retornou um arquivo PDF."
      );
    }

    const arquivo = await resposta.arrayBuffer();

    return new Response(arquivo, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Erro ao carregar cartilha:", error);

    return respostaErro(
      502,
      "Não foi possível carregar a cartilha no momento."
    );
  }
}