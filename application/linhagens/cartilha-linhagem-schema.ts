import { z } from "zod";

export const sistemasCartilhaValores = [
  "CAGE_FREE",
  "CONVENCIONAL",
  "FREE_RANGE",
  "GERAL",
  "SISTEMAS_ALTERNATIVOS",
] as const;

export type SistemaCartilha =
  (typeof sistemasCartilhaValores)[number];

export const sistemaCartilhaLabel: Record<
  SistemaCartilha,
  string
> = {
  CAGE_FREE: "Cage-free",
  CONVENCIONAL: "Convencional em gaiolas",
  FREE_RANGE: "Free-range / caipira",
  GERAL: "Geral",
  SISTEMAS_ALTERNATIVOS: "Sistemas alternativos",
};

function urlHttpsValida(valor: string) {
  try {
    return new URL(valor).protocol === "https:";
  } catch {
    return false;
  }
}

export const cartilhaLinhagemSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(2, "Informe o título da cartilha.")
    .max(
      150,
      "O título da cartilha deve possuir no máximo 150 caracteres."
    ),

  fonte: z
    .string()
    .trim()
    .min(2, "Informe a fonte ou fabricante da cartilha.")
    .max(
      150,
      "A fonte da cartilha deve possuir no máximo 150 caracteres."
    ),

  sistema: z.enum(sistemasCartilhaValores, {
    error: "Selecione um sistema de criação válido.",
  }),

  edicao: z
    .string()
    .trim()
    .max(
      100,
      "A edição da cartilha deve possuir no máximo 100 caracteres."
    )
    .optional(),

  url: z
    .string()
    .trim()
    .min(1, "Informe a URL oficial da cartilha.")
    .max(
      2048,
      "A URL da cartilha deve possuir no máximo 2048 caracteres."
    )
    .refine(
      urlHttpsValida,
      "Informe uma URL HTTPS válida para a cartilha."
    ),
});

export const cartilhasLinhagemSchema = z
  .array(cartilhaLinhagemSchema)
  .max(20, "Uma linhagem pode possuir no máximo 20 cartilhas.");

export type CartilhaLinhagemInput = z.infer<
  typeof cartilhaLinhagemSchema
>;

export function existemUrlsCartilhasDuplicadas(
  cartilhas: CartilhaLinhagemInput[]
) {
  const urls = cartilhas.map((cartilha) =>
    cartilha.url.trim()
  );

  return new Set(urls).size !== urls.length;
}