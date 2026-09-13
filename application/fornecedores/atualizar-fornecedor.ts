import { z } from "zod";

import { formatarCepParcial } from "@/application/enderecos/cep";
import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  atualizarFornecedor as atualizarFornecedorRepository,
  buscarFornecedorPorCnpj,
  buscarFornecedorPorEmail,
  buscarFornecedorPorId,
} from "@/infrastructure/repositories/fornecedor-repository";

import { formatarCnpj } from "./cnpj";
import {
  fornecedorSchema,
  type FornecedorInput,
} from "./fornecedor-schema";
import { formatarTelefoneParcial } from "./telefone";

const atualizarFornecedorSchema = fornecedorSchema.extend({
  id: z
    .number()
    .int()
    .positive("Fornecedor inválido."),
});

export type AtualizarFornecedorInput = FornecedorInput & {
  id: number;
};

export type AtualizarFornecedorResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function atualizarFornecedor(
  dados: AtualizarFornecedorInput
): Promise<AtualizarFornecedorResultado> {
  const validacao = atualizarFornecedorSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const {
    id,
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
    const fornecedorAtual = await buscarFornecedorPorId(id);

    if (!fornecedorAtual) {
      return {
        sucesso: false,
        mensagem: "Fornecedor não encontrado.",
      };
    }

    const [fornecedorComMesmoCnpj, fornecedorComMesmoEmail] =
      await Promise.all([
        buscarFornecedorPorCnpj(cnpjFormatado),
        buscarFornecedorPorEmail(emailNormalizado),
      ]);

    if (
      fornecedorComMesmoCnpj &&
      fornecedorComMesmoCnpj.for_id !== id
    ) {
      return {
        sucesso: false,
        mensagem:
          "Já existe outro fornecedor cadastrado com este CNPJ.",
      };
    }

    if (
      fornecedorComMesmoEmail &&
      fornecedorComMesmoEmail.for_id !== id
    ) {
      return {
        sucesso: false,
        mensagem:
          "Já existe outro fornecedor cadastrado com este e-mail.",
      };
    }

    await atualizarFornecedorRepository(id, {
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
          "Já existe outro fornecedor cadastrado com este CNPJ ou e-mail.",
      };
    }

    if (erroPrismaTemCodigo(erro, "P2003")) {
      return {
        sucesso: false,
        mensagem:
          "A categoria de fornecimento selecionada não existe mais.",
      };
    }

    if (erroPrismaTemCodigo(erro, "P2025")) {
      return {
        sucesso: false,
        mensagem:
          "O fornecedor ou a categoria selecionada não existe mais.",
      };
    }

    console.error("Erro ao atualizar fornecedor:", erro);

    return {
      sucesso: false,
      mensagem:
        "Não foi possível atualizar o fornecedor. Tente novamente.",
    };
  }
}