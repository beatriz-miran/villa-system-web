import Link from "next/link";

import { listarCategoriasFornecedor } from "@/application/fornecedores/listar-categorias-fornecedor";

import NovoFornecedorForm from "./NovoFornecedorForm";

export default async function NovoFornecedorPage() {
  const categorias = await listarCategoriasFornecedor();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração / Fornecedores
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Novo fornecedor
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Cadastre os dados empresariais, contatos e localização do
              fornecedor.
            </p>
          </div>

          <Link
            href="/admin/fornecedores"
            className="self-start rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Voltar
          </Link>
        </header>

        <NovoFornecedorForm categorias={categorias} />
      </div>
    </div>
  );
}