export const tipoOcorrenciaSaudeValores = [
  "SINTOMA",
  "DOENCA_SUSPEITA",
  "DOENCA_CONFIRMADA",
  "LESAO",
  "OUTRO",
] as const;

export type TipoOcorrenciaSaude =
  (typeof tipoOcorrenciaSaudeValores)[number];

export const tipoOcorrenciaSaudeLabel: Record<
  TipoOcorrenciaSaude,
  string
> = {
  SINTOMA: "Sintomas observados",
  DOENCA_SUSPEITA: "Suspeita de doença",
  DOENCA_CONFIRMADA: "Doença confirmada",
  LESAO: "Lesão",
  OUTRO: "Outro",
};

export const tipoOcorrenciaSaudeDescricao: Record<
  TipoOcorrenciaSaude,
  string
> = {
  SINTOMA:
    "Alteração física ou comportamental ainda sem diagnóstico definido.",
  DOENCA_SUSPEITA:
    "Condição com suspeita de doença, ainda sem confirmação.",
  DOENCA_CONFIRMADA:
    "Doença confirmada por avaliação técnica ou veterinária.",
  LESAO:
    "Ferimento, trauma ou outra limitação física observada.",
  OUTRO:
    "Outra ocorrência relacionada à saúde das aves.",
};

export const statusOcorrenciaSaudeValores = [
  "EM_OBSERVACAO",
  "EM_QUARENTENA",
  "EM_TRATAMENTO",
  "ENCERRADA",
] as const;

export type StatusOcorrenciaSaude =
  (typeof statusOcorrenciaSaudeValores)[number];

export const statusOcorrenciaSaudeLabel: Record<
  StatusOcorrenciaSaude,
  string
> = {
  EM_OBSERVACAO: "Em observação",
  EM_QUARENTENA: "Em quarentena",
  EM_TRATAMENTO: "Em tratamento",
  ENCERRADA: "Encerrada",
};

export const statusOcorrenciaSaudeDescricao: Record<
  StatusOcorrenciaSaude,
  string
> = {
  EM_OBSERVACAO:
    "As aves estão sendo acompanhadas antes da definição de uma conduta.",
  EM_QUARENTENA:
    "As aves foram separadas preventivamente do restante do lote.",
  EM_TRATAMENTO:
    "As aves estão recebendo tratamento ou manejo sanitário.",
  ENCERRADA:
    "O acompanhamento foi concluído e possui um desfecho registrado.",
};

export const gravidadeOcorrenciaSaudeValores = [
  "BAIXA",
  "MODERADA",
  "ALTA",
  "CRITICA",
] as const;

export type GravidadeOcorrenciaSaude =
  (typeof gravidadeOcorrenciaSaudeValores)[number];

export const gravidadeOcorrenciaSaudeLabel: Record<
  GravidadeOcorrenciaSaude,
  string
> = {
  BAIXA: "Baixa",
  MODERADA: "Moderada",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export const gravidadeOcorrenciaSaudeDescricao: Record<
  GravidadeOcorrenciaSaude,
  string
> = {
  BAIXA:
    "Condição leve, sem risco imediato aparente.",
  MODERADA:
    "Condição que exige acompanhamento frequente.",
  ALTA:
    "Condição grave que exige intervenção rápida.",
  CRITICA:
    "Condição com risco elevado para as aves ou para o lote.",
};

export const desfechoOcorrenciaSaudeValores = [
  "RECUPERACAO",
  "MORTALIDADE",
  "DESCARTE",
  "OUTRO",
] as const;

export type DesfechoOcorrenciaSaude =
  (typeof desfechoOcorrenciaSaudeValores)[number];

export const desfechoOcorrenciaSaudeLabel: Record<
  DesfechoOcorrenciaSaude,
  string
> = {
  RECUPERACAO: "Recuperação",
  MORTALIDADE: "Mortalidade",
  DESCARTE: "Descarte",
  OUTRO: "Outro",
};

export function ocorrenciaSaudeEstaAberta(
  status: StatusOcorrenciaSaude,
) {
  return status !== "ENCERRADA";
}
