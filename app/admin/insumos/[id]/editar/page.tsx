import { notFound } from "next/navigation";

import { buscarInsumo } from "@/application/insumos/buscar-insumo";
import { listarCategoriasInsumo } from "@/application/insumos/listar-categorias-insumo";
import InsumoForm from "@/app/admin/insumos/components/InsumoForm";

type EditarInsumoPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarInsumoPage({
  params,
}: EditarInsumoPageProps) {
  const { id } = await params;

  const insumoId = Number(id);

  const [insumo, categorias] = await Promise.all([
    buscarInsumo(insumoId),
    listarCategoriasInsumo(),
  ]);

  if (!insumo) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-[#1B3B32]">
          Administração
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Editar insumo
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Atualize os dados cadastrais do insumo.
        </p>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <InsumoForm
            modo="editar"
            categorias={categorias}
            insumo={{
              id: insumo.ins_id,
              nome: insumo.ins_nome,
              composicao: insumo.ins_composicao,
              faseAplicacao: insumo.ins_fase_aplicacao,
              unidadeMedida: insumo.ins_unidade_medida,
              pontoRessuprimento: Number(insumo.ins_ponto_ressuprimento),
              diasCarencia: insumo.ins_dias_carencia,
              categoriaId: insumo.cti_id,
            }}
          />
        </section>
      </div>
    </div>
  );
}
