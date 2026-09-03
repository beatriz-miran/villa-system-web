export const statusGalpaoValores = [
  "ATIVO",
  "VAZIO_SANITARIO",
  "MANUTENCAO",
  "DESATIVADO",
] as const;

export type StatusGalpao = (typeof statusGalpaoValores)[number];

export const statusGalpaoLabel: Record<StatusGalpao, string> = {
  ATIVO: "Ativo",
  VAZIO_SANITARIO: "Vazio Sanitário",
  MANUTENCAO: "Manutenção",
  DESATIVADO: "Desativado",
};
