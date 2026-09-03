import { consultarCnpj } from "@/infrastructure/external/cnpj-api";

import { cnpjValido, somenteDigitos } from "./cnpj";

export type BuscarDadosCnpjResultado =
  | {
      sucesso: true;
      dados: {
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
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function buscarDadosCnpj(
  cnpj: string
): Promise<BuscarDadosCnpjResultado> {
  if (!cnpjValido(cnpj)) {
    return {
      sucesso: false,
      mensagem: "Informe um CNPJ válido para buscar os dados.",
    };
  }

  try {
    const dados = await consultarCnpj(somenteDigitos(cnpj));

    if (!dados) {
      return {
        sucesso: false,
        mensagem: "CNPJ não encontrado na Receita Federal.",
      };
    }

    return {
      sucesso: true,
      dados,
    };
  } catch (erro) {
    console.error("Falha ao consultar CNPJ:", erro);

    return {
      sucesso: false,
      mensagem:
        "Não foi possível consultar o CNPJ no momento. Tente novamente.",
    };
  }
}
