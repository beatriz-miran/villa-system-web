import { consultarCep } from "@/infrastructure/external/cep-api";

import { cepValido, somenteDigitosCep } from "./cep";

export type BuscarEnderecoPorCepResultado =
  | {
      sucesso: true;
      dados: {
        cep: string;
        logradouro: string | null;
        bairro: string | null;
        cidade: string;
        estado: string;
      };
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function buscarEnderecoPorCep(
  cep: string
): Promise<BuscarEnderecoPorCepResultado> {
  if (!cepValido(cep)) {
    return {
      sucesso: false,
      mensagem: "Informe um CEP válido com oito dígitos.",
    };
  }

  try {
    const endereco = await consultarCep(somenteDigitosCep(cep));

    if (!endereco) {
      return {
        sucesso: false,
        mensagem: "CEP não encontrado.",
      };
    }

    return {
      sucesso: true,
      dados: endereco,
    };
  } catch (erro) {
    console.error("Falha ao consultar CEP:", erro);

    return {
      sucesso: false,
      mensagem:
        "Não foi possível consultar o CEP no momento. Tente novamente.",
    };
  }
}