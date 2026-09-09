import { notFound } from "next/navigation";

import { buscarLote } from "@/application/lotes/buscar-lote";
import { buscarLinhagem } from "@/application/linhagens/buscar-linhagem";
import { buscarGalpao } from "@/application/galpoes/buscar-galpao";
import { buscarFornecedor } from "@/application/fornecedores/buscar-fornecedor";
import { listarLinhagensAtivas } from "@/application/linhagens/listar-linhagens-ativas";
import { listarGalpoesDisponiveis } from "@/application/galpoes/listar-galpoes-disponiveis";
import { listarFornecedoresAtivos } from "@/application/fornecedores/listar-fornecedores-ativos";

import EditarLoteForm from "./EditarLoteForm";

type EditarLotePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarLotePage({
  params,
}: EditarLotePageProps) {
  const { id } = await params;

  const loteId = Number(id);

  const lote = await buscarLote(loteId);

  if (!lote) {
    notFound();
  }

  const [linhagens, galpoes, fornecedores] = await Promise.all([
    listarLinhagensAtivas(),
    listarGalpoesDisponiveis(),
    listarFornecedoresAtivos(),
  ]);

  const [linhagemAtualFaltante, galpaoAtualFaltante, fornecedorAtualFaltante] =
    await Promise.all([
      linhagens.some((linhagem) => linhagem.lin_id === lote.lin_id)
        ? null
        : buscarLinhagem(lote.lin_id),
      galpoes.some((galpao) => galpao.gal_id === lote.gal_id)
        ? null
        : buscarGalpao(lote.gal_id),
      fornecedores.some(
        (fornecedor) => fornecedor.for_id === lote.for_id
      )
        ? null
        : buscarFornecedor(lote.for_id),
    ]);

  const opcoesLinhagens = linhagemAtualFaltante
    ? [linhagemAtualFaltante, ...linhagens]
    : linhagens;

  const opcoesGalpoes = galpaoAtualFaltante
    ? [galpaoAtualFaltante, ...galpoes]
    : galpoes;

  const opcoesFornecedores = fornecedorAtualFaltante
    ? [fornecedorAtualFaltante, ...fornecedores]
    : fornecedores;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-[#1B3B32]">
          Administração
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Editar lote
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Atualize os dados de vinculação e alojamento do lote.
        </p>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <EditarLoteForm
            lote={{
              id: lote.lta_id,
              linhagemId: lote.lin_id,
              galpaoId: lote.gal_id,
              fornecedorId: lote.for_id,
              quantidadeInicial: lote.lta_quant_inicial.toString(),
              dataAlojamento: lote.lta_data_alojamento
                .toISOString()
                .slice(0, 10),
            }}
            linhagens={opcoesLinhagens}
            galpoes={opcoesGalpoes}
            fornecedores={opcoesFornecedores}
          />
        </section>
      </div>
    </div>
  );
}
