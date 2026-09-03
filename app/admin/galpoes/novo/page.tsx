import NovoGalpaoForm from "./NovoGalpaoForm";

export default function NovoGalpaoPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-[#1B3B32]">
          Administração
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Novo galpão
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Cadastre um novo galpão para alojamento de aves.
        </p>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <NovoGalpaoForm />
        </section>
      </div>
    </div>
  );
}
