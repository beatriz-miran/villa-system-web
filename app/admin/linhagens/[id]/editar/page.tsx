import { notFound } from "next/navigation";

import { buscarLinhagem } from "@/application/linhagens/buscar-linhagem";
import { listarTiposOvo } from "@/application/linhagens/listar-tipos-ovo";
import LinhagemForm from "@/app/admin/linhagens/components/LinhagemForm";

type EditarLinhagemPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarLinhagemPage({
  params,
}: EditarLinhagemPageProps) {
  const { id } = await params;

  const linhagemId = Number(id);

  const [linhagem, tiposOvo] = await Promise.all([
    buscarLinhagem(linhagemId),
    listarTiposOvo(),
  ]);

  if (!linhagem) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-[#1B3B32]">
          Administração
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Editar linhagem
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Atualize os dados cadastrais e as metas semanais da linhagem.
        </p>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <LinhagemForm
            modo="editar"
            tiposOvo={tiposOvo}
            linhagem={{
              id: linhagem.lin_id,
              nome: linhagem.lin_nome,
              descricao: linhagem.lin_descricao,
              tipoOvoId: linhagem.tov_id,
              metas: linhagem.meta_linhagem_semanal.map((meta) => ({
                semana: meta.mls_semana,
                pesoMetaGramas:
                  meta.mls_peso_meta_gramas === null
                    ? null
                    : Number(meta.mls_peso_meta_gramas),
                produtividadeMetaPercentual:
                  meta.mls_produtividade_meta_percentual === null
                    ? null
                    : Number(meta.mls_produtividade_meta_percentual),
              })),
            }}
          />
        </section>
      </div>
    </div>
  );
}
