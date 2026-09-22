"use client";

import { X } from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  registrarProducaoLoteAction,
  type RegistrarProducaoLoteActionState,
} from "@/app/admin/lotes/actions";

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
      <label
        htmlFor={id}
        className="text-sm font-semibold text-gray-800"
      >
        {rotulo}
      </label>

      <input
        id={id}
        name={id}
        type="number"
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
        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
      />

      <div className="mt-2 flex gap-2">
        {incrementos.map((incremento) => (
          <button
            key={incremento}
            type="button"
            disabled={disabled}
            onClick={() =>
              incrementar(incremento)
            }
            className="flex-1 rounded-md border border-gray-300 bg-white py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            +{incremento}
          </button>
        ))}

        <button
          type="button"
          disabled={disabled}
          onClick={() => aoAlterar(0)}
          className="flex-1 rounded-md border border-gray-200 bg-white py-1.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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

  const [modalAberto, setModalAberto] =
    useState(false);

  const [quantidadeComercial, setQuantidadeComercial] =
    useState(0);

  const [quantidadePerda, setQuantidadePerda] =
    useState(0);

  const [erroOculto, setErroOculto] =
    useState(false);

  function limparFormulario() {
    formRef.current?.reset();
    setQuantidadeComercial(0);
    setQuantidadePerda(0);
  }

  const [state, formAction, pendente] =
    useActionState(
      async (
        estadoAnterior: RegistrarProducaoLoteActionState,
        formData: FormData,
      ) => {
        const resultado =
          await registrarProducaoLoteAction(
            estadoAnterior,
            formData,
          );

        if (resultado.sucesso) {
          limparFormulario();
          setModalAberto(false);
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

  useEffect(() => {
    if (!modalAberto) {
      return;
    }

    function fecharComEscape(
      evento: KeyboardEvent,
    ) {
      if (
        evento.key === "Escape" &&
        !pendente
      ) {
        setModalAberto(false);
      }
    }

    window.addEventListener(
      "keydown",
      fecharComEscape,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        fecharComEscape,
      );
    };
  }, [modalAberto, pendente]);

  function abrirModal() {
    if (semAvesDisponiveis) {
      return;
    }

    limparFormulario();
    setErroOculto(true);
    setModalAberto(true);
  }

  function fecharModal() {
    if (pendente) {
      return;
    }

    limparFormulario();
    setModalAberto(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrirModal}
        disabled={semAvesDisponiveis}
        title={
          semAvesDisponiveis
            ? "O lote não possui aves disponíveis."
            : undefined
        }
        className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Registrar produção
      </button>

      {modalAberto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(evento) => {
            if (
              evento.target ===
              evento.currentTarget
            ) {
              fecharModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`titulo-producao-lote-${loteId}`}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl"
          >
            <form
              ref={formRef}
              action={formAction}
              onSubmit={() =>
                setErroOculto(false)
              }
            >
              <input
                type="hidden"
                name="loteId"
                value={loteId}
              />

              <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
                <div>
                  <h2
                    id={`titulo-producao-lote-${loteId}`}
                    className="text-lg font-bold text-gray-900"
                  >
                    Registrar produção
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Informe a coleta de ovos do dia para este lote.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={pendente}
                  aria-label="Fechar janela"
                  className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </button>
              </header>

              <div className="space-y-5 px-5 py-5">
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <IncrementoQuantidade
                    id="quantidadeComercial"
                    rotulo="Ovos comerciais"
                    valor={quantidadeComercial}
                    aoAlterar={(novoValor) => {
                      setQuantidadeComercial(
                        novoValor,
                      );
                      setErroOculto(true);
                    }}
                    max={quantidadeDisponivel}
                    disabled={pendente}
                  />

                  <IncrementoQuantidade
                    id="quantidadePerda"
                    rotulo="Perdas (quebrados/trincados)"
                    valor={quantidadePerda}
                    aoAlterar={(novoValor) => {
                      setQuantidadePerda(
                        novoValor,
                      );
                      setErroOculto(true);
                    }}
                    max={quantidadeDisponivel}
                    disabled={pendente}
                  />
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total produzido
                  </p>

                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {(
                      quantidadeComercial +
                      quantidadePerda
                    ).toLocaleString("pt-BR")}{" "}
                    ovos
                  </p>
                </div>

                <div>
                  <label
                    htmlFor={`data-producao-${loteId}`}
                    className="text-sm font-semibold text-gray-800"
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
                    disabled={pendente}
                    onChange={() =>
                      setErroOculto(true)
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>

                {erroVisivel ? (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  >
                    {erroVisivel}
                  </p>
                ) : null}
              </div>

              <footer className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={pendente}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={pendente}
                  className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendente
                    ? "Registrando..."
                    : "Confirmar produção"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
