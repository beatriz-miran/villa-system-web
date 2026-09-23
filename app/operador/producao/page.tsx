import { ChevronRight, Egg } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { calcularQuantidadeAtual } from "@/application/lotes/calcular-situacao-lote";
import { listarLotesAtivosComSaldo } from "@/infrastructure/repositories/lote-repository";
import { auth } from "@/auth";

export default async function ProducaoSelecionarLotePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.perfil !== "OPERADOR") {
    redirect("/admin");
  }

  const lotes = await listarLotesAtivosComSaldo();

  const lotesComSaldo = lotes
    .map((lote) => {
      const totalBaixas =
        lote.mortalidade_descarte.reduce(
          (total, registro) =>
            total + registro.mor_quantidade,
          0,
        );

      return {
        ...lote,
        quantidadeAtual: calcularQuantidadeAtual(
          lote.lta_quant_inicial,
          totalBaixas,
        ),
      };
    })
    .filter((lote) => lote.quantidadeAtual > 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/operador"
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
              Selecione o lote
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {lotesComSaldo.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-700">
              Nenhum lote disponível para registrar produção.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Os lotes ativos com aves disponíveis aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lotesComSaldo.map((lote) => (
              <Link
                key={lote.lta_id}
                href={`/operador/producao/${lote.lta_id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition active:scale-[0.99] active:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F4B324]/15 text-[#B77C00]">
                    <Egg size={22} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {lote.lta_codigo_qr_code}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {lote.galpao.gal_nome} ·{" "}
                      {lote.linhagem.lin_nome}
                    </p>

                    <p className="mt-1 text-xs font-medium text-[#1B3B32]">
                      {lote.quantidadeAtual.toLocaleString(
                        "pt-BR",
                      )}{" "}
                      aves disponíveis
                    </p>
                  </div>
                </div>

                <ChevronRight
                  className="h-5 w-5 shrink-0 text-gray-400"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
