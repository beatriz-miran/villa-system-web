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
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-[#1B3B32]">
          Administração
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Editar galpão
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Atualize os dados cadastrais do galpão.
        </p>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <EditarGalpaoForm
            galpao={{
              id: galpao.gal_id,
              nome: galpao.gal_nome,
              areaM2: galpao.gal_area_m2.toString(),
            }}
          />
        </section>
      </div>
    </div>
  );
}
