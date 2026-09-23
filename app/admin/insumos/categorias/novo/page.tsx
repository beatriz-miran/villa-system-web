import CategoriaInsumoForm from "@/app/admin/insumos/categorias/components/CategoriaInsumoForm";

export default function NovaCategoriaInsumoPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-[#1B3B32]">
          Estoque de Insumos / Categorias
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Nova categoria
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Cadastre uma nova categoria para o catálogo de insumos.
        </p>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <CategoriaInsumoForm modo="criar" />
        </section>
      </div>
    </div>
  );
}
