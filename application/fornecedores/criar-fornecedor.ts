import { z } from "zod";

import {
  buscarFornecedorPorCnpj,
  buscarFornecedorPorEmail,
  criarFornecedor as criarFornecedorRepository,
} from "@/infrastructure/repositories/fornecedor-repository";

import { cnpjValido, formatarCnpj } from "./cnpj";

const criarFornecedorSchema = z.object({
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

export type CriarFornecedorInput = z.infer<typeof criarFornecedorSchema>;

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
  const validacao = criarFornecedorSchema.safeParse(dados);

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

  const fornecedorComMesmoCnpj = await buscarFornecedorPorCnpj(
    cnpjFormatado
  );

  if (fornecedorComMesmoCnpj) {
    return {
      sucesso: false,
      mensagem: "Já existe um fornecedor cadastrado com este CNPJ.",
    };
  }

  const fornecedorComMesmoEmail = await buscarFornecedorPorEmail(
    emailNormalizado
  );

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
