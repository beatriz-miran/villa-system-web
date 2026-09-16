import Link from "next/link";

import { listarFornecedoresAtivos } from "@/application/fornecedores/listar-fornecedores-ativos";
import { listarGalpoesDisponiveis } from "@/application/galpoes/listar-galpoes-disponiveis";
import { listarLinhagensAtivas } from "@/application/linhagens/listar-linhagens-ativas";

import NovoLoteForm from "./NovoLoteForm";

export default async function NovoLotePage() {
  const [linhagens, galpoes, fornecedores] =
    await Promise.all([
      listarLinhagensAtivas(),
      listarGalpoesDisponiveis(),
      listarFornecedoresAtivos(),
    ]);

  const opcoesLinhagens = linhagens.map((linhagem) => ({
    lin_id: linhagem.lin_id,
    lin_nome: linhagem.lin_nome,
    lin_densidade_maxima_aves_m2:
      linhagem.lin_densidade_maxima_aves_m2 === null
        ? null
        : Number(
            linhagem.lin_densidade_maxima_aves_m2,
          ),
  }));

  const opcoesGalpoes = galpoes.map((galpao) => ({
    gal_id: galpao.gal_id,
    gal_nome: galpao.gal_nome,
    gal_area_m2: Number(galpao.gal_area_m2),
  }));

  const opcoesFornecedores = fornecedores.map(
    (fornecedor) => ({
      for_id: fornecedor.for_id,
      for_razao_social: fornecedor.for_razao_social,
      for_nome_fantasia: fornecedor.for_nome_fantasia,
    }),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração / Lotes
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Novo lote
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Cadastre um lote vinculando sua origem,
              linhagem e local de alojamento.
            </p>
          </div>

          <Link
            href="/admin/lotes"
            className="self-start rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Voltar
          </Link>
        </header>

        <NovoLoteForm
          linhagens={opcoesLinhagens}
          galpoes={opcoesGalpoes}
          fornecedores={opcoesFornecedores}
        />
      </div>
    </div>
  );
}