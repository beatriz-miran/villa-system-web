import { z } from "zod";

const caminhoImagemRegex =
  /^\/linhagens\/[a-z0-9][a-z0-9/_-]*\.(?:avif|jpe?g|png|webp)$/i;

export const imagemLinhagemSchema = z
  .string()
  .trim()
  .max(
    500,
    "O caminho da imagem deve possuir no máximo 500 caracteres."
  )
  .refine(
    (valor) => caminhoImagemRegex.test(valor),
    "Use um caminho local como /linhagens/nome-da-imagem.webp."
  )
  .optional();