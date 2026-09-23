"use client";

import {
  useActionState,
  useRef,
  useState,
} from "react";

import {
  registrarProducaoLoteAction,
  type RegistrarProducaoLoteActionState,
} from "@/app/operador/producao/actions";

type RegistrarProducaoLoteFormProps = {
  loteId: number;
  quantidadeDisponivel: number;
  dataMinima: string;
  dataMaxima: string;
};

const estadoInicial: RegistrarProducaoLoteActionState =
  {};

const incrementos = [1, 10, 30] as const;

function IncrementoQuantidade({
  id,
  rotulo,
  valor,
  aoAlterar,
  max,
  disabled,
}: {
  id: string;
  rotulo: string;
  valor: number;
  aoAlterar: (novoValor: number) => void;
  max: number;
  disabled: boolean;
}) {
  function incrementar(quantidade: number) {
    aoAlterar(
      Math.min(max, valor + quantidade),
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-bold text-gray-800"
        >
          {rotulo}
        </label>

        <input
          id={id}
          name={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={max}
          step={1}
          required
          disabled={disabled}
          value={valor}
          onChange={(evento) => {
            const novoValor = Number(
              evento.target.value,
            );

            aoAlterar(
              Number.isFinite(novoValor)
                ? novoValor
                : 0,
            );
          }}
          className="w-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-right text-base font-semibold text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {incrementos.map((incremento) => (
          <button
            key={incremento}
            type="button"
            disabled={disabled}
            onClick={() =>
              incrementar(incremento)
            }
            className="rounded-lg border border-[#1B3B32]/20 bg-[#F2F7F5] py-3 text-base font-bold text-[#1B3B32] transition active:scale-95 active:bg-[#1B3B32]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            +{incremento}
          </button>
        ))}

        <button
          type="button"
          disabled={disabled}
          onClick={() => aoAlterar(0)}
          className="rounded-lg border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-500 transition active:scale-95 active:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Zerar
        </button>
      </div>
    </div>
  );
}

export default function RegistrarProducaoLoteForm({
  loteId,
  quantidadeDisponivel,
  dataMinima,
  dataMaxima,
}: RegistrarProducaoLoteFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [quantidadeComercial, setQuantidadeComercial] =
    useState(0);

  const [quantidadePerda, setQuantidadePerda] =
    useState(0);

  const [erroOculto, setErroOculto] =
    useState(false);

  const [confirmacaoVisivel, setConfirmacaoVisivel] =
    useState(false);

  const [state, formAction, pendente] =
    useActionState(
      async (
        estadoAnterior: RegistrarProducaoLoteActionState,
        formData: FormData,
      ) => {
        setConfirmacaoVisivel(false);

        const resultado =
          await registrarProducaoLoteAction(
            estadoAnterior,
            formData,
          );

        if (resultado.sucesso) {
          formRef.current?.reset();
          setQuantidadeComercial(0);
          setQuantidadePerda(0);
          setConfirmacaoVisivel(true);
        }

        return resultado;
      },
      estadoInicial,
    );

  const erroVisivel = erroOculto
    ? null
    : state.erro ?? null;

  const semAvesDisponiveis =
    quantidadeDisponivel <= 0;

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={() => setErroOculto(false)}
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <input
        type="hidden"
        name="loteId"
        value={loteId}
      />

      <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Saldo atual do lote
        </p>

        <p className="mt-1 text-base font-semibold text-gray-900">
          {quantidadeDisponivel.toLocaleString(
            "pt-BR",
          )}{" "}
          {quantidadeDisponivel === 1
            ? "ave"
            : "aves"}
        </p>
      </div>

      <div className="mt-5 space-y-6">
        <IncrementoQuantidade
          id="quantidadeComercial"
          rotulo="Ovos comerciais"
          valor={quantidadeComercial}
          aoAlterar={(novoValor) => {
            setQuantidadeComercial(novoValor);
            setErroOculto(true);
          }}
          max={quantidadeDisponivel}
          disabled={pendente || semAvesDisponiveis}
        />

        <IncrementoQuantidade
          id="quantidadePerda"
          rotulo="Perdas (quebrados/trincados)"
          valor={quantidadePerda}
          aoAlterar={(novoValor) => {
            setQuantidadePerda(novoValor);
            setErroOculto(true);
          }}
          max={quantidadeDisponivel}
          disabled={pendente || semAvesDisponiveis}
        />
      </div>

      <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Total produzido
        </p>

        <p className="mt-1 text-lg font-bold text-gray-900">
          {(
            quantidadeComercial + quantidadePerda
          ).toLocaleString("pt-BR")}{" "}
          ovos
        </p>
      </div>

      <div className="mt-5">
        <label
          htmlFor={`data-producao-${loteId}`}
          className="text-sm font-bold text-gray-800"
        >
          Data da coleta
        </label>

        <input
          id={`data-producao-${loteId}`}
          name="data"
          type="date"
          min={dataMinima}
          max={dataMaxima}
          defaultValue={dataMaxima}
          required
          disabled={pendente || semAvesDisponiveis}
          onChange={() => setErroOculto(true)}
          className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>

      {erroVisivel ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {erroVisivel}
        </p>
      ) : null}

      {confirmacaoVisivel && !erroVisivel ? (
        <p
          role="status"
          className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
        >
          Produção registrada com sucesso.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pendente || semAvesDisponiveis}
        className="mt-5 w-full rounded-lg bg-[#1B3B32] py-4 text-base font-bold text-white transition active:scale-[0.99] active:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pendente
          ? "Registrando..."
          : "Confirmar produção"}
      </button>
    </form>
  );
}
