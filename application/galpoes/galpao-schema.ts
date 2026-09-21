import { z } from "zod";

export const galpaoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do galpão.")
    .max(
      100,
      "O nome do galpão deve possuir no máximo 100 caracteres."
    ),

  areaM2: z
    .number({
      error: "Informe a área do galpão em m².",
    })
    .positive("A área do galpão deve ser maior que zero.")
    .max(
      9999.99,
      "A área do galpão deve ser de no máximo 9999,99 m²."
    ),
});

export type GalpaoDados = z.infer<typeof galpaoSchema>;