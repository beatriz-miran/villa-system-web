export default function AdminPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Visão Geral da Granja
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Acompanhe as principais informações da sua granja.
          </p>
        </div>

        <button
          type="button"
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#1B3B32] transition hover:bg-gray-50 sm:w-auto"
        >
          Personalizar painel
        </button>
      </div>
    </div>
  );
}