import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buscarLoteDetalhado } from "@/application/lotes/buscar-lote-detalhado";
import { calcularCapacidadeMaximaAves } from "@/application/lotes/capacidade-galpao";
import {
  calcularFaseAtual,
  calcularIdadeAtualDias,
  calcularPercentualOcupacao,
  calcularQuantidadeAtual,
  calcularSemanaAtual,
} from "@/application/lotes/calcular-situacao-lote";
import { listarBaixasLote } from "@/application/lotes/listar-baixas-lote";
import {
  faseLoteLabel,
  statusLoteLabel,
} from "@/application/lotes/status-lote";
import {
  tipoBaixaLoteLabel,
  type TipoBaixaLote,
} from "@/application/lotes/tipo-baixa-lote";
import { listarProducaoLote } from "@/application/producao-ovos/listar-producao-lote";
import EstornarBaixaLoteForm from "@/app/admin/lotes/components/EstornarBaixaLoteForm";
import EstornarProducaoLoteForm from "@/app/admin/lotes/components/EstornarProducaoLoteForm";
import FinalizarLoteForm from "@/app/admin/lotes/components/FinalizarLoteForm";
import RegistrarBaixaLoteForm from "@/app/admin/lotes/components/RegistrarBaixaLoteForm";
import RegistrarProducaoLoteForm from "@/app/admin/lotes/components/RegistrarProducaoLoteForm";

type LotePageProps = {
  params: Promise<{
    id: string;
  }>;
};

type CampoInformacaoProps = {
  rotulo: string;
  valor: ReactNode;
  observacao?: ReactNode;
  destaque?: boolean;
  alerta?: boolean;
};

function formatarDataCalendario(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(data);
}

function formatarDataCadastro(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

function formatarDataHora(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

function formatarDataParaInput(
  data: Date,
  timeZone: string,
) {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(data);

  const ano =
    partes.find((parte) => parte.type === "year")
      ?.value ?? "";

  const mes =
    partes.find((parte) => parte.type === "month")
      ?.value ?? "";

  const dia =
    partes.find((parte) => parte.type === "day")
      ?.value ?? "";

  return `${ano}-${mes}-${dia}`;
}

function formatarDias(quantidade: number) {
  return `${quantidade.toLocaleString("pt-BR")} ${
    quantidade === 1 ? "dia" : "dias"
  }`;
}

function formatarAves(quantidade: number) {
  return `${quantidade.toLocaleString("pt-BR")} ${
    quantidade === 1 ? "ave" : "aves"
  }`;
}

function formatarOvos(quantidade: number) {
  return `${quantidade.toLocaleString("pt-BR")} ovos`;
}

function formatarDecimal(valor: number) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatarPercentual(valor: number) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function CampoInformacao({
  rotulo,
  valor,
  observacao,
  destaque = false,
  alerta = false,
}: CampoInformacaoProps) {
  const cores = alerta
    ? "border-red-200 bg-red-50"
    : destaque
      ? "border-emerald-100 bg-emerald-50/60"
      : "border-gray-100 bg-gray-50";

  return (
    <div className={`rounded-lg border p-4 ${cores}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {rotulo}
      </p>

      <p className="mt-1 break-words text-base font-semibold text-gray-900">
        {valor}
      </p>

      {observacao ? (
        <p className="mt-1 text-xs text-gray-500">
          {observacao}
        </p>
      ) : null}
    </div>
  );
}

function TipoBaixaBadge({
  tipo,
}: {
  tipo: TipoBaixaLote;
}) {
  const cores =
    tipo === "MORTALIDADE"
      ? "bg-red-50 text-red-700"
      : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${cores}`}
    >
      {tipoBaixaLoteLabel[tipo]}
    </span>
  );
}

function StatusBaixaBadge({
  status,
}: {
  status: "ATIVO" | "ESTORNADO";
}) {
  const registroValido = status === "ATIVO";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        registroValido
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {registroValido ? "Válido" : "Estornado"}
    </span>
  );
}

const tipoMovimentoOvoLabel: Record<
  "COLETA" | "VENDA" | "PERDA" | "DESCARTE",
  string
> = {
  COLETA: "Comercial",
  VENDA: "Venda",
  PERDA: "Perda",
  DESCARTE: "Descarte",
};

function TipoMovimentoOvoBadge({
  tipo,
}: {
  tipo: "COLETA" | "VENDA" | "PERDA" | "DESCARTE";
}) {
  const cores =
    tipo === "PERDA"
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${cores}`}
    >
      {tipoMovimentoOvoLabel[tipo]}
    </span>
  );
}

export default async function LotePage({
  params,
}: LotePageProps) {
  const { id } = await params;
  const loteId = Number(id);

  if (
    !Number.isInteger(loteId) ||
    loteId <= 0
  ) {
    notFound();
  }

  const [lote, baixas, producao] = await Promise.all([
    buscarLoteDetalhado(loteId),
    listarBaixasLote(loteId),
    listarProducaoLote(loteId),
  ]);

  if (!lote) {
    notFound();
  }

  const dataReferencia =
    lote.lta_status === "FINALIZADO" &&
    lote.lta_data_encerramento
      ? lote.lta_data_encerramento
      : new Date();

  const idadeAtualDias = calcularIdadeAtualDias({
    idadeInicialDias: lote.lta_idade_inicial,
    dataAlojamento: lote.lta_data_alojamento,
    dataReferencia,
  });

  const semanaAtual =
    calcularSemanaAtual(idadeAtualDias);

  const faseAtual =
    calcularFaseAtual(idadeAtualDias);

  const totalBaixas =
    lote.mortalidade_descarte.reduce(
      (total, registro) =>
        total + registro.mor_quantidade,
      0,
    );

  const quantidadeAtual =
    calcularQuantidadeAtual(
      lote.lta_quant_inicial,
      totalBaixas,
    );

  const areaGalpao = Number(
    lote.galpao.gal_area_m2,
  );

  const densidadeMaxima = Number(
    lote.linhagem
      .lin_densidade_maxima_aves_m2 ?? 0,
  );

  const capacidadeMaxima =
    calcularCapacidadeMaximaAves(
      areaGalpao,
      densidadeMaxima,
    );

  const percentualOcupacao =
    capacidadeMaxima > 0
      ? calcularPercentualOcupacao(
          quantidadeAtual,
          capacidadeMaxima,
        )
      : null;

  const ocupacaoAcimaDaCapacidade =
    percentualOcupacao !== null &&
    percentualOcupacao > 100;

  const observacaoBaixas =
    totalBaixas === 0
      ? "Nenhuma baixa registrada"
      : `${formatarAves(
          totalBaixas,
        )} em baixas registradas`;

  const tituloSituacao =
    lote.lta_status === "FINALIZADO"
      ? "Situação no encerramento"
      : "Situação atual";

  const dataMinimaBaixa =
    formatarDataParaInput(
      lote.lta_data_alojamento,
      "UTC",
    );

  const dataMaximaBaixa =
    formatarDataParaInput(
      new Date(),
      "America/Sao_Paulo",
    );

  const ultimaDataBaixaValida =
    baixas.reduce(
      (dataMaisRecente, baixa) => {
        if (
          baixa.mor_status_registro ===
            "ATIVO" &&
          baixa.mor_data.getTime() >
            dataMaisRecente.getTime()
        ) {
          return baixa.mor_data;
        }

        return dataMaisRecente;
      },
      lote.lta_data_alojamento,
    );

  const dataMinimaEncerramento =
    formatarDataParaInput(
      ultimaDataBaixaValida,
      "UTC",
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração / Lotes
            </p>

            <h1 className="mt-1 break-words text-2xl font-bold text-gray-900">
              Lote {lote.lta_codigo_qr_code}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Acompanhamento cadastral e operacional do lote.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/lotes"
              className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Voltar
            </Link>

            {lote.lta_status === "ATIVO" ? (
              <Link
                href={`/admin/lotes/${lote.lta_id}/editar`}
                className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#142d26]"
              >
                Editar lote
              </Link>
            ) : null}
          </div>
        </header>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {tituloSituacao}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Indicadores calculados com os dados registrados.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  lote.lta_status === "ATIVO"
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {statusLoteLabel[lote.lta_status]}
              </span>

              {lote.lta_status === "ATIVO" ? (
                <>
                  <RegistrarProducaoLoteForm
                    loteId={lote.lta_id}
                    quantidadeDisponivel={
                      quantidadeAtual
                    }
                    dataMinima={
                      dataMinimaBaixa
                    }
                    dataMaxima={
                      dataMaximaBaixa
                    }
                  />

                  <RegistrarBaixaLoteForm
                    loteId={lote.lta_id}
                    quantidadeDisponivel={
                      quantidadeAtual
                    }
                    dataMinima={
                      dataMinimaBaixa
                    }
                    dataMaxima={
                      dataMaximaBaixa
                    }
                  />

                  <FinalizarLoteForm
                    loteId={lote.lta_id}
                    quantidadeAtual={
                      quantidadeAtual
                    }
                    dataMinima={
                      dataMinimaEncerramento
                    }
                    dataMaxima={
                      dataMaximaBaixa
                    }
                  />
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <CampoInformacao
              rotulo="Quantidade atual"
              valor={formatarAves(
                quantidadeAtual,
              )}
              observacao={observacaoBaixas}
              destaque
            />

            <CampoInformacao
              rotulo="Idade das aves"
              valor={formatarDias(
                idadeAtualDias,
              )}
              observacao={`${semanaAtual}ª semana de vida`}
              destaque
            />

            <CampoInformacao
              rotulo="Fase atual"
              valor={faseLoteLabel[faseAtual]}
              observacao="Calculada pela idade das aves"
              destaque
            />

            <CampoInformacao
              rotulo="Ocupação do galpão"
              valor={
                percentualOcupacao === null
                  ? "Não calculada"
                  : `${formatarPercentual(
                      percentualOcupacao,
                    )}%`
              }
              observacao={
                capacidadeMaxima > 0
                  ? `Capacidade estimada: ${formatarAves(
                      capacidadeMaxima,
                    )}`
                  : "Densidade máxima da linhagem não informada"
              }
              destaque={
                !ocupacaoAcimaDaCapacidade
              }
              alerta={
                ocupacaoAcimaDaCapacidade
              }
            />
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-gray-900">
            Dados de origem do lote
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <CampoInformacao
              rotulo="Linhagem"
              valor={lote.linhagem.lin_nome}
              observacao={
                densidadeMaxima > 0
                  ? `Densidade máxima: ${formatarDecimal(
                      densidadeMaxima,
                    )} aves/m²`
                  : "Densidade máxima não informada"
              }
            />

            <CampoInformacao
              rotulo="Galpão"
              valor={lote.galpao.gal_nome}
              observacao={`Área útil: ${formatarDecimal(
                areaGalpao,
              )} m²`}
            />

            <CampoInformacao
              rotulo="Fornecedor"
              valor={
                lote.fornecedor
                  .for_nome_fantasia ??
                lote.fornecedor
                  .for_razao_social
              }
              observacao={
                lote.fornecedor
                  .for_nome_fantasia
                  ? lote.fornecedor
                      .for_razao_social
                  : undefined
              }
            />

            <CampoInformacao
              rotulo="Quantidade inicial"
              valor={formatarAves(
                lote.lta_quant_inicial,
              )}
            />

            <CampoInformacao
              rotulo="Idade inicial das aves"
              valor={formatarDias(
                lote.lta_idade_inicial,
              )}
            />

            <CampoInformacao
              rotulo="Data de alojamento"
              valor={formatarDataCalendario(
                lote.lta_data_alojamento,
              )}
            />

            <CampoInformacao
              rotulo="Total de baixas"
              valor={formatarAves(totalBaixas)}
              observacao="Mortalidades e descartes válidos"
            />

            <CampoInformacao
              rotulo="Capacidade estimada"
              valor={
                capacidadeMaxima > 0
                  ? formatarAves(
                      capacidadeMaxima,
                    )
                  : "Não calculada"
              }
              observacao="Área útil × densidade máxima"
            />
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-bold text-gray-900">
              Histórico de mortalidades e descartes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Lançamentos registrados para este lote.
            </p>
          </div>

          {baixas.length === 0 ? (
            <div className="px-5 py-10 text-center sm:px-6">
              <p className="text-sm font-medium text-gray-700">
                Nenhuma baixa registrada.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Os registros de mortalidade e descarte aparecerão aqui.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full table-fixed border-collapse">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="w-[10%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Data
                      </th>

                      <th className="w-[12%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Tipo
                      </th>

                      <th className="w-[10%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Quantidade
                      </th>

                      <th className="w-[25%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Motivo
                      </th>

                      <th className="w-[18%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Registrado por
                      </th>

                      <th className="w-[15%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Situação
                      </th>

                      <th className="w-[10%] px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {baixas.map((baixa) => (
                      <tr
                        key={baixa.mor_id}
                        className={`border-b border-gray-100 last:border-b-0 ${
                          baixa.mor_status_registro ===
                          "ESTORNADO"
                            ? "bg-gray-50/70"
                            : "bg-white"
                        }`}
                      >
                        <td className="px-5 py-4 align-top text-sm text-gray-700">
                          {formatarDataCalendario(
                            baixa.mor_data,
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <TipoBaixaBadge
                            tipo={baixa.mor_tipo}
                          />
                        </td>

                        <td className="px-5 py-4 align-top text-sm font-medium text-gray-900">
                          {formatarAves(
                            baixa.mor_quantidade,
                          )}
                        </td>

                        <td className="break-words px-5 py-4 align-top text-sm text-gray-700">
                          {baixa.mor_motivo}
                        </td>

                        <td className="break-words px-5 py-4 align-top">
                          <p className="text-sm text-gray-700">
                            {
                              baixa
                                .usuario_mortalidade_descarte_usu_idTousuario
                                .usu_nome
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatarDataHora(
                              baixa.created_at,
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <StatusBaixaBadge
                            status={
                              baixa.mor_status_registro
                            }
                          />

                          {baixa.mor_status_registro ===
                            "ESTORNADO" ? (
                            <div className="mt-2 space-y-1 text-xs text-gray-500">
                              {baixa
                                .usuario_mortalidade_descarte_mor_estornado_porTousuario ? (
                                <p>
                                  Por{" "}
                                  {
                                    baixa
                                      .usuario_mortalidade_descarte_mor_estornado_porTousuario
                                      .usu_nome
                                  }
                                </p>
                              ) : null}

                              {baixa.mor_estornado_em ? (
                                <p>
                                  {formatarDataHora(
                                    baixa.mor_estornado_em,
                                  )}
                                </p>
                              ) : null}

                              {baixa.mor_motivo_estorno ? (
                                <p className="break-words">
                                  {
                                    baixa.mor_motivo_estorno
                                  }
                                </p>
                                                            ) : null}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-5 py-4 text-center align-top">
                          {baixa.mor_status_registro ===
                          "ATIVO" ? (
                            <EstornarBaixaLoteForm
                              baixaId={baixa.mor_id}
                              tipo={
                                tipoBaixaLoteLabel[
                                  baixa.mor_tipo
                                ]
                              }
                              quantidade={
                                baixa.mor_quantidade
                              }
                              data={formatarDataCalendario(
                                baixa.mor_data,
                              )}
                            />
                          ) : (
                            <span className="text-sm text-gray-400">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-gray-200 lg:hidden">
                {baixas.map((baixa) => (
                  <article
                    key={baixa.mor_id}
                    className={`p-5 ${
                      baixa.mor_status_registro ===
                      "ESTORNADO"
                        ? "bg-gray-50/70"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <TipoBaixaBadge
                        tipo={baixa.mor_tipo}
                      />

                      <StatusBaixaBadge
                        status={
                          baixa.mor_status_registro
                        }
                      />
                    </div>

                    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Data
                        </dt>

                        <dd className="mt-1 text-sm text-gray-900">
                          {formatarDataCalendario(
                            baixa.mor_data,
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Quantidade
                        </dt>

                        <dd className="mt-1 text-sm font-medium text-gray-900">
                          {formatarAves(
                            baixa.mor_quantidade,
                          )}
                        </dd>
                      </div>

                      <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Motivo
                        </dt>

                        <dd className="mt-1 break-words text-sm text-gray-900">
                          {baixa.mor_motivo}
                        </dd>
                      </div>

                      <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Registrado por
                        </dt>

                        <dd className="mt-1 text-sm text-gray-900">
                          {
                            baixa
                              .usuario_mortalidade_descarte_usu_idTousuario
                              .usu_nome
                          }
                        </dd>

                        <dd className="mt-1 text-xs text-gray-500">
                          {formatarDataHora(
                            baixa.created_at,
                          )}
                        </dd>
                      </div>

                      {baixa.mor_status_registro ===
                      "ESTORNADO" ? (
                        <div className="sm:col-span-2">
                          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Informações do estorno
                          </dt>

                          <dd className="mt-1 space-y-1 text-sm text-gray-700">
                            {baixa
                              .usuario_mortalidade_descarte_mor_estornado_porTousuario ? (
                              <p>
                                Responsável:{" "}
                                {
                                  baixa
                                    .usuario_mortalidade_descarte_mor_estornado_porTousuario
                                    .usu_nome
                                }
                              </p>
                            ) : null}

                            {baixa.mor_estornado_em ? (
                              <p>
                                Data:{" "}
                                {formatarDataHora(
                                  baixa.mor_estornado_em,
                                )}
                              </p>
                            ) : null}

                            {baixa.mor_motivo_estorno ? (
                              <p>
                                Motivo:{" "}
                                {
                                  baixa.mor_motivo_estorno
                                }
                              </p>
                            ) : null}
                                                    </dd>
                        </div>
                      ) : null}
                    </dl>

                    {baixa.mor_status_registro ===
                      "ATIVO" &&
                    lote.lta_status ===
                      "ATIVO" ? (
                      <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
                        <EstornarBaixaLoteForm
                          baixaId={baixa.mor_id}
                          tipo={
                            tipoBaixaLoteLabel[
                              baixa.mor_tipo
                            ]
                          }
                          quantidade={
                            baixa.mor_quantidade
                          }
                          data={formatarDataCalendario(
                            baixa.mor_data,
                          )}
                        />
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-bold text-gray-900">
              Histórico de produção de ovos
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Coletas registradas para este lote.
            </p>
          </div>

          {producao.length === 0 ? (
            <div className="px-5 py-10 text-center sm:px-6">
              <p className="text-sm font-medium text-gray-700">
                Nenhuma produção registrada.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Os registros de coleta de ovos aparecerão aqui.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full table-fixed border-collapse">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="w-[10%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Data
                      </th>

                      <th className="w-[12%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Tipo
                      </th>

                      <th className="w-[10%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Quantidade
                      </th>

                      <th className="w-[23%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Registrado por
                      </th>

                      <th className="w-[15%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Situação
                      </th>

                      <th className="w-[10%] px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {producao.map((movimento) => (
                      <tr
                        key={movimento.mvo_id}
                        className={`border-b border-gray-100 last:border-b-0 ${
                          movimento.mvo_status_registro ===
                          "ESTORNADO"
                            ? "bg-gray-50/70"
                            : "bg-white"
                        }`}
                      >
                        <td className="px-5 py-4 align-top text-sm text-gray-700">
                          {formatarDataCalendario(
                            movimento.mvo_data_movimento,
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <TipoMovimentoOvoBadge
                            tipo={
                              movimento.mvo_tipo_movimento
                            }
                          />
                        </td>

                        <td className="px-5 py-4 align-top text-sm font-medium text-gray-900">
                          {formatarOvos(
                            movimento.mvo_quantidade,
                          )}
                        </td>

                        <td className="break-words px-5 py-4 align-top">
                          <p className="text-sm text-gray-700">
                            {
                              movimento
                                .usuario_movimento_ovo_usu_idTousuario
                                .usu_nome
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatarDataHora(
                              movimento.created_at,
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <StatusBaixaBadge
                            status={
                              movimento.mvo_status_registro
                            }
                          />

                          {movimento.mvo_status_registro ===
                            "ESTORNADO" ? (
                            <div className="mt-2 space-y-1 text-xs text-gray-500">
                              {movimento
                                .usuario_movimento_ovo_mvo_estornado_porTousuario ? (
                                <p>
                                  Por{" "}
                                  {
                                    movimento
                                      .usuario_movimento_ovo_mvo_estornado_porTousuario
                                      .usu_nome
                                  }
                                </p>
                              ) : null}

                              {movimento.mvo_estornado_em ? (
                                <p>
                                  {formatarDataHora(
                                    movimento.mvo_estornado_em,
                                  )}
                                </p>
                              ) : null}

                              {movimento.mvo_motivo_estorno ? (
                                <p className="break-words">
                                  {
                                    movimento.mvo_motivo_estorno
                                  }
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-5 py-4 text-center align-top">
                          {movimento.mvo_status_registro ===
                          "ATIVO" ? (
                            <EstornarProducaoLoteForm
                              movimentoId={
                                movimento.mvo_id
                              }
                              tipo={
                                tipoMovimentoOvoLabel[
                                  movimento
                                    .mvo_tipo_movimento
                                ]
                              }
                              quantidade={
                                movimento.mvo_quantidade
                              }
                              data={formatarDataCalendario(
                                movimento.mvo_data_movimento,
                              )}
                            />
                          ) : (
                            <span className="text-sm text-gray-400">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-gray-200 lg:hidden">
                {producao.map((movimento) => (
                  <article
                    key={movimento.mvo_id}
                    className={`p-5 ${
                      movimento.mvo_status_registro ===
                      "ESTORNADO"
                        ? "bg-gray-50/70"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <TipoMovimentoOvoBadge
                        tipo={
                          movimento.mvo_tipo_movimento
                        }
                      />

                      <StatusBaixaBadge
                        status={
                          movimento.mvo_status_registro
                        }
                      />
                    </div>

                    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Data
                        </dt>

                        <dd className="mt-1 text-sm text-gray-900">
                          {formatarDataCalendario(
                            movimento.mvo_data_movimento,
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Quantidade
                        </dt>

                        <dd className="mt-1 text-sm font-medium text-gray-900">
                          {formatarOvos(
                            movimento.mvo_quantidade,
                          )}
                        </dd>
                      </div>

                      <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Registrado por
                        </dt>

                        <dd className="mt-1 text-sm text-gray-900">
                          {
                            movimento
                              .usuario_movimento_ovo_usu_idTousuario
                              .usu_nome
                          }
                        </dd>

                        <dd className="mt-1 text-xs text-gray-500">
                          {formatarDataHora(
                            movimento.created_at,
                          )}
                        </dd>
                      </div>

                      {movimento.mvo_status_registro ===
                      "ESTORNADO" ? (
                        <div className="sm:col-span-2">
                          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Informações do estorno
                          </dt>

                          <dd className="mt-1 space-y-1 text-sm text-gray-700">
                            {movimento
                              .usuario_movimento_ovo_mvo_estornado_porTousuario ? (
                              <p>
                                Responsável:{" "}
                                {
                                  movimento
                                    .usuario_movimento_ovo_mvo_estornado_porTousuario
                                    .usu_nome
                                }
                              </p>
                            ) : null}

                            {movimento.mvo_estornado_em ? (
                              <p>
                                Data:{" "}
                                {formatarDataHora(
                                  movimento.mvo_estornado_em,
                                )}
                              </p>
                            ) : null}

                            {movimento.mvo_motivo_estorno ? (
                              <p>
                                Motivo:{" "}
                                {
                                  movimento.mvo_motivo_estorno
                                }
                              </p>
                            ) : null}
                          </dd>
                        </div>
                      ) : null}
                    </dl>

                    {movimento.mvo_status_registro ===
                      "ATIVO" &&
                    lote.lta_status === "ATIVO" ? (
                      <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
                        <EstornarProducaoLoteForm
                          movimentoId={
                            movimento.mvo_id
                          }
                          tipo={
                            tipoMovimentoOvoLabel[
                              movimento
                                .mvo_tipo_movimento
                            ]
                          }
                          quantidade={
                            movimento.mvo_quantidade
                          }
                          data={formatarDataCalendario(
                            movimento.mvo_data_movimento,
                          )}
                        />
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-gray-900">
            Histórico do cadastro
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <CampoInformacao
              rotulo="Registrado por"
              valor={lote.usuario.usu_nome}
            />

            <CampoInformacao
              rotulo="Cadastrado em"
              valor={formatarDataCadastro(
                lote.created_at,
              )}
            />

            {lote.lta_data_encerramento ? (
              <CampoInformacao
                rotulo="Encerrado em"
                valor={formatarDataCalendario(
                  lote.lta_data_encerramento,
                )}
              />
            ) : null}

            {lote.lta_motivo_encerramento ? (
              <CampoInformacao
                rotulo="Motivo do encerramento"
                valor={
                  lote.lta_motivo_encerramento
                }
              />
            ) : null}

            {lote.lta_destino_descarte ? (
              <CampoInformacao
                rotulo="Destino das aves"
                valor={
                  lote.lta_destino_descarte
                }
              />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}