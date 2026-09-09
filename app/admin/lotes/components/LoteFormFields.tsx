"use client";

import Link from "next/link";

type OpcaoLinhagem = {
  lin_id: number;
  lin_nome: string;
};

type OpcaoGalpao = {
  gal_id: number;
  gal_nome: string;
  gal_area_m2: unknown;
};

type OpcaoFornecedor = {
  for_id: number;
  for_razao_social: string;
  for_nome_fantasia: string | null;
};

type LoteFormFieldsProps = {
  formAction: (formData: FormData) => void;
  pendente: boolean;
  erro?: string;
  submitLabel: string;
  linhagens: OpcaoLinhagem[];
  galpoes: OpcaoGalpao[];
  fornecedores: OpcaoFornecedor[];
  loteId?: number;
  valoresIniciais?: {
    linhagemId: number;
    galpaoId: number;
    fornecedorId: number;
    quantidadeInicial: string;
    dataAlojamento: string;
  };
};

const inputClassName =
  "mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20";

const labelClassName = "text-sm font-semibold text-gray-700";

export default function LoteFormFields({
  formAction,
  pendente,
  erro,
  submitLabel,
  linhagens,
  galpoes,
  fornecedores,
  loteId,
  valoresIniciais,
}: LoteFormFieldsProps) {
  return (
    <form action={formAction} className="space-y-5">
      {loteId && <input type="hidden" name="id" value={loteId} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="linhagemId" className={labelClassName}>
            Linhagem
          </label>

          <select
            id="linhagemId"
            name="linhagemId"
            required
            defaultValue={valoresIniciais?.linhagemId ?? ""}
            className={`${inputClassName} bg-white`}
          >
            <option value="" disabled>
              Selecione uma linhagem
            </option>

            {linhagens.map((linhagem) => (
              <option key={linhagem.lin_id} value={linhagem.lin_id}>
                {linhagem.lin_nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="galpaoId" className={labelClassName}>
            Galpão
          </label>

          <select
            id="galpaoId"
            name="galpaoId"
            required
            defaultValue={valoresIniciais?.galpaoId ?? ""}
            className={`${inputClassName} bg-white`}
          >
            <option value="" disabled>
              Selecione um galpão
            </option>

            {galpoes.map((galpao) => (
              <option key={galpao.gal_id} value={galpao.gal_id}>
                {galpao.gal_nome} (
                {Number(galpao.gal_area_m2).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                m²)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="fornecedorId" className={labelClassName}>
          Fornecedor
        </label>

        <select
          id="fornecedorId"
          name="fornecedorId"
          required
          defaultValue={valoresIniciais?.fornecedorId ?? ""}
          className={`${inputClassName} bg-white`}
        >
          <option value="" disabled>
            Selecione um fornecedor
          </option>

          {fornecedores.map((fornecedor) => (
            <option key={fornecedor.for_id} value={fornecedor.for_id}>
              {fornecedor.for_nome_fantasia ??
                fornecedor.for_razao_social}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="quantidadeInicial" className={labelClassName}>
            Quantidade inicial de aves
          </label>

          <input
            id="quantidadeInicial"
            name="quantidadeInicial"
            type="number"
            required
            min="1"
            max="500000"
            step="1"
            placeholder="Digite a quantidade de aves"
            defaultValue={valoresIniciais?.quantidadeInicial}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="dataAlojamento" className={labelClassName}>
            Data de alojamento
          </label>

          <input
            id="dataAlojamento"
            name="dataAlojamento"
            type="date"
            required
            defaultValue={valoresIniciais?.dataAlojamento}
            className={inputClassName}
          />
        </div>
      </div>

      {erro && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          {erro}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link
          href="/admin/lotes"
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={pendente}
          className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pendente ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
