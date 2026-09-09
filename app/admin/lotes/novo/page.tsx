import { listarLinhagensAtivas } from "@/application/linhagens/listar-linhagens-ativas";
import { listarGalpoesDisponiveis } from "@/application/galpoes/listar-galpoes-disponiveis";
import { listarFornecedoresAtivos } from "@/application/fornecedores/listar-fornecedores-ativos";

import NovoLoteForm from "./NovoLoteForm";

export default async function NovoLotePage() {
  const [linhagens, galpoes, fornecedores] = await Promise.all([
    listarLinhagensAtivas(),
    listarGalpoesDisponiveis(),
    listarFornecedoresAtivos(),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-[#1B3B32]">
          Administração
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Novo lote
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Cadastre um novo lote de aves vinculando linhagem, galpão e
          fornecedor.
        </p>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <NovoLoteForm
            linhagens={linhagens}
            galpoes={galpoes}
            fornecedores={fornecedores}
          />
        </section>
      </div>
    </div>
  );
}
