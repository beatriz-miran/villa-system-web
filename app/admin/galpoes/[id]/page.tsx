import Link from "next/link";
import { notFound } from "next/navigation";

import { buscarGalpao } from "@/application/galpoes/buscar-galpao";
import { statusGalpaoLabel } from "@/application/galpoes/status-galpao";

type VisualizarGalpaoPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const statusPillClassName: Record<string, string> = {
  ATIVO: "bg-green-50 text-green-700",
  VAZIO_SANITARIO: "bg-blue-50 text-blue-700",
  MANUTENCAO: "bg-amber-50 text-amber-700",
  DESATIVADO: "bg-gray-100 text-gray-600",
};

const campoClassName =
  "rounded-lg border border-gray-100 bg-gray-50 p-4";

const rotuloClassName =
  "text-xs font-semibold uppercase tracking-wide text-gray-400";

const valorClassName =
  "mt-1 text-sm font-medium text-gray-900";

export default async function VisualizarGalpaoPage({
  params,
}: VisualizarGalpaoPageProps) {
  const { id } = await params;
  const galpaoId = Number(id);
  const galpao = await buscarGalpao(galpaoId);

  if (!galpao) {
    notFound();
  }

  const status = galpao.gal_status ?? "ATIVO";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração / Galpões
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {galpao.gal_nome}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Visualização dos dados cadastrais do galpão.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/galpoes"
              className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Voltar
            </Link>

            <Link
              href={`/admin/galpoes/${galpao.gal_id}/editar`}
              className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#142d26]"
            >
              Editar galpão
            </Link>
          </div>
        </header>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900">
              Informações do galpão
            </h2>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                statusPillClassName[status]
              }`}
            >
              {statusGalpaoLabel[status]}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className={campoClassName}>
              <p className={rotuloClassName}>Nome</p>

              <p className={valorClassName}>
                {galpao.gal_nome}
              </p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>Área útil</p>

              <p className={valorClassName}>
                {Number(galpao.gal_area_m2).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                m²
              </p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>Status</p>

              <p className={valorClassName}>
                {statusGalpaoLabel[status]}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}