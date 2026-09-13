import { z } from "zod";

import { cepValido } from "@/application/enderecos/cep";
import { ufValida } from "@/application/enderecos/ufs";

import { cnpjValido } from "./cnpj";
import { telefoneValido } from "./telefone";

export const fornecedorSchema = z.object({
  razaoSocial: z
    .string()
    .trim()
    .min(2, "Informe a razão social do fornecedor.")
    .max(200, "A razão social deve possuir no máximo 200 caracteres."),

  nomeFantasia: z
    .string()
    .trim()
    .max(200, "O nome fantasia deve possuir no máximo 200 caracteres.")
    .optional(),

  cnpj: z
    .string()
    .trim()
    .min(1, "Informe o CNPJ do fornecedor.")
    .max(18, "O CNPJ deve possuir no máximo 18 caracteres.")
    .refine(cnpjValido, "Informe um CNPJ válido."),

  email: z
    .string()
    .trim()
    .max(150, "O e-mail deve possuir no máximo 150 caracteres.")
    .email("Informe um e-mail válido."),

  telefonePrincipal: z
    .string()
    .trim()
    .max(20, "O telefone principal deve possuir no máximo 20 caracteres.")
    .refine(
      telefoneValido,
      "Informe um telefone principal com DDD e 10 ou 11 dígitos."
    ),

  telefoneSecundario: z
    .string()
    .trim()
    .max(20, "O telefone secundário deve possuir no máximo 20 caracteres.")
    .refine(
      (telefone) => telefone.length === 0 || telefoneValido(telefone),
      "Informe um telefone secundário com DDD e 10 ou 11 dígitos."
    )
    .optional(),

  cep: z
    .string()
    .trim()
    .max(10, "O CEP deve possuir no máximo 10 caracteres.")
    .refine(
      (cep) => cep.length === 0 || cepValido(cep),
      "Informe um CEP válido com oito dígitos."
    )
    .optional(),

  logradouro: z
    .string()
    .trim()
    .max(200, "O logradouro deve possuir no máximo 200 caracteres.")
    .optional(),

  numero: z
    .string()
    .trim()
    .max(20, "O número deve possuir no máximo 20 caracteres.")
    .optional(),

  bairro: z
    .string()
    .trim()
    .max(100, "O bairro deve possuir no máximo 100 caracteres.")
    .optional(),

  cidade: z
    .string()
    .trim()
    .max(100, "A cidade deve possuir no máximo 100 caracteres.")
    .optional(),

  estado: z
    .string()
    .trim()
    .length(2, "Selecione uma UF válida.")
    .refine(ufValida, "Selecione uma UF válida.")
    .optional(),

  categoriaId: z
    .number({
      error: "Selecione uma categoria de fornecimento válida.",
    })
    .int()
    .positive("Selecione uma categoria de fornecimento válida."),
});

export type FornecedorInput = z.infer<typeof fornecedorSchema>;