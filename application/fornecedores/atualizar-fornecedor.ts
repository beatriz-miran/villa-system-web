import { z } from "zod";

import {
  atualizarFornecedor as atualizarFornecedorRepository,
  buscarFornecedorPorCnpj,
  buscarFornecedorPorEmail,
  buscarFornecedorPorId,
} from "@/infrastructure/repositories/fornecedor-repository";

import { cnpjValido, formatarCnpj } from "./cnpj";

const atualizarFornecedorSchema = z.object({
  id: z
    .number()
    .int()
    .positive("Fornecedor inválido."),

  razaoSocial: z
    .string()
    .trim()
    .min(2, "Informe a razão social do fornecedor."),

  nomeFantasia: z
    .string()
    .trim()
    .max(200, "O nome fantasia deve possuir no máximo 200 caracteres.")
    .optional(),

  cnpj: z
    .string()
    .trim()
    .min(1, "Informe o CNPJ do fornecedor.")
    .refine(cnpjValido, "Informe um CNPJ válido."),

  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido."),

  telefonePrincipal: z
    .string()
    .trim()
    .min(8, "Informe um telefone principal válido."),

  telefoneSecundario: z
    .string()
    .trim()
    .optional(),

  cep: z
    .string()
    .trim()
    .optional(),

  logradouro: z
    .string()
    .trim()
    .optional(),

  numero: z
    .string()
    .trim()
    .optional(),

  bairro: z
    .string()
    .trim()
    .optional(),

  cidade: z
    .string()
    .trim()
    .optional(),

  estado: z
    .string()
    .trim()
    .length(2, "Informe a UF com 2 letras.")
    .optional(),

  categoriaId: z
    .number({ error: "Selecione uma categoria de fornecimento válida." })
    .int()
    .positive("Selecione uma categoria de fornecimento válida."),
});

export type AtualizarFornecedorInput = z.infer<
  typeof atualizarFornecedorSchema
>;

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

  const fornecedorAtual = await buscarFornecedorPorId(id);

  if (!fornecedorAtual) {
    return {
      sucesso: false,
      mensagem: "Fornecedor não encontrado.",
    };
  }

  const cnpjFormatado = formatarCnpj(cnpj);
  const emailNormalizado = email.toLowerCase();

  const fornecedorComMesmoCnpj = await buscarFornecedorPorCnpj(
    cnpjFormatado
  );

  if (
    fornecedorComMesmoCnpj &&
    fornecedorComMesmoCnpj.for_id !== id
  ) {
    return {
      sucesso: false,
      mensagem: "Já existe outro fornecedor cadastrado com este CNPJ.",
    };
  }

  const fornecedorComMesmoEmail = await buscarFornecedorPorEmail(
    emailNormalizado
  );

  if (
    fornecedorComMesmoEmail &&
    fornecedorComMesmoEmail.for_id !== id
  ) {
    return {
      sucesso: false,
      mensagem: "Já existe outro fornecedor cadastrado com este e-mail.",
    };
  }

  await atualizarFornecedorRepository(id, {
    razaoSocial,
    nomeFantasia: nomeFantasia || null,
    cnpj: cnpjFormatado,
    email: emailNormalizado,
    telefonePrincipal,
    telefoneSecundario: telefoneSecundario || null,
    cep: cep || null,
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
}
