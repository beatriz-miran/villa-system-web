import Link from "next/link";
import { notFound } from "next/navigation";

import LinhagemForm from "@/app/admin/linhagens/components/LinhagemForm";
import { buscarLinhagem } from "@/application/linhagens/buscar-linhagem";
import { listarTiposOvo } from "@/application/linhagens/listar-tipos-ovo";

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
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração / Linhagens
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Editar linhagem
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Atualize dados técnicos, imagens, cartilhas e metas
              semanais.
            </p>
          </div>

          <Link
            href={`/admin/linhagens/${linhagem.lin_id}`}
            className="self-start rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Voltar
          </Link>
        </header>

        <LinhagemForm
          modo="editar"
          tiposOvo={tiposOvo}
          linhagem={{
            id: linhagem.lin_id,
            nome: linhagem.lin_nome,
            descricao: linhagem.lin_descricao,
            densidadeMaximaAvesM2:
              linhagem.lin_densidade_maxima_aves_m2 ===
              null
                ? null
                : Number(
                    linhagem.lin_densidade_maxima_aves_m2,
                  ),
            imagemGalinhaUrl:
              linhagem.lin_imagem_galinha_url,
            imagemOvoUrl: linhagem.lin_imagem_ovo_url,
            tipoOvoId: linhagem.tov_id,
            metas:
              linhagem.meta_linhagem_semanal.map(
                (meta) => ({
                  semana: meta.mls_semana,
                  pesoMetaGramas:
                    meta.mls_peso_meta_gramas === null
                      ? null
                      : Number(
                          meta.mls_peso_meta_gramas,
                        ),
                  consumoMetaGramas:
                    meta.mls_consumo_meta_gramas ===
                    null
                      ? null
                      : Number(
                          meta.mls_consumo_meta_gramas,
                        ),
                  produtividadeMetaPercentual:
                    meta.mls_produtividade_meta_percentual ===
                    null
                      ? null
                      : Number(
                          meta.mls_produtividade_meta_percentual,
                        ),
                }),
              ),
            cartilhas: linhagem.cartilhas.map(
              (cartilha) => ({
                ctl_id: cartilha.ctl_id,
                ctl_titulo: cartilha.ctl_titulo,
                ctl_fonte: cartilha.ctl_fonte,
                ctl_sistema: cartilha.ctl_sistema,
                ctl_edicao: cartilha.ctl_edicao,
                ctl_url: cartilha.ctl_url,
              }),
            ),
          }}
        />
      </div>
    </div>
  );
}