import Link from "next/link";

import { listarCategoriasInsumo } from "@/application/insumos/listar-categorias-insumo";
import { rotuloTipoCategoriaInsumo } from "@/application/insumos/insumo-opcoes";

export default async function CategoriasInsumoPage() {
  const categorias = await listarCategoriasInsumo();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#1B3B32]">
            <Link href="/admin/insumos" className="hover:underline">
              Estoque de Insumos
            </Link>{" "}
            / Categorias
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Categorias de insumo
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Consulte e gerencie as categorias usadas no catálogo de
            insumos.
          </p>
        </div>

        <Link
          href="/admin/insumos/categorias/novo"
          className="w-full rounded-md bg-[#1B3B32] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#142d26] sm:w-auto"
        >
          Nova categoria
        </Link>
      </div>

      <section className="mt-6">
        {categorias.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-700">
              Nenhuma categoria cadastrada.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {categorias.map((categoria) => (
                <article
                  key={categoria.cti_id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-gray-900">
                        {categoria.cti_descricao}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {rotuloTipoCategoriaInsumo(categoria.cti_tipo)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4">
                    <Link
                      href={`/admin/insumos/categorias/${categoria.cti_id}/editar`}
                      className="text-sm font-medium text-[#1B3B32] transition hover:underline"
                    >
                      Editar
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
                        Descrição
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Tipo
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {categorias.map((categoria) => (
                      <tr key={categoria.cti_id}>
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                          {categoria.cti_descricao}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {rotuloTipoCategoriaInsumo(categoria.cti_tipo)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-4">
                            <Link
                              href={`/admin/insumos/categorias/${categoria.cti_id}/editar`}
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
