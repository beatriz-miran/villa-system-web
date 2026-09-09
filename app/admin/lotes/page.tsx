import Link from "next/link";

import { listarLotes } from "@/application/lotes/listar-lotes";
import { statusLoteLabel } from "@/application/lotes/status-lote";

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(data);
}

export default async function LotesPage() {
  const lotes = await listarLotes();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#1B3B32]">
            Administração
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Lotes
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Consulte e gerencie os lotes de aves cadastrados.
          </p>
        </div>

        <Link
          href="/admin/lotes/novo"
          className="w-full rounded-md bg-[#1B3B32] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#142d26] sm:w-auto"
        >
          Novo lote
        </Link>
      </div>

      <section className="mt-6">
        {lotes.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-700">
              Nenhum lote cadastrado.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {lotes.map((lote) => (
                <Link
                  key={lote.lta_id}
                  href={`/admin/lotes/${lote.lta_id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-gray-900">
                        {lote.lta_codigo_qr_code}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {lote.linhagem.lin_nome} · {lote.galpao.gal_nome}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        lote.lta_status === "ATIVO"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLoteLabel[lote.lta_status]}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-sm text-gray-500">
                    <span>
                      {lote.lta_quant_inicial.toLocaleString("pt-BR")}{" "}
                      aves
                    </span>

                    <span>
                      {formatarData(lote.lta_data_alojamento)}
                    </span>
                  </div>
                </Link>
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
                        Fornecedor
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Quantidade
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Alojamento
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {lotes.map((lote) => (
                      <tr key={lote.lta_id}>
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                          {lote.lta_codigo_qr_code}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {lote.linhagem.lin_nome}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {lote.galpao.gal_nome}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {lote.fornecedor.for_razao_social}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {lote.lta_quant_inicial.toLocaleString(
                            "pt-BR"
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {formatarData(lote.lta_data_alojamento)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              lote.lta_status === "ATIVO"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {statusLoteLabel[lote.lta_status]}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-4">
                            <Link
                              href={`/admin/lotes/${lote.lta_id}`}
                              className="text-sm font-medium text-[#1B3B32] transition hover:underline"
                            >
                              Detalhes
                            </Link>

                            <Link
                              href={`/admin/lotes/${lote.lta_id}/editar`}
                              className="text-sm font-medium text-[#1B3B32] transition hover:underline"
                            >
                              Editar
                            </Link>
                          </div>
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
