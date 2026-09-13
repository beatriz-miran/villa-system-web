import Link from "next/link";
import { notFound } from "next/navigation";

import { buscarFornecedor } from "@/application/fornecedores/buscar-fornecedor";
import { buscarHistoricoFornecimento } from "@/application/fornecedores/buscar-historico-fornecimento";
import { listarCategoriasFornecedor } from "@/application/fornecedores/listar-categorias-fornecedor";
import HistoricoFornecimento from "@/app/admin/fornecedores/components/HistoricoFornecimento";

import EditarFornecedorForm from "./EditarFornecedorForm";

type EditarFornecedorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarFornecedorPage({
  params,
}: EditarFornecedorPageProps) {
  const { id } = await params;
  const fornecedorId = Number(id);
  const fornecedor = await buscarFornecedor(fornecedorId);

  if (!fornecedor) {
    notFound();
  }

  const [categorias, historico] = await Promise.all([
    listarCategoriasFornecedor(),
    buscarHistoricoFornecimento(fornecedorId),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração / Fornecedores
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Editar fornecedor
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Atualize os dados empresariais, contatos e localização do
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

        <EditarFornecedorForm
          categorias={categorias}
          fornecedor={{
            id: fornecedor.for_id,
            razaoSocial: fornecedor.for_razao_social,
            nomeFantasia: fornecedor.for_nome_fantasia,
            cnpj: fornecedor.for_cnpj,
            email: fornecedor.for_email,
            telefonePrincipal: fornecedor.for_telefone_principal,
            telefoneSecundario: fornecedor.for_telefone_secundario,
            cep: fornecedor.for_cep,
            logradouro: fornecedor.for_logradouro,
            numero: fornecedor.for_numero,
            bairro: fornecedor.for_bairro,
            cidade: fornecedor.for_cidade,
            estado: fornecedor.for_estado,
            categoriaId: fornecedor.ctf_id,
          }}
        />

        <div className="mt-6">
          <HistoricoFornecimento
            lotesAves={historico.lotesAves}
            entradasInsumo={historico.entradasInsumo}
          />
        </div>
      </div>
    </div>
  );
}