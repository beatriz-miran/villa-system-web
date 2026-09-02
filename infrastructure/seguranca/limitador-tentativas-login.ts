import "server-only";

type RegistroTentativasLogin = {
  quantidade: number;
  inicioJanela: number;
  bloqueadoAte: number | null;
};

const MAXIMO_TENTATIVAS = 5;
const DURACAO_JANELA_MS = 15 * 60 * 1000;
const DURACAO_BLOQUEIO_MS = 15 * 60 * 1000;

const globalParaTentativasLogin = globalThis as unknown as {
  registrosTentativasLogin:
    | Map<string, RegistroTentativasLogin>
    | undefined;
};

const registrosTentativasLogin =
  globalParaTentativasLogin.registrosTentativasLogin ??
  new Map<string, RegistroTentativasLogin>();

globalParaTentativasLogin.registrosTentativasLogin =
  registrosTentativasLogin;

function limparRegistrosExpirados(agora: number) {
  for (const [chave, registro] of registrosTentativasLogin) {
    const expiraEm =
      registro.bloqueadoAte ??
      registro.inicioJanela + DURACAO_JANELA_MS;

    if (expiraEm <= agora) {
      registrosTentativasLogin.delete(chave);
    }
  }
}

export function criarChaveTentativaLogin(
  email: string,
  request: Request
) {
  const encaminhado =
    request.headers.get("x-forwarded-for");

  const primeiroIp =
    encaminhado?.split(",")[0]?.trim();

  const ip =
    primeiroIp ||
    request.headers.get("x-real-ip")?.trim() ||
    "ip-desconhecido";

  return `${email.trim().toLowerCase()}|${ip}`;
}

export function tentativaLoginEstaBloqueada(
  chave: string
) {
  const agora = Date.now();

  limparRegistrosExpirados(agora);

  const registro = registrosTentativasLogin.get(chave);

  return Boolean(
    registro?.bloqueadoAte &&
      registro.bloqueadoAte > agora
  );
}

export function registrarFalhaLogin(chave: string) {
  const agora = Date.now();

  limparRegistrosExpirados(agora);

  const registroAtual =
    registrosTentativasLogin.get(chave);

  if (!registroAtual) {
    registrosTentativasLogin.set(chave, {
      quantidade: 1,
      inicioJanela: agora,
      bloqueadoAte: null,
    });

    return;
  }

  const quantidade = registroAtual.quantidade + 1;

  registrosTentativasLogin.set(chave, {
    quantidade,
    inicioJanela: registroAtual.inicioJanela,
    bloqueadoAte:
      quantidade >= MAXIMO_TENTATIVAS
        ? agora + DURACAO_BLOQUEIO_MS
        : null,
  });
}

export function limparTentativasLogin(
  chave: string
) {
  registrosTentativasLogin.delete(chave);
}