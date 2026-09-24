import { z } from "zod";

const TEMPO_LIMITE_CONSULTA_MS = 10_000;

const respostaBrasilApiSchema = z.object({
  razao_social: z.string().trim().min(1),
  nome_fantasia: z.string().nullish(),
  ddd_telefone_1: z.string().nullish(),
  cep: z.string().nullish(),
  logradouro: z.string().nullish(),
  numero: z.string().nullish(),
  bairro: z.string().nullish(),
  municipio: z.string().nullish(),
  uf: z.string().nullish(),
});

export type DadosCnpjExterno = {
  razaoSocial: string;
  nomeFantasia: string | null;
  telefonePrincipal: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
};

export async function consultarCnpj(
  cnpj: string
): Promise<DadosCnpjExterno | null> {
  const resposta = await fetch(
    `https://brasilapi.com.br/api/cnpj/v1/${encodeURIComponent(cnpj)}`,
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
      `Falha ao consultar CNPJ na BrasilAPI (status ${resposta.status}).`
    );
  }

  const corpoResposta: unknown = await resposta.json();
  const validacao = respostaBrasilApiSchema.safeParse(corpoResposta);

  if (!validacao.success) {
    throw new Error(
      "A BrasilAPI retornou dados de CNPJ em um formato inesperado."
    );
  }

  const dados = validacao.data;

  return {
    razaoSocial: dados.razao_social,
    nomeFantasia: dados.nome_fantasia || null,
    telefonePrincipal: dados.ddd_telefone_1 || null,
    cep: dados.cep || null,
    logradouro: dados.logradouro || null,
    numero: dados.numero || null,
    bairro: dados.bairro || null,
    cidade: dados.municipio || null,
    estado: dados.uf || null,
  };
}