import Link from "next/link";

import { calcularQuantidadeAtual } from "@/application/lotes/calcular-situacao-lote";
import { listarLotesAtivosComSaldo } from "@/infrastructure/repositories/lote-repository";

export default async function ProducaoPage() {
  const lotes = await listarLotesAtivosComSaldo();

  const lotesComSaldo = lotes.map((lote) => {
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
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div>
        <p className="text-sm font-medium text-[#1B3B32]">
          Administração
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Produção de Ovos
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Selecione um lote ativo para registrar a produção diária.
        </p>
      </div>

      <section className="mt-6">
        {lotesComSaldo.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-700">
              Nenhum lote ativo disponível.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Cadastre ou ative um lote para registrar produção.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {lotesComSaldo.map((lote) => (
                <article
                  key={lote.lta_id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="min-w-0">
                    <h2 className="truncate font-bold text-gray-900">
                      {lote.lta_codigo_qr_code}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {lote.linhagem.lin_nome} ·{" "}
                      {lote.galpao.gal_nome}
                    </p>
                  </div>

                  <div className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-500">
                    {lote.quantidadeAtual.toLocaleString(
                      "pt-BR",
                    )}{" "}
                    aves disponíveis
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <Link
                      href={`/admin/lotes/${lote.lta_id}`}
                      className="block rounded-md bg-[#1B3B32] px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-[#142d26]"
                    >
                      Registrar produção
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Tablet e desktop */}
            <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Código
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Linhagem
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Galpão
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Aves disponíveis
                      </th>

                      <th className="w-48 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {lotesComSaldo.map((lote) => (
                      <tr key={lote.lta_id}>
                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                          {lote.lta_codigo_qr_code}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                          {lote.linhagem.lin_nome}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                          {lote.galpao.gal_nome}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                          {lote.quantidadeAtual.toLocaleString(
                            "pt-BR",
                          )}
                        </td>

                        <td className="w-48 px-5 py-4 text-center">
                          <Link
                            href={`/admin/lotes/${lote.lta_id}`}
                            className="inline-block rounded-md bg-[#1B3B32] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#142d26]"
                          >
                            Registrar produção
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
