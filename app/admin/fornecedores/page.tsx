import Link from "next/link";

import { listarFornecedores } from "@/application/fornecedores/listar-fornecedores";
import AlterarStatusFornecedorButton from "@/app/admin/fornecedores/components/AlterarStatusFornecedorButton";

export default async function FornecedoresPage() {
  const fornecedores = await listarFornecedores();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#1B3B32]">
            Administração
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Fornecedores
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Consulte e gerencie os fornecedores de aves e insumos cadastrados.
          </p>
        </div>

        <Link
          href="/admin/fornecedores/novo"
          className="w-full rounded-md bg-[#1B3B32] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#142d26] sm:w-auto"
        >
          Novo fornecedor
        </Link>
      </div>

      <section className="mt-6">
        {fornecedores.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-700">
              Nenhum fornecedor cadastrado.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {fornecedores.map((fornecedor) => (
                <article
                  key={fornecedor.for_id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-gray-900">
                        {fornecedor.for_razao_social}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {fornecedor.for_cnpj}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        fornecedor.for_status === "ATIVO"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {fornecedor.for_status}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400">
                      Categoria
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {fornecedor.categoria_fornecedor.ctf_descricao}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4">
                    <Link
                      href={`/admin/fornecedores/${fornecedor.for_id}/editar`}
                      className="text-sm font-medium text-[#1B3B32] transition hover:underline"
                    >
                      Editar
                    </Link>

                    <AlterarStatusFornecedorButton
                      fornecedorId={fornecedor.for_id}
                      status={fornecedor.for_status}
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
                        Razão social
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        CNPJ
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Categoria
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
                    {fornecedores.map((fornecedor) => (
                      <tr key={fornecedor.for_id}>
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                          {fornecedor.for_razao_social}

                          {fornecedor.for_nome_fantasia && (
                            <p className="mt-0.5 text-xs font-normal text-gray-500">
                              {fornecedor.for_nome_fantasia}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {fornecedor.for_cnpj}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {fornecedor.categoria_fornecedor.ctf_descricao}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              fornecedor.for_status === "ATIVO"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {fornecedor.for_status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-4">
                            <Link
                              href={`/admin/fornecedores/${fornecedor.for_id}/editar`}
                              className="text-sm font-medium text-[#1B3B32] transition hover:underline"
                            >
                              Editar
                            </Link>

                            <AlterarStatusFornecedorButton
                              fornecedorId={fornecedor.for_id}
                              status={fornecedor.for_status}
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
