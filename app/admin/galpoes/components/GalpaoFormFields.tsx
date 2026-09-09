"use client";

import Link from "next/link";

type GalpaoFormFieldsProps = {
  formAction: (formData: FormData) => void;
  pendente: boolean;
  erro?: string;
  submitLabel: string;
  galpaoId?: number;
  valoresIniciais?: {
    nome: string;
    areaM2: string;
  };
};

const inputClassName =
  "mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20";

const labelClassName = "text-sm font-semibold text-gray-700";

export default function GalpaoFormFields({
  formAction,
  pendente,
  erro,
  submitLabel,
  galpaoId,
  valoresIniciais,
}: GalpaoFormFieldsProps) {
  return (
    <form action={formAction} className="space-y-5">
      {galpaoId && <input type="hidden" name="id" value={galpaoId} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className={labelClassName}>
            Nome do galpão
          </label>

          <input
            id="nome"
            name="nome"
            type="text"
            required
            placeholder="Digite o nome do galpão"
            defaultValue={valoresIniciais?.nome}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="areaM2" className={labelClassName}>
            Área (m²)
          </label>

          <input
            id="areaM2"
            name="areaM2"
            type="number"
            required
            min="0.01"
            max="9999.99"
            step="0.01"
            placeholder="Digite a área em m²"
            defaultValue={valoresIniciais?.areaM2}
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
          href="/admin/galpoes"
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
