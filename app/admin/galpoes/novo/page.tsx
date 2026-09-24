import Link from "next/link";

import NovoGalpaoForm from "./NovoGalpaoForm";

export default function NovoGalpaoPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração / Galpões
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Novo galpão
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Cadastre a identificação e a área útil do novo galpão.
            </p>
          </div>

          <Link
            href="/admin/galpoes"
            className="self-start rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Voltar
          </Link>
        </header>

        <NovoGalpaoForm />
      </div>
    </div>
  );
}