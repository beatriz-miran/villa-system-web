import type {
  categoria_insumo_cti_tipo,
  insumo_ins_fase_aplicacao,
  insumo_ins_unidade_medida,
} from "@/generated/prisma/client";

export const VALORES_FASE_APLICACAO_INSUMO = [
  "CRIA",
  "RECRIA",
  "PRE_POSTURA",
  "POSTURA",
  "VAZIO_SANITARIO",
  "USO_GERAL",
] as const satisfies readonly insumo_ins_fase_aplicacao[];

export const VALORES_UNIDADE_MEDIDA_INSUMO = [
  "KG",
  "G",
  "L",
  "ML",
  "UNIDADE",
  "DOSE",
] as const satisfies readonly insumo_ins_unidade_medida[];

export const VALORES_TIPO_CATEGORIA_INSUMO = [
  "RACAO",
  "MEDICAMENTO",
  "VACINA",
  "EMBALAGEM",
  "OUTROS",
] as const satisfies readonly categoria_insumo_cti_tipo[];

export const TIPOS_CATEGORIA_INSUMO: {
  valor: categoria_insumo_cti_tipo;
  rotulo: string;
}[] = [
  { valor: "RACAO", rotulo: "Ração" },
  { valor: "MEDICAMENTO", rotulo: "Medicamento" },
  { valor: "VACINA", rotulo: "Vacina" },
  { valor: "EMBALAGEM", rotulo: "Embalagem" },
  { valor: "OUTROS", rotulo: "Outros" },
];

export const FASES_APLICACAO_INSUMO: {
  valor: insumo_ins_fase_aplicacao;
  rotulo: string;
}[] = [
  { valor: "CRIA", rotulo: "Cria" },
  { valor: "RECRIA", rotulo: "Recria" },
  { valor: "PRE_POSTURA", rotulo: "Pré-postura" },
  { valor: "POSTURA", rotulo: "Postura" },
  { valor: "VAZIO_SANITARIO", rotulo: "Vazio sanitário" },
  { valor: "USO_GERAL", rotulo: "Uso geral" },
];

export const UNIDADES_MEDIDA_INSUMO: {
  valor: insumo_ins_unidade_medida;
  rotulo: string;
}[] = [
  { valor: "KG", rotulo: "Quilograma (kg)" },
  { valor: "G", rotulo: "Grama (g)" },
  { valor: "L", rotulo: "Litro (L)" },
  { valor: "ML", rotulo: "Mililitro (mL)" },
  { valor: "UNIDADE", rotulo: "Unidade" },
  { valor: "DOSE", rotulo: "Dose" },
];

const rotulosFaseAplicacao = new Map(
  FASES_APLICACAO_INSUMO.map((fase) => [fase.valor, fase.rotulo])
);

const rotulosUnidadeMedida = new Map(
  UNIDADES_MEDIDA_INSUMO.map((unidade) => [unidade.valor, unidade.rotulo])
);

const rotulosTipoCategoria = new Map(
  TIPOS_CATEGORIA_INSUMO.map((tipo) => [tipo.valor, tipo.rotulo])
);

export function rotuloFaseAplicacao(valor: insumo_ins_fase_aplicacao) {
  return rotulosFaseAplicacao.get(valor) ?? valor;
}

export function rotuloUnidadeMedida(valor: insumo_ins_unidade_medida) {
  return rotulosUnidadeMedida.get(valor) ?? valor;
}

export function rotuloTipoCategoriaInsumo(valor: categoria_insumo_cti_tipo) {
  return rotulosTipoCategoria.get(valor) ?? valor;
}
