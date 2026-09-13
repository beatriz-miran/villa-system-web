type HistoricoFornecimentoProps = {
  lotesAves: {
    lta_id: number;
    lta_codigo_qr_code: string;
    lta_data_alojamento: Date;
    lta_quant_inicial: number;
    lta_status: string;
    linhagem: {
      lin_nome: string;
    };
  }[];
  entradasInsumo: {
    lei_id: number;
    lei_data_entrada: Date;
    lei_lote_fabricante: string | null;
    insumo: {
      ins_nome: string;
    };
  }[];
};

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export default function HistoricoFornecimento({
  lotesAves,
  entradasInsumo,
}: HistoricoFornecimentoProps) {
  const semHistorico =
    lotesAves.length === 0 && entradasInsumo.length === 0;

  return (
    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-gray-900">
        Histórico de fornecimento
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Lotes de aves e entradas de insumos já vinculados a este fornecedor.
      </p>

      {semHistorico ? (
        <p className="mt-4 rounded-md bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
          Nenhum fornecimento registrado até o momento.
        </p>
      ) : (
        <div className="mt-4 space-y-6">
          {lotesAves.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Lotes de aves
              </p>

              <ul className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-100">
                {lotesAves.map((lote) => (
                  <li
                    key={lote.lta_id}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
                  >
                    <span className="font-medium text-gray-900">
                      {lote.lta_codigo_qr_code}
                    </span>

                    <span className="text-gray-500">
                      {lote.linhagem.lin_nome}
                    </span>

                    <span className="text-gray-500">
                      {lote.lta_quant_inicial} aves
                    </span>

                    <span className="text-gray-500">
                      {formatarData(lote.lta_data_alojamento)}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        lote.lta_status === "ATIVO"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {lote.lta_status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {entradasInsumo.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Entradas de insumos
              </p>

              <ul className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-100">
                {entradasInsumo.map((entrada) => (
                  <li
                    key={entrada.lei_id}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
                  >
                    <span className="font-medium text-gray-900">
                      {entrada.insumo.ins_nome}
                    </span>

                    {entrada.lei_lote_fabricante && (
                      <span className="text-gray-500">
                        Lote {entrada.lei_lote_fabricante}
                      </span>
                    )}

                    <span className="text-gray-500">
                      {formatarData(entrada.lei_data_entrada)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
