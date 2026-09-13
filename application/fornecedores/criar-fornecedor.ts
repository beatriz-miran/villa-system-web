import { formatarCepParcial } from "@/application/enderecos/cep";
import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  buscarFornecedorPorCnpj,
  buscarFornecedorPorEmail,
  criarFornecedor as criarFornecedorRepository,
} from "@/infrastructure/repositories/fornecedor-repository";

import { formatarCnpj } from "./cnpj";
import {
  fornecedorSchema,
  type FornecedorInput,
} from "./fornecedor-schema";
import { formatarTelefoneParcial } from "./telefone";

export type CriarFornecedorInput = FornecedorInput;

export type CriarFornecedorResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function criarFornecedor(
  dados: CriarFornecedorInput
): Promise<CriarFornecedorResultado> {
  const validacao = fornecedorSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const {
    razaoSocial,
    nomeFantasia,
    cnpj,
    email,
    telefonePrincipal,
    telefoneSecundario,
    cep,
    logradouro,
    numero,
    bairro,
    cidade,
    estado,
    categoriaId,
  } = validacao.data;

  const cnpjFormatado = formatarCnpj(cnpj);
  const emailNormalizado = email.toLowerCase();
  const telefonePrincipalFormatado =
    formatarTelefoneParcial(telefonePrincipal);
  const telefoneSecundarioFormatado = telefoneSecundario
    ? formatarTelefoneParcial(telefoneSecundario)
    : null;
  const cepFormatado = cep ? formatarCepParcial(cep) : null;

  try {
    const [fornecedorComMesmoCnpj, fornecedorComMesmoEmail] =
      await Promise.all([
        buscarFornecedorPorCnpj(cnpjFormatado),
        buscarFornecedorPorEmail(emailNormalizado),
      ]);

    if (fornecedorComMesmoCnpj) {
      return {
        sucesso: false,
        mensagem: "Já existe um fornecedor cadastrado com este CNPJ.",
      };
    }

    if (fornecedorComMesmoEmail) {
      return {
        sucesso: false,
        mensagem: "Já existe um fornecedor cadastrado com este e-mail.",
      };
    }

    await criarFornecedorRepository({
      razaoSocial,
      nomeFantasia: nomeFantasia || null,
      cnpj: cnpjFormatado,
      email: emailNormalizado,
      telefonePrincipal: telefonePrincipalFormatado,
      telefoneSecundario: telefoneSecundarioFormatado,
      cep: cepFormatado,
      logradouro: logradouro || null,
      numero: numero || null,
      bairro: bairro || null,
      cidade: cidade || null,
      estado: estado ? estado.toUpperCase() : null,
      categoriaId,
    });

    return {
      sucesso: true,
    };
  } catch (erro) {
    if (erroPrismaTemCodigo(erro, "P2002")) {
      return {
        sucesso: false,
        mensagem:
          "Já existe um fornecedor cadastrado com este CNPJ ou e-mail.",
      };
    }

    if (
      erroPrismaTemCodigo(erro, "P2003") ||
      erroPrismaTemCodigo(erro, "P2025")
    ) {
      return {
        sucesso: false,
        mensagem:
          "A categoria de fornecimento selecionada não existe mais.",
      };
    }

    console.error("Erro ao cadastrar fornecedor:", erro);

    return {
      sucesso: false,
      mensagem:
        "Não foi possível cadastrar o fornecedor. Tente novamente.",
    };
  }
}