import Link from "next/link";
import { notFound } from "next/navigation";

import { buscarFornecedor } from "@/application/fornecedores/buscar-fornecedor";
import { listarFornecedoresAtivos } from "@/application/fornecedores/listar-fornecedores-ativos";
import { buscarGalpao } from "@/application/galpoes/buscar-galpao";
import { listarGalpoesDisponiveis } from "@/application/galpoes/listar-galpoes-disponiveis";
import { buscarLinhagem } from "@/application/linhagens/buscar-linhagem";
import { listarLinhagensAtivas } from "@/application/linhagens/listar-linhagens-ativas";
import { buscarLote } from "@/application/lotes/buscar-lote";

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

  const [linhagens, galpoes, fornecedores] =
    await Promise.all([
      listarLinhagensAtivas(),
      listarGalpoesDisponiveis(),
      listarFornecedoresAtivos(),
    ]);

  const [
    linhagemAtualFaltante,
    galpaoAtualFaltante,
    fornecedorAtualFaltante,
  ] = await Promise.all([
    linhagens.some(
      (linhagem) => linhagem.lin_id === lote.lin_id,
    )
      ? null
      : buscarLinhagem(lote.lin_id),

    galpoes.some(
      (galpao) => galpao.gal_id === lote.gal_id,
    )
      ? null
      : buscarGalpao(lote.gal_id),

    fornecedores.some(
      (fornecedor) => fornecedor.for_id === lote.for_id,
    )
      ? null
      : buscarFornecedor(lote.for_id),
  ]);

  const opcoesLinhagensBase = linhagemAtualFaltante
    ? [linhagemAtualFaltante, ...linhagens]
    : linhagens;

  const opcoesGalpoesBase = galpaoAtualFaltante
    ? [galpaoAtualFaltante, ...galpoes]
    : galpoes;

  const opcoesFornecedoresBase = fornecedorAtualFaltante
    ? [fornecedorAtualFaltante, ...fornecedores]
    : fornecedores;

  const opcoesLinhagens = opcoesLinhagensBase.map(
    (linhagem) => ({
      lin_id: linhagem.lin_id,
      lin_nome: linhagem.lin_nome,
      lin_densidade_maxima_aves_m2:
        linhagem.lin_densidade_maxima_aves_m2 === null
          ? null
          : Number(
              linhagem.lin_densidade_maxima_aves_m2,
            ),
    }),
  );

  const opcoesGalpoes = opcoesGalpoesBase.map(
    (galpao) => ({
      gal_id: galpao.gal_id,
      gal_nome: galpao.gal_nome,
      gal_area_m2: Number(galpao.gal_area_m2),
    }),
  );

  const opcoesFornecedores =
    opcoesFornecedoresBase.map((fornecedor) => ({
      for_id: fornecedor.for_id,
      for_razao_social: fornecedor.for_razao_social,
      for_nome_fantasia: fornecedor.for_nome_fantasia,
    }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração / Lotes
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Editar lote
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Atualize a origem, o alojamento e os dados iniciais das aves.
            </p>
          </div>

          <Link
            href={`/admin/lotes/${lote.lta_id}`}
            className="self-start rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Voltar
          </Link>
        </header>

        <EditarLoteForm
          lote={{
            id: lote.lta_id,
            linhagemId: lote.lin_id,
            galpaoId: lote.gal_id,
            fornecedorId: lote.for_id,
            quantidadeInicial:
              lote.lta_quant_inicial.toString(),
            idadeInicialDias:
              lote.lta_idade_inicial.toString(),
            dataAlojamento: lote.lta_data_alojamento
              .toISOString()
              .slice(0, 10),
          }}
          linhagens={opcoesLinhagens}
          galpoes={opcoesGalpoes}
          fornecedores={opcoesFornecedores}
        />
      </div>
    </div>
  );
}