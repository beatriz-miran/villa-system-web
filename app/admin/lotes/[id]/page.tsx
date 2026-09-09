import Link from "next/link";
import { notFound } from "next/navigation";

import { buscarLoteDetalhado } from "@/application/lotes/buscar-lote-detalhado";
import {
  faseLoteLabel,
  statusLoteLabel,
} from "@/application/lotes/status-lote";

type LotePageProps = {
  params: Promise<{
    id: string;
  }>;
};

// lta_data_alojamento é um campo apenas de data (sem horário), armazenado
// como meia-noite UTC — formatar em UTC evita mostrar o dia anterior.
function formatarDataAlojamento(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(data);
}

function formatarDataCadastro(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

const campoClassName = "rounded-lg border border-gray-100 bg-gray-50 p-4";
const rotuloClassName =
  "text-xs font-semibold uppercase tracking-wide text-gray-400";
const valorClassName = "mt-1 text-sm font-medium text-gray-900";

export default async function LotePage({ params }: LotePageProps) {
  const { id } = await params;

  const loteId = Number(id);

  const lote = await buscarLoteDetalhado(loteId);

  if (!lote) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Lote {lote.lta_codigo_qr_code}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Detalhes do lote de aves cadastrado.
            </p>
          </div>

          <Link
            href={`/admin/lotes/${lote.lta_id}/editar`}
            className="w-full rounded-md bg-[#1B3B32] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#142d26] sm:w-auto"
          >
            Editar lote
          </Link>
        </div>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Informações do lote
            </h2>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                lote.lta_status === "ATIVO"
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {statusLoteLabel[lote.lta_status]}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className={campoClassName}>
              <p className={rotuloClassName}>Linhagem</p>
              <p className={valorClassName}>{lote.linhagem.lin_nome}</p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>Galpão</p>
              <p className={valorClassName}>
                {lote.galpao.gal_nome} (
                {Number(lote.galpao.gal_area_m2).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                m²)
              </p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>Fornecedor</p>
              <p className={valorClassName}>
                {lote.fornecedor.for_nome_fantasia ??
                  lote.fornecedor.for_razao_social}
              </p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>Quantidade inicial</p>
              <p className={valorClassName}>
                {lote.lta_quant_inicial.toLocaleString("pt-BR")} aves
              </p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>Data de alojamento</p>
              <p className={valorClassName}>
                {formatarDataAlojamento(lote.lta_data_alojamento)}
              </p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>Fase</p>
              <p className={valorClassName}>
                {faseLoteLabel[lote.lta_fase]}
              </p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>Registrado por</p>
              <p className={valorClassName}>{lote.usuario.usu_nome}</p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>Cadastrado em</p>
              <p className={valorClassName}>
                {formatarDataCadastro(lote.created_at)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
