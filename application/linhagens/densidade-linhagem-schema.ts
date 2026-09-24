import { z } from "zod";

export const densidadeMaximaLinhagemSchema = z
  .number({
    error: "Informe a densidade máxima da linhagem.",
  })
  .positive("A densidade máxima deve ser maior que zero.")
  .max(
    50,
    "A densidade máxima deve ser de, no máximo, 50 aves por metro quadrado.",
  );