import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  existeLoteAtivoNoGalpao,
  buscarGalpaoPorId,
} from "@/infrastructure/repositories/galpao-repository";
import { buscarFornecedorPorId } from "@/infrastructure/repositories/fornecedor-repository";
import { buscarLinhagemPorId } from "@/infrastructure/repositories/linhagem-repository";
import {
  buscarLotePorCodigo,
  criarLote as criarLoteRepository,
} from "@/infrastructure/repositories/lote-repository";

import { calcularCapacidadeMaximaAves } from "./capacidade-galpao";
import { gerarCodigoLote } from "./gerar-codigo-lote";
import { dataAlojamentoEhFutura } from "./validar-data-alojamento";

const TENTATIVAS_MAXIMAS_CODIGO = 5;

const criarLoteSchema = z.object({
  linhagemId: z
    .number({ error: "Selecione uma linhagem válida." })
    .int()
    .positive("Selecione uma linhagem válida."),

  galpaoId: z
    .number({ error: "Selecione um galpão válido." })
    .int()
    .positive("Selecione um galpão válido."),

  fornecedorId: z
    .number({ error: "Selecione um fornecedor válido." })
    .int()
    .positive("Selecione um fornecedor válido."),

  quantidadeInicial: z
    .number({ error: "Informe a quantidade inicial de aves." })
    .int("A quantidade deve ser um número inteiro.")
    .positive("A quantidade inicial deve ser maior que zero.")
    .max(
      500000,
      "A quantidade inicial deve ser de no máximo 500.000 aves."
    ),

  dataAlojamento: z.coerce.date({
    error: "Informe uma data de alojamento válida.",
  }),

  registradoPorId: z.number().int().positive(),
});

export type CriarLoteInput = z.infer<typeof criarLoteSchema>;

export type CriarLoteResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function criarLote(
  dados: CriarLoteInput
): Promise<CriarLoteResultado> {
  const validacao = criarLoteSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const {
    linhagemId,
    galpaoId,
    fornecedorId,
    quantidadeInicial,
    dataAlojamento,
    registradoPorId,
  } = validacao.data;

  if (dataAlojamentoEhFutura(dataAlojamento)) {
    return {
      sucesso: false,
      mensagem: "A data de alojamento não pode ser uma data futura.",
    };
  }

  try {
    const [linhagem, galpao, fornecedor] = await Promise.all([
      buscarLinhagemPorId(linhagemId),
      buscarGalpaoPorId(galpaoId),
      buscarFornecedorPorId(fornecedorId),
    ]);

    if (!linhagem) {
      return {
        sucesso: false,
        mensagem: "A linhagem selecionada não existe.",
      };
    }

    if (linhagem.lin_status !== "ATIVO") {
      return {
        sucesso: false,
        mensagem: "A linhagem selecionada está inativa.",
      };
    }

    if (!galpao) {
      return {
        sucesso: false,
        mensagem: "O galpão selecionado não existe.",
      };
    }

    if (galpao.gal_status !== "ATIVO") {
      return {
        sucesso: false,
        mensagem: "O galpão selecionado não está disponível.",
      };
    }

    if (!fornecedor) {
      return {
        sucesso: false,
        mensagem: "O fornecedor selecionado não existe.",
      };
    }

    if (fornecedor.for_status !== "ATIVO") {
      return {
        sucesso: false,
        mensagem: "O fornecedor selecionado está inativo.",
      };
    }

    const temLoteAtivo = await existeLoteAtivoNoGalpao(galpaoId);

    if (temLoteAtivo) {
      return {
        sucesso: false,
        mensagem:
          "Este galpão já possui um lote ativo. Encerre o lote atual antes de vincular um novo.",
      };
    }

    const capacidadeMaxima = calcularCapacidadeMaximaAves(
      Number(galpao.gal_area_m2)
    );

    if (quantidadeInicial > capacidadeMaxima) {
      return {
        sucesso: false,
        mensagem: `A quantidade informada excede a capacidade máxima do galpão (${capacidadeMaxima} aves).`,
      };
    }

    let codigo: string | null = null;

    for (
      let tentativa = 0;
      tentativa < TENTATIVAS_MAXIMAS_CODIGO;
      tentativa++
    ) {
      const candidato = gerarCodigoLote();
      const loteExistente = await buscarLotePorCodigo(candidato);

      if (!loteExistente) {
        codigo = candidato;
        break;
      }
    }

    if (!codigo) {
      return {
        sucesso: false,
        mensagem:
          "Não foi possível gerar um identificador único para o lote. Tente novamente.",
      };
    }

    await criarLoteRepository({
      codigo,
      linhagemId,
      galpaoId,
      fornecedorId,
      quantidadeInicial,
      dataAlojamento,
      registradoPorId,
    });

    return {
      sucesso: true,
    };
  } catch (error) {
    if (erroPrismaTemCodigo(error, "P2002")) {
      return {
        sucesso: false,
        mensagem:
          "Não foi possível gerar um identificador único para o lote. Tente novamente.",
      };
    }

    if (erroPrismaTemCodigo(error, "P2025")) {
      return {
        sucesso: false,
        mensagem:
          "A linhagem, o galpão ou o fornecedor selecionado não existe mais.",
      };
    }

    console.error("Erro ao cadastrar lote:", error);

    return {
      sucesso: false,
      mensagem: "Não foi possível cadastrar o lote. Tente novamente.",
    };
  }
}
