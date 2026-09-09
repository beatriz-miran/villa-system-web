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
    `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`,
    {
      cache: "no-store",
      headers: {
        // A Cloudflare (que protege a BrasilAPI) retorna 403 para o
        // User-Agent padrão do fetch em ambiente Node/servidor.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "application/json",
      },
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

  const dados = await resposta.json();

  return {
    razaoSocial: dados.razao_social ?? "",
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
