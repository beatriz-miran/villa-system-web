"use client";

import {
  Building2,
  Check,
  Circle,
  ClipboardCheck,
  Ruler,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
  const [nome, setNome] = useState(valoresIniciais?.nome ?? "");
  const [areaM2, setAreaM2] = useState(valoresIniciais?.areaM2 ?? "");

  const nomeValido = nome.trim().length >= 2;
  const areaNumero = Number(areaM2);
  const areaValida =
    areaM2.trim().length > 0 &&
    Number.isFinite(areaNumero) &&
    areaNumero > 0;

  const areaFormatada = areaValida
    ? `${new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(areaNumero)} m²`
    : "Área não informada";

  return (
    <form
      action={formAction}
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(19rem,0.85fr)]"
    >
      {galpaoId ? (
        <input type="hidden" name="id" value={galpaoId} />
      ) : null}

      {erro ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 xl:col-span-2"
        >
          {erro}
        </p>
      ) : null}

      <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <section className="p-5 sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
              1
            </span>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Identificação e dimensões
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Informe um nome de fácil identificação e a área útil do
                galpão.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="nome" className={labelClassName}>
                Nome do galpão
              </label>

              <input
                id="nome"
                name="nome"
                type="text"
                required
                minLength={2}
                maxLength={100}
                autoComplete="off"
                placeholder="Ex.: Galpão de postura 01"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                className={inputClassName}
              />

              <p className="mt-2 text-xs text-gray-500">
                Utilize um nome que permita localizar o galpão rapidamente.
              </p>
            </div>

            <div>
              <label htmlFor="areaM2" className={labelClassName}>
                Área útil
              </label>

              <div className="relative">
                <input
                  id="areaM2"
                  name="areaM2"
                  type="number"
                  required
                  min="0.01"
                  max="9999.99"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Ex.: 250"
                  value={areaM2}
                  onChange={(event) => setAreaM2(event.target.value)}
                  className={`${inputClassName} pr-12`}
                />

                <span className="pointer-events-none absolute bottom-2.5 right-3 text-sm font-medium text-gray-500">
                  m²
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Considere somente a área destinada ao alojamento das aves.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 bg-gray-50/70 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
              2
            </span>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Orientações para o cadastro
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Confira as informações antes de finalizar.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <Building2
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#1B3B32]"
                />

                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Identificação
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Evite nomes genéricos. Prefira incluir setor, finalidade
                    ou numeração do galpão.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <Ruler
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#1B3B32]"
                />

                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Área cadastrada
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    A capacidade de alojamento depende do sistema de criação,
                    da fase das aves e das normas aplicáveis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-white p-5 sm:flex-row sm:justify-end xl:hidden">
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
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Resumo do galpão
              </p>

              <h2 className="mt-2 break-words text-lg font-bold text-gray-900">
                {nome.trim() || "Novo galpão"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {galpaoId ? "Edição do cadastro" : "Novo cadastro"}
              </p>
            </div>

            <Building2
              aria-hidden="true"
              className="h-6 w-6 shrink-0 text-[#1B3B32]"
            />
          </div>

          <div className="mt-5 rounded-lg bg-[#F2F7F5] p-4">
            <div className="flex items-center gap-2">
              <Ruler
                aria-hidden="true"
                className="h-5 w-5 text-[#1B3B32]"
              />

              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Área útil
              </p>
            </div>

            <p className="mt-2 text-2xl font-bold text-[#1B3B32]">
              {areaFormatada}
            </p>
          </div>

          <ul className="mt-5 divide-y divide-gray-100" aria-live="polite">
            <li className="flex items-start gap-3 py-3">
              {nomeValido ? (
                <Check
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                />
              ) : (
                <Circle
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-gray-300"
                />
              )}

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Nome do galpão
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  {nomeValido
                    ? "Identificação preenchida"
                    : "Informe pelo menos 2 caracteres"}
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 py-3">
              {areaValida ? (
                <Check
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                />
              ) : (
                <Circle
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-gray-300"
                />
              )}

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Área útil
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  {areaValida
                    ? "Dimensão válida"
                    : "Informe uma área maior que zero"}
                </p>
              </div>
            </li>
          </ul>

          <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <ClipboardCheck
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-blue-700"
            />

            <p className="text-xs leading-5 text-blue-800">
              Os dados poderão ser utilizados futuramente no controle de
              lotes e na organização da capacidade produtiva.
            </p>
          </div>
        </section>

        <section className="hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm xl:block">
          <button
            type="submit"
            disabled={pendente}
            className="w-full rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pendente ? "Salvando..." : submitLabel}
          </button>

          <Link
            href="/admin/galpoes"
            className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </section>
      </aside>
    </form>
  );
}