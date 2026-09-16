export const tipoBaixaLoteValores = [
  "MORTALIDADE",
  "DESCARTE",
] as const;

export type TipoBaixaLote =
  (typeof tipoBaixaLoteValores)[number];

export const tipoBaixaLoteLabel: Record<
  TipoBaixaLote,
  string
> = {
  MORTALIDADE: "Mortalidade",
  DESCARTE: "Descarte",
};

export const tipoBaixaLoteDescricao: Record<
  TipoBaixaLote,
  string
> = {
  MORTALIDADE:
    "Utilize quando a baixa ocorrer pela morte de uma ou mais aves.",
  DESCARTE:
    "Utilize quando aves forem retiradas do lote por decisão sanitária, produtiva ou de manejo.",
};