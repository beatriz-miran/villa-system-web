import Link from "next/link";
import { notFound } from "next/navigation";

import {
  sistemaCartilhaLabel,
  type SistemaCartilha,
} from "@/application/linhagens/cartilha-linhagem-schema";
import { buscarLinhagem } from "@/application/linhagens/buscar-linhagem";

type VisualizarLinhagemPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VisualizarLinhagemPage({
  params,
}: VisualizarLinhagemPageProps) {
  const { id } = await params;
  const linhagemId = Number(id);
  const linhagem = await buscarLinhagem(linhagemId);

  if (!linhagem) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#1B3B32]">
            Administração / Linhagens
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {linhagem.lin_nome}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Visualização dos dados cadastrais, metas e cartilhas técnicas.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/admin/linhagens"
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Voltar
          </Link>

          <Link
            href={`/admin/linhagens/${linhagem.lin_id}/editar`}
            className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#142d26]"
          >
            Editar linhagem
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900">
              Dados cadastrais
            </h2>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                linhagem.lin_status === "ATIVO"
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {linhagem.lin_status ?? "INATIVO"}
            </span>
          </div>

          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Nome
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {linhagem.lin_nome}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tipo de ovo
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {linhagem.tipo_ovo.tov_nome}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Descrição
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                {linhagem.lin_descricao || "Nenhuma descrição informada."}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-gray-900">
            Metas semanais
          </h2>

          {linhagem.meta_linhagem_semanal.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              Nenhuma meta semanal cadastrada.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Semana
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Peso (g)
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Consumo (g/ave/dia)
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Produtividade (%)
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {linhagem.meta_linhagem_semanal.map((meta) => (
                    <tr key={meta.mls_id}>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                        {meta.mls_semana}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600">
                        {meta.mls_peso_meta_gramas === null
                          ? "—"
                          : String(meta.mls_peso_meta_gramas)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600">
                        {meta.mls_consumo_meta_gramas === null
                          ? "—"
                          : String(meta.mls_consumo_meta_gramas)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600">
                        {meta.mls_produtividade_meta_percentual === null
                          ? "—"
                          : String(meta.mls_produtividade_meta_percentual)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Cartilhas técnicas
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Consulte os materiais oficiais relacionados a esta linhagem.
          </p>
        </div>

        {linhagem.cartilhas.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            Nenhuma cartilha cadastrada para esta linhagem.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {linhagem.cartilhas.map((cartilha, indice) => (
              <details
                key={cartilha.ctl_id}
                open={indice === 0}
                className="overflow-hidden rounded-lg border border-gray-200"
              >
                <summary className="cursor-pointer list-none px-4 py-3 transition hover:bg-gray-50">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {cartilha.ctl_titulo}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {cartilha.ctl_fonte} ·{" "}
                        {
                          sistemaCartilhaLabel[
                            cartilha.ctl_sistema as SistemaCartilha
                          ]
                        }
                        {cartilha.ctl_edicao
                          ? ` · ${cartilha.ctl_edicao}`
                          : ""}
                      </p>
                    </div>

                    <span className="text-sm font-medium text-[#1B3B32]">
                      Abrir visualização
                    </span>
                  </div>
                </summary>

                <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
                  <iframe
                    src={`/api/admin/linhagens/cartilhas/${cartilha.ctl_id}/arquivo`}
                    title={cartilha.ctl_titulo}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-[520px] w-full rounded-md border border-gray-300 bg-white sm:h-[720px]"
                  />

                  <p className="mt-3 text-sm text-gray-600">
                    Se o material não carregar,{" "}
                    <a
                      href={cartilha.ctl_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#1B3B32] underline"
                    >
                      abra a fonte oficial em outra aba
                    </a>
                    .
                  </p>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}