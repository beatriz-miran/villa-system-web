import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { buscarLoteDetalhado } from "@/application/lotes/buscar-lote-detalhado";
import { calcularQuantidadeAtual } from "@/application/lotes/calcular-situacao-lote";
import { listarProducaoLote } from "@/application/producao-ovos/listar-producao-lote";
import EstornarProducaoLoteForm from "@/app/operador/producao/components/EstornarProducaoLoteForm";
import RegistrarProducaoLoteForm from "@/app/operador/producao/components/RegistrarProducaoLoteForm";
import { auth } from "@/auth";

type ProducaoLotePageProps = {
  params: Promise<{
    loteId: string;
  }>;
};

const tipoMovimentoOvoLabel: Record<
  "COLETA" | "VENDA" | "PERDA" | "DESCARTE",
  string
> = {
  COLETA: "Comercial",
  VENDA: "Venda",
  PERDA: "Perda",
  DESCARTE: "Descarte",
};

function formatarDataCalendario(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
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

export default async function ProducaoLotePage({
  params,
}: ProducaoLotePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.perfil !== "OPERADOR") {
    redirect("/admin");
  }

  const { loteId: loteIdParam } = await params;
  const loteId = Number(loteIdParam);

  if (
    !Number.isInteger(loteId) ||
    loteId <= 0
  ) {
    notFound();
  }

  const [lote, producao] = await Promise.all([
    buscarLoteDetalhado(loteId),
    listarProducaoLote(loteId),
  ]);

  if (!lote || lote.lta_status !== "ATIVO") {
    notFound();
  }

  const totalBaixas =
    lote.mortalidade_descarte.reduce(
      (total, registro) =>
        total + registro.mor_quantidade,
      0,
    );

  const quantidadeAtual = calcularQuantidadeAtual(
    lote.lta_quant_inicial,
    totalBaixas,
  );

  const dataMinima = formatarDataParaInput(
    lote.lta_data_alojamento,
    "UTC",
  );

  const dataMaxima = formatarDataParaInput(
    new Date(),
    "America/Sao_Paulo",
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/operador/producao"
            className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100"
            aria-label="Voltar"
          >
            <ChevronRight
              className="h-5 w-5 rotate-180"
              aria-hidden="true"
            />
          </Link>

          <div>
            <p className="text-xs text-gray-500">
              Produção
            </p>

            <h1 className="text-lg font-bold text-gray-900">
              Lote {lote.lta_codigo_qr_code}
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-6">
        <RegistrarProducaoLoteForm
          loteId={lote.lta_id}
          quantidadeDisponivel={quantidadeAtual}
          dataMinima={dataMinima}
          dataMaxima={dataMaxima}
        />

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-4">
            <h2 className="text-base font-bold text-gray-900">
              Histórico de produção
            </h2>
          </div>

          {producao.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500">
                Nenhuma produção registrada ainda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {producao.map((movimento) => (
                <article
                  key={movimento.mvo_id}
                  className={`p-4 ${
                    movimento.mvo_status_registro ===
                    "ESTORNADO"
                      ? "bg-gray-50/70"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {
                          tipoMovimentoOvoLabel[
                            movimento
                              .mvo_tipo_movimento
                          ]
                        }{" "}
                        ·{" "}
                        {movimento.mvo_quantidade.toLocaleString(
                          "pt-BR",
                        )}{" "}
                        ovos
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatarDataCalendario(
                          movimento.mvo_data_movimento,
                        )}{" "}
                        · por{" "}
                        {
                          movimento
                            .usuario_movimento_ovo_usu_idTousuario
                            .usu_nome
                        }
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        {formatarDataHora(
                          movimento.created_at,
                        )}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        movimento.mvo_status_registro ===
                        "ATIVO"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {movimento.mvo_status_registro ===
                      "ATIVO"
                        ? "Válido"
                        : "Estornado"}
                    </span>
                  </div>

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

                      {movimento.mvo_motivo_estorno ? (
                        <p>
                          {
                            movimento.mvo_motivo_estorno
                          }
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {movimento.mvo_status_registro ===
                  "ATIVO" ? (
                    <div className="mt-3 flex justify-end">
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
          )}
        </section>
      </main>
    </div>
  );
}
