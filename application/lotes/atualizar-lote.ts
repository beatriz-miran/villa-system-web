import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import {
  existeLoteAtivoNoGalpao,
  buscarGalpaoPorId,
} from "@/infrastructure/repositories/galpao-repository";
import { buscarFornecedorPorId } from "@/infrastructure/repositories/fornecedor-repository";
import { buscarLinhagemPorId } from "@/infrastructure/repositories/linhagem-repository";
import {
  atualizarLote as atualizarLoteRepository,
  buscarLotePorId,
} from "@/infrastructure/repositories/lote-repository";

import { calcularCapacidadeMaximaAves } from "./capacidade-galpao";
import { dataAlojamentoEhFutura } from "./validar-data-alojamento";

const atualizarLoteSchema = z.object({
  id: z.number().int().positive("Lote inválido."),

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
});

export type AtualizarLoteInput = z.infer<typeof atualizarLoteSchema>;

export type AtualizarLoteResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

export async function atualizarLote(
  dados: AtualizarLoteInput
): Promise<AtualizarLoteResultado> {
  const validacao = atualizarLoteSchema.safeParse(dados);

  if (!validacao.success) {
    return {
      sucesso: false,
      mensagem:
        validacao.error.issues[0]?.message ??
        "Verifique os dados informados.",
    };
  }

  const {
    id,
    linhagemId,
    galpaoId,
    fornecedorId,
    quantidadeInicial,
    dataAlojamento,
  } = validacao.data;

  if (dataAlojamentoEhFutura(dataAlojamento)) {
    return {
      sucesso: false,
      mensagem: "A data de alojamento não pode ser uma data futura.",
    };
  }

  try {
    const [loteAtual, linhagem, galpao, fornecedor] = await Promise.all([
      buscarLotePorId(id),
      buscarLinhagemPorId(linhagemId),
      buscarGalpaoPorId(galpaoId),
      buscarFornecedorPorId(fornecedorId),
    ]);

    if (!loteAtual) {
      return {
        sucesso: false,
        mensagem: "Lote não encontrado.",
      };
    }

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

    const temOutroLoteAtivo = await existeLoteAtivoNoGalpao(
      galpaoId,
      id
    );

    if (temOutroLoteAtivo) {
      return {
        sucesso: false,
        mensagem:
          "Este galpão já possui outro lote ativo. Encerre o lote atual antes de vincular um novo.",
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

    await atualizarLoteRepository(id, {
      linhagemId,
      galpaoId,
      fornecedorId,
      quantidadeInicial,
      dataAlojamento,
    });

    return {
      sucesso: true,
    };
  } catch (error) {
    if (erroPrismaTemCodigo(error, "P2025")) {
      return {
        sucesso: false,
        mensagem:
          "O lote, a linhagem, o galpão ou o fornecedor selecionado não existe mais.",
      };
    }

    console.error("Erro ao atualizar lote:", error);

    return {
      sucesso: false,
      mensagem: "Não foi possível atualizar o lote. Tente novamente.",
    };
  }
}
