import { z } from "zod";

import { erroPrismaTemCodigo } from "@/infrastructure/database/identificar-erro-prisma";
import { buscarFornecedorPorId } from "@/infrastructure/repositories/fornecedor-repository";
import {
  buscarGalpaoPorId,
  existeLoteAtivoNoGalpao,
} from "@/infrastructure/repositories/galpao-repository";
import { buscarLinhagemPorId } from "@/infrastructure/repositories/linhagem-repository";
import { executarAtualizacaoLoteComBloqueio } from "@/infrastructure/repositories/lote-repository";

import { calcularCapacidadeMaximaAves } from "./capacidade-galpao";
import { dataAlojamentoEhFutura } from "./validar-data-alojamento";

const atualizarLoteSchema = z.object({
  id: z
    .number()
    .int()
    .positive("Lote inválido."),

  linhagemId: z
    .number({
      error:
        "Selecione uma linhagem válida.",
    })
    .int()
    .positive(
      "Selecione uma linhagem válida.",
    ),

  galpaoId: z
    .number({
      error:
        "Selecione um galpão válido.",
    })
    .int()
    .positive(
      "Selecione um galpão válido.",
    ),

  fornecedorId: z
    .number({
      error:
        "Selecione um fornecedor válido.",
    })
    .int()
    .positive(
      "Selecione um fornecedor válido.",
    ),

  quantidadeInicial: z
    .number({
      error:
        "Informe a quantidade inicial de aves.",
    })
    .int(
      "A quantidade deve ser um número inteiro.",
    )
    .positive(
      "A quantidade inicial deve ser maior que zero.",
    )
    .max(
      500000,
      "A quantidade inicial deve ser de no máximo 500.000 aves.",
    ),

  idadeInicialDias: z
    .number({
      error:
        "Informe a idade inicial das aves em dias.",
    })
    .int(
      "A idade inicial deve ser um número inteiro.",
    )
    .positive(
      "A idade inicial deve ser maior que zero.",
    )
    .max(
      3650,
      "A idade inicial deve ser de no máximo 3.650 dias.",
    ),

  dataAlojamento: z.coerce.date({
    error:
      "Informe uma data de alojamento válida.",
  }),
});

export type AtualizarLoteInput = z.infer<
  typeof atualizarLoteSchema
>;

export type AtualizarLoteResultado =
  | {
      sucesso: true;
    }
  | {
      sucesso: false;
      mensagem: string;
    };

const MENSAGEM_GALPAO_OCUPADO =
  "Este galpão já possui outro lote ativo. Encerre o lote atual antes de vincular um novo.";

function inicioDoDiaUtc(data: Date) {
  return Date.UTC(
    data.getUTCFullYear(),
    data.getUTCMonth(),
    data.getUTCDate(),
  );
}

function dataEhPosterior(
  data: Date,
  dataLimite: Date,
) {
  return (
    inicioDoDiaUtc(data) >
    inicioDoDiaUtc(dataLimite)
  );
}

function formatarData(data: Date) {
  return data.toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}

export async function atualizarLote(
  dados: AtualizarLoteInput,
): Promise<AtualizarLoteResultado> {
  const validacao =
    atualizarLoteSchema.safeParse(dados);

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
    idadeInicialDias,
    dataAlojamento,
  } = validacao.data;

  if (
    dataAlojamentoEhFutura(
      dataAlojamento,
    )
  ) {
    return {
      sucesso: false,
      mensagem:
        "A data de alojamento não pode ser uma data futura.",
    };
  }

  try {
    const [linhagem, galpao, fornecedor] =
      await Promise.all([
        buscarLinhagemPorId(linhagemId),
        buscarGalpaoPorId(galpaoId),
        buscarFornecedorPorId(
          fornecedorId,
        ),
      ]);

    if (!linhagem) {
      return {
        sucesso: false,
        mensagem:
          "A linhagem selecionada não existe.",
      };
    }

    if (!galpao) {
      return {
        sucesso: false,
        mensagem:
          "O galpão selecionado não existe.",
      };
    }

    if (!fornecedor) {
      return {
        sucesso: false,
        mensagem:
          "O fornecedor selecionado não existe.",
      };
    }

    const densidadeMaximaAvesM2 =
      linhagem
        .lin_densidade_maxima_aves_m2 ===
      null
        ? null
        : Number(
            linhagem
              .lin_densidade_maxima_aves_m2,
          );

    if (
      densidadeMaximaAvesM2 === null ||
      !Number.isFinite(
        densidadeMaximaAvesM2,
      ) ||
      densidadeMaximaAvesM2 <= 0
    ) {
      return {
        sucesso: false,
        mensagem:
          "A linhagem selecionada não possui densidade máxima cadastrada. Atualize a linhagem antes de editar o lote.",
      };
    }

    const temOutroLoteAtivo =
      await existeLoteAtivoNoGalpao(
        galpaoId,
        id,
      );

    if (temOutroLoteAtivo) {
      return {
        sucesso: false,
        mensagem:
          MENSAGEM_GALPAO_OCUPADO,
      };
    }

    const capacidadeMaxima =
      calcularCapacidadeMaximaAves(
        Number(galpao.gal_area_m2),
        densidadeMaximaAvesM2,
      );

    if (
      quantidadeInicial >
      capacidadeMaxima
    ) {
      return {
        sucesso: false,
        mensagem: `A quantidade informada excede a capacidade máxima de ${capacidadeMaxima} aves para este galpão e esta linhagem.`,
      };
    }

    return await executarAtualizacaoLoteComBloqueio<
      AtualizarLoteResultado
    >(
      id,
      async ({
        buscarLoteParaAtualizacao,
        atualizarLote:
          atualizarLoteRepository,
      }) => {
        const loteAtual =
          await buscarLoteParaAtualizacao();

        if (!loteAtual) {
          return {
            sucesso: false,
            mensagem:
              "Lote não encontrado.",
          };
        }

        if (
          loteAtual.lta_status !== "ATIVO"
        ) {
          return {
            sucesso: false,
            mensagem:
              "Lotes finalizados não podem ser editados.",
          };
        }

        const alterouLinhagem =
          linhagemId !==
          loteAtual.lin_id;

        const alterouGalpao =
          galpaoId !== loteAtual.gal_id;

        const alterouFornecedor =
          fornecedorId !==
          loteAtual.for_id;

        const possuiHistorico =
          loteAtual
            .mortalidade_descarte
            .length > 0;

        if (
          possuiHistorico &&
          (alterouLinhagem ||
            alterouGalpao ||
            alterouFornecedor)
        ) {
          return {
            sucesso: false,
            mensagem:
              "A linhagem, o galpão e o fornecedor não podem ser alterados porque este lote já possui registros de mortalidade ou descarte.",
          };
        }

        if (
          alterouLinhagem &&
          linhagem.lin_status !==
            "ATIVO"
        ) {
          return {
            sucesso: false,
            mensagem:
              "A linhagem selecionada está inativa.",
          };
        }

        if (
          alterouGalpao &&
          galpao.gal_status !== "ATIVO"
        ) {
          return {
            sucesso: false,
            mensagem:
              "O galpão selecionado não está disponível.",
          };
        }

        if (
          alterouFornecedor &&
          fornecedor.for_status !==
            "ATIVO"
        ) {
          return {
            sucesso: false,
            mensagem:
              "O fornecedor selecionado está inativo.",
          };
        }

        const totalBaixasAtivas =
          loteAtual.mortalidade_descarte
            .filter(
              (registro) =>
                registro
                  .mor_status_registro ===
                "ATIVO",
            )
            .reduce(
              (total, registro) =>
                total +
                registro.mor_quantidade,
              0,
            );

        if (
          quantidadeInicial <
          totalBaixasAtivas
        ) {
          return {
            sucesso: false,
            mensagem: `A quantidade inicial não pode ser menor que o total de ${totalBaixasAtivas.toLocaleString(
              "pt-BR",
            )} aves em baixas ativas.`,
          };
        }

        const primeiraBaixa =
          loteAtual.mortalidade_descarte
            .reduce<Date | null>(
              (
                primeiraData,
                registro,
              ) => {
                if (
                  primeiraData === null ||
                  registro.mor_data <
                    primeiraData
                ) {
                  return registro.mor_data;
                }

                return primeiraData;
              },
              null,
            );

        if (
          primeiraBaixa &&
          dataEhPosterior(
            dataAlojamento,
            primeiraBaixa,
          )
        ) {
          return {
            sucesso: false,
            mensagem: `A data de alojamento não pode ser posterior à primeira baixa registrada em ${formatarData(
              primeiraBaixa,
            )}.`,
          };
        }

        await atualizarLoteRepository({
          linhagemId,
          galpaoId,
          fornecedorId,
          quantidadeInicial,
          idadeInicialDias,
          dataAlojamento,
        });

        return {
          sucesso: true,
        };
      },
    );
  } catch (error) {
    if (
      erroPrismaTemCodigo(error, "P2002")
    ) {
      const galpaoPassouAEstarOcupado =
        await existeLoteAtivoNoGalpao(
          galpaoId,
          id,
        );

      if (
        galpaoPassouAEstarOcupado
      ) {
        return {
          sucesso: false,
          mensagem:
            MENSAGEM_GALPAO_OCUPADO,
        };
      }
    }

    if (
      erroPrismaTemCodigo(error, "P2003") ||
      erroPrismaTemCodigo(error, "P2025")
    ) {
      return {
        sucesso: false,
        mensagem:
          "O lote, a linhagem, o galpão ou o fornecedor selecionado não existe mais.",
      };
    }

    console.error(
      "Erro ao atualizar lote:",
      error,
    );

    return {
      sucesso: false,
      mensagem:
        "Não foi possível atualizar o lote. Tente novamente.",
    };
  }
}
