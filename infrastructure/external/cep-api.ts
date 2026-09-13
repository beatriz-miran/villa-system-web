import { z } from "zod";

const TEMPO_LIMITE_CONSULTA_MS = 10_000;

const respostaBrasilApiCepSchema = z.object({
  cep: z.string().trim().min(8),
  state: z.string().trim().length(2),
  city: z.string().trim().min(1),
  neighborhood: z.string().nullish(),
  street: z.string().nullish(),
});

export type EnderecoCepExterno = {
  cep: string;
  logradouro: string | null;
  bairro: string | null;
  cidade: string;
  estado: string;
};

export async function consultarCep(
  cep: string
): Promise<EnderecoCepExterno | null> {
  const resposta = await fetch(
    `https://brasilapi.com.br/api/cep/v2/${encodeURIComponent(cep)}`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "VillaSystem/1.0",
      },
      signal: AbortSignal.timeout(TEMPO_LIMITE_CONSULTA_MS),
    }
  );

  if (resposta.status === 404) {
    return null;
  }

  if (!resposta.ok) {
    throw new Error(
      `Falha ao consultar CEP na BrasilAPI (status ${resposta.status}).`
    );
  }

  const corpoResposta: unknown = await resposta.json();
  const validacao =
    respostaBrasilApiCepSchema.safeParse(corpoResposta);

  if (!validacao.success) {
    throw new Error(
      "A BrasilAPI retornou dados de CEP em um formato inesperado."
    );
  }

  const dados = validacao.data;

  return {
    cep: dados.cep,
    logradouro: dados.street || null,
    bairro: dados.neighborhood || null,
    cidade: dados.city,
    estado: dados.state.toUpperCase(),
  };
}