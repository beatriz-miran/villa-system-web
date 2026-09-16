import Link from "next/link";

import { listarFornecedores } from "@/application/fornecedores/listar-fornecedores";
import AlterarStatusFornecedorButton from "@/app/admin/fornecedores/components/AlterarStatusFornecedorButton";

function CategoriasFornecedor({
  categorias,
}: {
  categorias: {
    categoria_fornecedor: {
      ctf_id: number;
      ctf_descricao: string;
    };
  }[];
}) {
  if (categorias.length === 0) {
    return (
      <span className="text-gray-400">
        Sem categoria
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {categorias.map((relacao) => (
        <span
          key={relacao.categoria_fornecedor.ctf_id}
          className="rounded-full bg-[#EAF4EF] px-2.5 py-1 text-xs font-medium text-[#1B3B32]"
        >
          {relacao.categoria_fornecedor.ctf_descricao}
        </span>
      ))}
    </div>
  );
}

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
            Consulte e gerencie os fornecedores de aves e insumos
            cadastrados.
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
                      <h2 className="font-bold text-gray-900">
                        {fornecedor.for_razao_social}
                      </h2>

                      {fornecedor.for_nome_fantasia ? (
                        <p className="mt-1 text-sm text-gray-500">
                          {fornecedor.for_nome_fantasia}
                        </p>
                      ) : null}

                      <p className="mt-1 whitespace-nowrap text-xs tabular-nums text-gray-500">
                        CNPJ: {fornecedor.for_cnpj}
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
                      Categorias
                    </p>

                    <div className="mt-2">
                      <CategoriasFornecedor
                        categorias={
                          fornecedor.fornecedorCategorias
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                    <Link
                      href={`/admin/fornecedores/${fornecedor.for_id}`}
                      className="min-w-24 rounded-md border border-[#1B3B32] bg-white px-3 py-2 text-center text-sm font-medium text-[#1B3B32] transition hover:bg-[#EAF4EF]"
                    >
                      Visualizar
                    </Link>

                    <Link
                      href={`/admin/fornecedores/${fornecedor.for_id}/editar`}
                      className="min-w-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
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
                        Fornecedor
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Categorias
                      </th>

                      <th className="w-28 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="w-[22rem] px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {fornecedores.map((fornecedor) => (
                      <tr key={fornecedor.for_id}>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {fornecedor.for_razao_social}
                          </p>

                          {fornecedor.for_nome_fantasia ? (
                            <p className="mt-1 text-xs text-gray-500">
                              {fornecedor.for_nome_fantasia}
                            </p>
                          ) : null}

                          <p className="mt-1 whitespace-nowrap text-xs tabular-nums text-gray-500">
                            CNPJ: {fornecedor.for_cnpj}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <CategoriasFornecedor
                            categorias={
                              fornecedor.fornecedorCategorias
                            }
                          />
                        </td>

                        <td className="w-28 px-5 py-4">
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

                        <td className="w-[22rem] px-5 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <Link
                              href={`/admin/fornecedores/${fornecedor.for_id}`}
                              className="min-w-24 rounded-md border border-[#1B3B32] bg-white px-3 py-2 text-center text-sm font-medium text-[#1B3B32] transition hover:bg-[#EAF4EF]"
                            >
                              Visualizar
                            </Link>

                            <Link
                              href={`/admin/fornecedores/${fornecedor.for_id}/editar`}
                              className="min-w-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
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