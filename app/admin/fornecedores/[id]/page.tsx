import Link from "next/link";
import { notFound } from "next/navigation";

import { buscarFornecedor } from "@/application/fornecedores/buscar-fornecedor";
import { buscarHistoricoFornecimento } from "@/application/fornecedores/buscar-historico-fornecimento";
import HistoricoFornecimento from "@/app/admin/fornecedores/components/HistoricoFornecimento";

type VisualizarFornecedorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const campoClassName =
  "rounded-lg border border-gray-100 bg-gray-50 p-4";

const rotuloClassName =
  "text-xs font-semibold uppercase tracking-wide text-gray-400";

const valorClassName =
  "mt-1 break-words text-sm font-medium text-gray-900";

export default async function VisualizarFornecedorPage({
  params,
}: VisualizarFornecedorPageProps) {
  const { id } = await params;
  const fornecedorId = Number(id);

  const [fornecedor, historico] = await Promise.all([
    buscarFornecedor(fornecedorId),
    buscarHistoricoFornecimento(fornecedorId),
  ]);

  if (!fornecedor) {
    notFound();
  }

  const nomeExibicao =
    fornecedor.for_nome_fantasia ||
    fornecedor.for_razao_social;

  const endereco =
    [
      fornecedor.for_logradouro,
      fornecedor.for_numero,
    ]
      .filter(Boolean)
      .join(", ") || "Não informado";

  const cidadeEstado =
    [
      fornecedor.for_cidade,
      fornecedor.for_estado,
    ]
      .filter(Boolean)
      .join(" - ") || "Não informado";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração / Fornecedores
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {nomeExibicao}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Visualização dos dados cadastrais e do histórico de
              fornecimento.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/fornecedores"
              className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Voltar
            </Link>

            <Link
              href={`/admin/fornecedores/${fornecedor.for_id}/editar`}
              className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#142d26]"
            >
              Editar fornecedor
            </Link>
          </div>
        </header>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900">
              Dados empresariais
            </h2>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                fornecedor.for_status === "ATIVO"
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {fornecedor.for_status}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className={campoClassName}>
              <p className={rotuloClassName}>
                Razão social
              </p>

              <p className={valorClassName}>
                {fornecedor.for_razao_social}
              </p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>
                Nome fantasia
              </p>

              <p className={valorClassName}>
                {fornecedor.for_nome_fantasia ||
                  "Não informado"}
              </p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>CNPJ</p>

              <p className={valorClassName}>
                {fornecedor.for_cnpj}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className={rotuloClassName}>
              Categorias de fornecimento
            </p>

            {fornecedor.fornecedorCategorias.length === 0 ? (
              <p className={valorClassName}>
                Nenhuma categoria informada
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {fornecedor.fornecedorCategorias.map(
                  (relacao) => (
                    <span
                      key={
                        relacao.categoria_fornecedor.ctf_id
                      }
                      className="rounded-full bg-[#EAF4EF] px-2.5 py-1 text-xs font-medium text-[#1B3B32]"
                    >
                      {
                        relacao.categoria_fornecedor
                          .ctf_descricao
                      }
                    </span>
                  ),
                )}
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-gray-900">
              Contato
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className={`${campoClassName} sm:col-span-2`}>
                <p className={rotuloClassName}>E-mail</p>

                <p className={valorClassName}>
                  {fornecedor.for_email}
                </p>
              </div>

              <div className={campoClassName}>
                <p className={rotuloClassName}>
                  Telefone principal
                </p>

                <p className={valorClassName}>
                  {fornecedor.for_telefone_principal}
                </p>
              </div>

              <div className={campoClassName}>
                <p className={rotuloClassName}>
                  Telefone secundário
                </p>

                <p className={valorClassName}>
                  {fornecedor.for_telefone_secundario ||
                    "Não informado"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-gray-900">
              Endereço
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className={campoClassName}>
                <p className={rotuloClassName}>CEP</p>

                <p className={valorClassName}>
                  {fornecedor.for_cep || "Não informado"}
                </p>
              </div>

              <div className={campoClassName}>
                <p className={rotuloClassName}>
                  Cidade e estado
                </p>

                <p className={valorClassName}>
                  {cidadeEstado}
                </p>
              </div>

              <div className={`${campoClassName} sm:col-span-2`}>
                <p className={rotuloClassName}>
                  Logradouro e número
                </p>

                <p className={valorClassName}>
                  {endereco}
                </p>
              </div>

              <div className={`${campoClassName} sm:col-span-2`}>
                <p className={rotuloClassName}>Bairro</p>

                <p className={valorClassName}>
                  {fornecedor.for_bairro ||
                    "Não informado"}
                </p>
              </div>
            </div>
          </section>
        </div>

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