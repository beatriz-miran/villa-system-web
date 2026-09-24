import { notFound } from "next/navigation";

import { buscarCategoriaInsumo } from "@/application/insumos/buscar-categoria-insumo";
import CategoriaInsumoForm from "@/app/admin/insumos/categorias/components/CategoriaInsumoForm";

type EditarCategoriaInsumoPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarCategoriaInsumoPage({
  params,
}: EditarCategoriaInsumoPageProps) {
  const { id } = await params;

  const categoriaId = Number(id);

  const categoria = await buscarCategoriaInsumo(categoriaId);

  if (!categoria) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-[#1B3B32]">
          Estoque de Insumos / Categorias
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Editar categoria
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Atualize os dados da categoria de insumo.
        </p>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <CategoriaInsumoForm
            modo="editar"
            categoria={{
              id: categoria.cti_id,
              descricao: categoria.cti_descricao,
              tipo: categoria.cti_tipo,
            }}
          />
        </section>
      </div>
    </div>
  );
}
