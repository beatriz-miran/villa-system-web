"use client";

import {
  Building2,
  Calculator,
  Check,
  Circle,
  PackageOpen,
  Truck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { calcularCapacidadeMaximaAves } from "@/application/lotes/capacidade-galpao";

type OpcaoLinhagem = {
  lin_id: number;
  lin_nome: string;
  lin_densidade_maxima_aves_m2: number | null;
};

type OpcaoGalpao = {
  gal_id: number;
  gal_nome: string;
  gal_area_m2: number;
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
    idadeInicialDias: string;
    dataAlojamento: string;
  };
};

const inputClassName =
  "mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500";

const labelClassName = "text-sm font-semibold text-gray-700";

function formatarNumero(valor: number, casasDecimais = 0) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  });
}

function obterNomeFornecedor(fornecedor: OpcaoFornecedor) {
  return fornecedor.for_nome_fantasia ?? fornecedor.for_razao_social;
}

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
  const [linhagemId, setLinhagemId] = useState(
    valoresIniciais ? String(valoresIniciais.linhagemId) : "",
  );

  const [galpaoId, setGalpaoId] = useState(
    valoresIniciais ? String(valoresIniciais.galpaoId) : "",
  );

  const [fornecedorId, setFornecedorId] = useState(
    valoresIniciais ? String(valoresIniciais.fornecedorId) : "",
  );

  const [quantidadeInicial, setQuantidadeInicial] = useState(
    valoresIniciais?.quantidadeInicial ?? "",
  );

  const [idadeInicialDias, setIdadeInicialDias] = useState(
    valoresIniciais?.idadeInicialDias ?? "",
  );

  const [dataAlojamento, setDataAlojamento] = useState(
    valoresIniciais?.dataAlojamento ?? "",
  );

  const hoje = new Date().toISOString().slice(0, 10);

  const linhagensOrdenadas = [...linhagens].sort((a, b) =>
    a.lin_nome.localeCompare(b.lin_nome, "pt-BR"),
  );

  const galpoesOrdenados = [...galpoes].sort((a, b) =>
    a.gal_nome.localeCompare(b.gal_nome, "pt-BR"),
  );

  const fornecedoresOrdenados = [...fornecedores].sort((a, b) =>
    obterNomeFornecedor(a).localeCompare(
      obterNomeFornecedor(b),
      "pt-BR",
    ),
  );

  const linhagemSelecionada = linhagens.find(
    (linhagem) => String(linhagem.lin_id) === linhagemId,
  );

  const galpaoSelecionado = galpoes.find(
    (galpao) => String(galpao.gal_id) === galpaoId,
  );

  const fornecedorSelecionado = fornecedores.find(
    (fornecedor) => String(fornecedor.for_id) === fornecedorId,
  );

  const densidadeMaxima =
    linhagemSelecionada?.lin_densidade_maxima_aves_m2 ?? null;

  const densidadeValida =
    densidadeMaxima !== null &&
    Number.isFinite(densidadeMaxima) &&
    densidadeMaxima > 0;

  const capacidadeMaxima =
    galpaoSelecionado && densidadeValida
      ? calcularCapacidadeMaximaAves(
          galpaoSelecionado.gal_area_m2,
          densidadeMaxima,
        )
      : null;

  const limiteQuantidade =
    capacidadeMaxima === null
      ? null
      : Math.min(capacidadeMaxima, 500000);

  const quantidadeNumero = Number(quantidadeInicial);
  const idadeInicialDiasNumero = Number(idadeInicialDias);

  const idadeInicialValida =
    idadeInicialDias.trim() !== "" &&
    Number.isInteger(idadeInicialDiasNumero) &&
    idadeInicialDiasNumero >= 1 &&
    idadeInicialDiasNumero <= 3650;

  const quantidadeValida =
    quantidadeInicial.trim() !== "" &&
    Number.isInteger(quantidadeNumero) &&
    quantidadeNumero > 0 &&
    limiteQuantidade !== null &&
    quantidadeNumero <= limiteQuantidade;

  const quantidadeExcedeCapacidade =
    quantidadeInicial.trim() !== "" &&
    Number.isFinite(quantidadeNumero) &&
    capacidadeMaxima !== null &&
    quantidadeNumero > capacidadeMaxima;

  const dataValida =
    dataAlojamento !== "" && dataAlojamento <= hoje;

  const alojamentoConcluido =
    Boolean(linhagemSelecionada) &&
    Boolean(galpaoSelecionado) &&
    densidadeValida &&
    capacidadeMaxima !== null &&
    capacidadeMaxima > 0;

  const origemConcluida =
    fornecedorSelecionado !== undefined;

  const dadosIniciaisConcluidos =
    quantidadeValida &&
    idadeInicialValida &&
    dataValida;

  const podeSalvar =
    alojamentoConcluido &&
    origemConcluida &&
    dadosIniciaisConcluidos &&
    !pendente;

  return (
    <form
      action={formAction}
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(19rem,0.85fr)]"
    >
      {loteId !== undefined && (
        <input type="hidden" name="id" value={loteId} />
      )}

      {erro && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 xl:col-span-2"
        >
          {erro}
        </p>
      )}

      <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <section className="border-b border-gray-200 p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
              1
            </span>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Alojamento
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Selecione a linhagem e o galpão para calcular a capacidade permitida.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="linhagemId" className={labelClassName}>
                Linhagem
              </label>

              <select
                id="linhagemId"
                name="linhagemId"
                required
                disabled={linhagensOrdenadas.length === 0}
                value={linhagemId}
                onChange={(event) => setLinhagemId(event.target.value)}
                className={`${inputClassName} bg-white`}
              >
                <option value="" disabled>
                  {linhagensOrdenadas.length === 0
                    ? "Nenhuma linhagem disponível"
                    : "Selecione uma linhagem"}
                </option>

                {linhagensOrdenadas.map((linhagem) => (
                  <option
                    key={linhagem.lin_id}
                    value={linhagem.lin_id}
                  >
                    {linhagem.lin_nome}
                    {linhagem.lin_densidade_maxima_aves_m2 === null
                      ? " — sem densidade cadastrada"
                      : ` — ${formatarNumero(
                          linhagem.lin_densidade_maxima_aves_m2,
                          2,
                        )} aves/m²`}
                  </option>
                ))}
              </select>

              {linhagensOrdenadas.length === 0 && (
                <p className="mt-2 text-sm font-medium text-amber-700">
                  Cadastre uma linhagem ativa antes de criar o lote.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="galpaoId" className={labelClassName}>
                Galpão
              </label>

              <select
                id="galpaoId"
                name="galpaoId"
                required
                disabled={galpoesOrdenados.length === 0}
                value={galpaoId}
                onChange={(event) => setGalpaoId(event.target.value)}
                className={`${inputClassName} bg-white`}
              >
                <option value="" disabled>
                  {galpoesOrdenados.length === 0
                    ? "Nenhum galpão disponível"
                    : "Selecione um galpão"}
                </option>

                {galpoesOrdenados.map((galpao) => (
                  <option
                    key={galpao.gal_id}
                    value={galpao.gal_id}
                  >
                    {galpao.gal_nome} —{" "}
                    {formatarNumero(galpao.gal_area_m2, 2)} m²
                  </option>
                ))}
              </select>

              {galpoesOrdenados.length === 0 && (
                <p className="mt-2 text-sm font-medium text-amber-700">
                  Não há galpões ativos disponíveis para alojar um novo lote.
                </p>
              )}
            </div>
          </div>

          <div
            aria-live="polite"
            className={`mt-5 rounded-lg border p-4 ${
              capacidadeMaxima !== null && capacidadeMaxima > 0
                ? "border-emerald-200 bg-emerald-50"
                : linhagemSelecionada && !densidadeValida
                  ? "border-amber-200 bg-amber-50"
                  : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <Calculator
                aria-hidden="true"
                className={`mt-0.5 h-5 w-5 shrink-0 ${
                  capacidadeMaxima !== null && capacidadeMaxima > 0
                    ? "text-emerald-700"
                    : linhagemSelecionada && !densidadeValida
                      ? "text-amber-700"
                      : "text-gray-400"
                }`}
              />

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {capacidadeMaxima !== null && capacidadeMaxima > 0
                    ? `Capacidade máxima: ${formatarNumero(
                        capacidadeMaxima,
                      )} aves`
                    : linhagemSelecionada && !densidadeValida
                      ? "Densidade da linhagem não cadastrada"
                      : "Capacidade aguardando cálculo"}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {galpaoSelecionado && densidadeValida
                    ? `${formatarNumero(
                        galpaoSelecionado.gal_area_m2,
                        2,
                      )} m² × ${formatarNumero(
                        densidadeMaxima,
                        2,
                      )} aves/m²`
                    : linhagemSelecionada && !densidadeValida
                      ? "Edite a linhagem e informe a densidade máxima antes de utilizar este cadastro."
                      : "Selecione uma linhagem e um galpão para visualizar o limite."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-gray-200 p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
              2
            </span>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Origem das aves
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Identifique o fornecedor responsável pelo lote recebido.
              </p>
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
              disabled={fornecedoresOrdenados.length === 0}
              value={fornecedorId}
              onChange={(event) => setFornecedorId(event.target.value)}
              className={`${inputClassName} bg-white`}
            >
              <option value="" disabled>
                {fornecedoresOrdenados.length === 0
                  ? "Nenhum fornecedor disponível"
                  : "Selecione um fornecedor"}
              </option>

              {fornecedoresOrdenados.map((fornecedor) => (
                <option
                  key={fornecedor.for_id}
                  value={fornecedor.for_id}
                >
                  {obterNomeFornecedor(fornecedor)}
                </option>
              ))}
            </select>

            {fornecedoresOrdenados.length === 0 && (
              <p className="mt-2 text-sm font-medium text-amber-700">
                Cadastre um fornecedor ativo antes de criar o lote.
              </p>
            )}
          </div>
        </section>

        <section className="p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
              3
            </span>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Dados iniciais
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Informe a quantidade, a idade inicial e a data de alojamento das aves.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label
                htmlFor="quantidadeInicial"
                className={labelClassName}
              >
                Quantidade inicial de aves
              </label>

              <input
                id="quantidadeInicial"
                name="quantidadeInicial"
                type="number"
                required
                min="1"
                max={limiteQuantidade ?? undefined}
                step="1"
                inputMode="numeric"
                disabled={
                  capacidadeMaxima === null ||
                  capacidadeMaxima <= 0
                }
                aria-describedby="ajuda-quantidade-inicial"
                placeholder={
                  capacidadeMaxima !== null
                    ? `Máximo: ${formatarNumero(capacidadeMaxima)}`
                    : "Selecione linhagem e galpão"
                }
                value={quantidadeInicial}
                onChange={(event) =>
                  setQuantidadeInicial(event.target.value)
                }
                className={`${inputClassName} ${
                  quantidadeExcedeCapacidade
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : ""
                }`}
              />

              <div
                id="ajuda-quantidade-inicial"
                aria-live="polite"
                className="mt-2 text-xs"
              >
                {quantidadeExcedeCapacidade ? (
                  <p className="font-medium text-red-700">
                    O limite para esta combinação é de{" "}
                    {formatarNumero(capacidadeMaxima ?? 0)} aves.
                  </p>
                ) : quantidadeValida && capacidadeMaxima !== null ? (
                  <p className="text-emerald-700">
                    Restam{" "}
                    {formatarNumero(
                      capacidadeMaxima - quantidadeNumero,
                    )}{" "}
                    vagas dentro do limite.
                  </p>
                ) : (
                  <p className="text-gray-500">
                    A quantidade não pode ultrapassar a capacidade calculada.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="idadeInicialDias"
                className={labelClassName}
              >
                Idade inicial das aves
              </label>

              <input
                id="idadeInicialDias"
                name="idadeInicialDias"
                type="number"
                required
                min="1"
                max="3650"
                step="1"
                inputMode="numeric"
                placeholder="Ex.: 120"
                value={idadeInicialDias}
                onChange={(event) =>
                  setIdadeInicialDias(event.target.value)
                }
                className={inputClassName}
              />

              <p className="mt-2 text-xs text-gray-500">
                Idade no dia do alojamento, em dias.
              </p>
            </div>

            <div>
              <label
                htmlFor="dataAlojamento"
                className={labelClassName}
              >
                Data de alojamento
              </label>

              <input
                id="dataAlojamento"
                name="dataAlojamento"
                type="date"
                required
                max={hoje}
                value={dataAlojamento}
                onChange={(event) =>
                  setDataAlojamento(event.target.value)
                }
                className={inputClassName}
              />

              <p className="mt-2 text-xs text-gray-500">
                Não é permitido informar uma data futura.
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-white p-5 sm:flex-row sm:justify-end xl:hidden">
          <Link
            href="/admin/lotes"
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={!podeSalvar}
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
                Resumo do lote
              </p>

              <h2 className="mt-2 text-lg font-bold text-gray-900">
                {linhagemSelecionada?.lin_nome ?? "Novo lote"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {galpaoSelecionado?.gal_nome ??
                  "Galpão não selecionado"}
              </p>
            </div>

            <PackageOpen
              aria-hidden="true"
              className="h-6 w-6 text-[#1B3B32]"
            />
          </div>

          <dl className="mt-5 space-y-4">
            <div className="flex items-start gap-3">
              <Building2
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
              />

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Alojamento
                </dt>

                <dd className="mt-1 text-sm font-medium text-gray-800">
                  {galpaoSelecionado
                    ? `${galpaoSelecionado.gal_nome} · ${formatarNumero(
                        galpaoSelecionado.gal_area_m2,
                        2,
                      )} m²`
                    : "Não selecionado"}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Truck
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
              />

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Fornecedor
                </dt>

                <dd className="mt-1 text-sm font-medium text-gray-800">
                  {fornecedorSelecionado
                    ? obterNomeFornecedor(fornecedorSelecionado)
                    : "Não selecionado"}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UsersRound
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
              />

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Quantidade inicial
                </dt>

                <dd className="mt-1 text-sm font-medium text-gray-800">
                  {quantidadeInicial.trim() !== "" &&
                  Number.isFinite(quantidadeNumero)
                    ? `${formatarNumero(quantidadeNumero)} aves`
                    : "Não informada"}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UsersRound
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
              />

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Idade inicial
                </dt>

                <dd className="mt-1 text-sm font-medium text-gray-800">
                  {idadeInicialValida
                    ? `${formatarNumero(
                        idadeInicialDiasNumero,
                      )} dias`
                    : "Não informada"}
                </dd>
              </div>
            </div>
          </dl>

          <div
            className={`mt-5 rounded-lg border p-4 ${
              quantidadeExcedeCapacidade
                ? "border-red-200 bg-red-50"
                : capacidadeMaxima !== null
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-gray-200 bg-gray-50"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Limite calculado
            </p>

            <p
              className={`mt-1 text-xl font-bold ${
                quantidadeExcedeCapacidade
                  ? "text-red-700"
                  : "text-[#1B3B32]"
              }`}
            >
              {capacidadeMaxima === null
                ? "—"
                : `${formatarNumero(capacidadeMaxima)} aves`}
            </p>

            {densidadeValida && (
              <p className="mt-1 text-xs text-gray-600">
                Densidade de{" "}
                {formatarNumero(densidadeMaxima, 2)} aves/m²
              </p>
            )}
          </div>

          <ul
            className="mt-5 divide-y divide-gray-100"
            aria-live="polite"
          >
            <li className="flex items-start gap-3 py-3">
              {alojamentoConcluido ? (
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
                  Alojamento
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  Linhagem, galpão e capacidade
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 py-3">
              {origemConcluida ? (
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
                  Origem
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  Fornecedor das aves
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 py-3">
              {dadosIniciaisConcluidos ? (
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
                  Dados iniciais
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  Quantidade, idade e data de alojamento
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm xl:block">
          <button
            type="submit"
            disabled={!podeSalvar}
            className="w-full rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pendente ? "Salvando..." : submitLabel}
          </button>

          <Link
            href="/admin/lotes"
            className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </section>
      </aside>
    </form>
  );
}