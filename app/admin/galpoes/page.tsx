import Link from "next/link";

import { listarGalpoes } from "@/application/galpoes/listar-galpoes";
import { statusGalpaoLabel } from "@/application/galpoes/status-galpao";
import AlterarStatusGalpaoForm from "@/app/admin/galpoes/components/AlterarStatusGalpaoForm";

const statusPillClassName: Record<string, string> = {
  ATIVO: "bg-green-50 text-green-700",
  VAZIO_SANITARIO: "bg-blue-50 text-blue-700",
  MANUTENCAO: "bg-amber-50 text-amber-700",
  DESATIVADO: "bg-gray-100 text-gray-600",
};

export default async function GalpoesPage() {
  const galpoes = await listarGalpoes();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#1B3B32]">
            Administração
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Galpões
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Consulte e gerencie os galpões cadastrados para alojamento de
            aves.
          </p>
        </div>

        <Link
          href="/admin/galpoes/novo"
          className="w-full rounded-md bg-[#1B3B32] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#142d26] sm:w-auto"
        >
          Novo galpão
        </Link>
      </div>

      <section className="mt-6">
        {galpoes.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-700">
              Nenhum galpão cadastrado.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {galpoes.map((galpao) => (
                <article
                  key={galpao.gal_id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-gray-900">
                        {galpao.gal_nome}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {Number(galpao.gal_area_m2).toLocaleString(
                          "pt-BR",
                          { minimumFractionDigits: 2 }
                        )}{" "}
                        m²
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusPillClassName[galpao.gal_status ?? "ATIVO"]
                      }`}
                    >
                      {statusGalpaoLabel[galpao.gal_status ?? "ATIVO"]}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                    <Link
                      href={`/admin/galpoes/${galpao.gal_id}/editar`}
                      className="text-sm font-medium text-[#1B3B32] transition hover:underline"
                    >
                      Editar
                    </Link>

                    <AlterarStatusGalpaoForm
                      galpaoId={galpao.gal_id}
                      status={galpao.gal_status ?? "ATIVO"}
                    />
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
                        Nome
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Área (m²)
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
                    {galpoes.map((galpao) => (
                      <tr key={galpao.gal_id}>
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                          {galpao.gal_nome}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {Number(galpao.gal_area_m2).toLocaleString(
                            "pt-BR",
                            { minimumFractionDigits: 2 }
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              statusPillClassName[
                                galpao.gal_status ?? "ATIVO"
                              ]
                            }`}
                          >
                            {statusGalpaoLabel[galpao.gal_status ?? "ATIVO"]}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-4">
                            <Link
                              href={`/admin/galpoes/${galpao.gal_id}/editar`}
                              className="text-sm font-medium text-[#1B3B32] transition hover:underline"
                            >
                              Editar
                            </Link>

                            <AlterarStatusGalpaoForm
                              galpaoId={galpao.gal_id}
                              status={galpao.gal_status ?? "ATIVO"}
                            />
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
