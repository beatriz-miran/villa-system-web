import Link from "next/link";
import { notFound } from "next/navigation";

import { buscarGalpao } from "@/application/galpoes/buscar-galpao";

import EditarGalpaoForm from "./EditarGalpaoForm";

type EditarGalpaoPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarGalpaoPage({
  params,
}: EditarGalpaoPageProps) {
  const { id } = await params;
  const galpaoId = Number(id);
  const galpao = await buscarGalpao(galpaoId);

  if (!galpao) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração / Galpões
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Editar galpão
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Atualize a identificação e a área útil do galpão.
            </p>
          </div>

          <Link
            href="/admin/galpoes"
            className="self-start rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Voltar
          </Link>
        </header>

        <EditarGalpaoForm
          galpao={{
            id: galpao.gal_id,
            nome: galpao.gal_nome,
            areaM2: galpao.gal_area_m2.toString(),
          }}
        />
      </div>
    </div>
  );
}