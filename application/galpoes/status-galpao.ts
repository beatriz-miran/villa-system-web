export const statusGalpaoValores = [
  "ATIVO",
  "DESATIVADO",
  "MANUTENCAO",
  "VAZIO_SANITARIO",
] as const;

export type StatusGalpao = (typeof statusGalpaoValores)[number];

export const statusGalpaoLabel: Record<StatusGalpao, string> = {
  ATIVO: "Ativo",
  DESATIVADO: "Desativado",
  MANUTENCAO: "Manutenção",
  VAZIO_SANITARIO: "Vazio Sanitário",
};