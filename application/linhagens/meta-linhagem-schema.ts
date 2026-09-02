import { z } from "zod";

export const metaLinhagemSchema = z.object({
  semana: z
    .number({ error: "Informe a semana da meta." })
    .int("A semana deve ser um número inteiro.")
    .positive("A semana deve ser maior que zero."),

  pesoMetaGramas: z
    .number()
    .positive("A meta de peso deve ser maior que zero.")
    .nullable(),

  consumoMetaGramas: z
    .number()
    .positive("A meta de consumo deve ser maior que zero.")
    .nullable(),

  produtividadeMetaPercentual: z
    .number()
    .min(0, "A meta de produtividade não pode ser negativa.")
    .max(100, "A meta de produtividade não pode ultrapassar 100%.")
    .nullable(),
});

export type MetaLinhagemInput = z.infer<typeof metaLinhagemSchema>;

export function existemSemanasDuplicadas(metas: MetaLinhagemInput[]) {
  const semanas = metas.map((meta) => meta.semana);

  return new Set(semanas).size !== semanas.length;
}
