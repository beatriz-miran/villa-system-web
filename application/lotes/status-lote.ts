export const statusLoteValores = ["ATIVO", "FINALIZADO"] as const;

export type StatusLote = (typeof statusLoteValores)[number];

export const statusLoteLabel: Record<StatusLote, string> = {
  ATIVO: "Ativo",
  FINALIZADO: "Finalizado",
};

export const faseLoteValores = [
  "CRIA",
  "RECRIA",
  "PRE_POSTURA",
  "POSTURA",
] as const;

export type FaseLote = (typeof faseLoteValores)[number];

export const faseLoteLabel: Record<FaseLote, string> = {
  CRIA: "Cria",
  RECRIA: "Recria",
  PRE_POSTURA: "Pré-postura",
  POSTURA: "Postura",
};
