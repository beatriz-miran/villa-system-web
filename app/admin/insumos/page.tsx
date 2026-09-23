import Link from "next/link";

import { listarCategoriasInsumo } from "@/application/insumos/listar-categorias-insumo";
import { listarInsumos } from "@/application/insumos/listar-insumos";
import {
  rotuloFaseAplicacao,
  rotuloUnidadeMedida,
} from "@/application/insumos/insumo-opcoes";
import AlterarStatusInsumoButton from "@/app/admin/insumos/components/AlterarStatusInsumoButton";

type InsumosPageProps = {
  searchParams: Promise<{
    categoria?: string;
  }>;
};

export default async function InsumosPage({
  searchParams,
}: InsumosPageProps) {
  const { categoria } = await searchParams;

  const categoriaId =
    categoria && Number.isInteger(Number(categoria))
      ? Number(categoria)
      : undefined;

  const [insumos, categorias] = await Promise.all([
    listarInsumos(categoriaId ? { categoriaId } : undefined),
    listarCategoriasInsumo(),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#1B3B32]">
            Administração
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Insumos
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Consulte e gerencie o catálogo de insumos da granja.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/insumos/categorias"
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
          >
            Gerenciar categorias
          </Link>

          <Link
            href="/admin/insumos/novo"
            className="w-full rounded-md bg-[#1B3B32] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#142d26] sm:w-auto"
          >
            Novo insumo
          </Link>
        </div>
      </div>

      <form
        method="get"
        className="mt-6 flex flex-col gap-2 sm:max-w-xs sm:flex-row sm:items-end sm:gap-3"
      >
        <div className="flex-1">
          <label
            htmlFor="categoria"
            className="text-sm font-semibold text-gray-700"
          >
            Filtrar por categoria
          </label>

          <select
            id="categoria"
            name="categoria"
            defaultValue={categoriaId ?? ""}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
          >
            <option value="">Todas as categorias</option>

            {categorias.map((cat) => (
              <option key={cat.cti_id} value={cat.cti_id}>
                {cat.cti_descricao}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="mt-3 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:mt-0"
        >
          Filtrar
        </button>
      </form>

      <section className="mt-6">
        {insumos.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-700">
              Nenhum insumo cadastrado.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {insumos.map((insumo) => (
                <article
                  key={insumo.ins_id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-gray-900">
                        {insumo.ins_nome}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {insumo.categoria_insumo.cti_descricao}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        insumo.ins_status === "ATIVO"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {insumo.ins_status}
                    </span>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <div>
                      <dt className="text-xs text-gray-500">
                        Fase de aplicação
                      </dt>
                      <dd className="text-gray-700">
                        {rotuloFaseAplicacao(insumo.ins_fase_aplicacao)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-gray-500">
                        Unidade de medida
                      </dt>
                      <dd className="text-gray-700">
                        {rotuloUnidadeMedida(insumo.ins_unidade_medida)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-gray-500">
                        Ponto de ressuprimento
                      </dt>
                      <dd className="text-gray-700">
                        {Number(insumo.ins_ponto_ressuprimento)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-gray-500">
                        Dias de carência
                      </dt>
                      <dd className="text-gray-700">
                        {insumo.ins_dias_carencia}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4">
                    <Link
                      href={`/admin/insumos/${insumo.ins_id}/editar`}
                      className="text-sm font-medium text-[#1B3B32] transition hover:underline"
                    >
                      Editar
                    </Link>

                    <AlterarStatusInsumoButton
                      insumoId={insumo.ins_id}
                      status={insumo.ins_status}
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
                        Categoria
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Fase de aplicação
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Unidade de medida
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Ponto de ressuprimento
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Dias de carência
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
                    {insumos.map((insumo) => (
                      <tr key={insumo.ins_id}>
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                          {insumo.ins_nome}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {insumo.categoria_insumo.cti_descricao}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {rotuloFaseAplicacao(insumo.ins_fase_aplicacao)}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {rotuloUnidadeMedida(insumo.ins_unidade_medida)}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {Number(insumo.ins_ponto_ressuprimento)}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {insumo.ins_dias_carencia}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              insumo.ins_status === "ATIVO"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {insumo.ins_status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-4">
                            <Link
                              href={`/admin/insumos/${insumo.ins_id}/editar`}
                              className="text-sm font-medium text-[#1B3B32] transition hover:underline"
                            >
                              Editar
                            </Link>

                            <AlterarStatusInsumoButton
                              insumoId={insumo.ins_id}
                              status={insumo.ins_status}
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
