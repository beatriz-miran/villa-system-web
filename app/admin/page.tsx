export default function AdminPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
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
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#1B3B32] transition hover:bg-gray-50"
        >
          Personalizar painel
        </button>
      </div>
    </div>
  );
}