"use client";

import { X } from "lucide-react";
import {
  useActionState,
  useRef,
  useState,
} from "react";

import {
  estornarProducaoLoteAction,
  type EstornarProducaoLoteActionState,
} from "@/app/operador/producao/actions";

type EstornarProducaoLoteFormProps = {
  movimentoId: number;
  tipo: string;
  quantidade: number;
  data: string;
};

const estadoInicial: EstornarProducaoLoteActionState =
  {};

export default function EstornarProducaoLoteForm({
  movimentoId,
  tipo,
  quantidade,
  data,
}: EstornarProducaoLoteFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [modalAberto, setModalAberto] =
    useState(false);

  const [motivo, setMotivo] = useState("");

  const [erroOculto, setErroOculto] =
    useState(false);

  function limparFormulario() {
    formRef.current?.reset();
    setMotivo("");
  }

  const [state, formAction, pendente] =
    useActionState(
      async (
        estadoAnterior: EstornarProducaoLoteActionState,
        formData: FormData,
      ) => {
        const resultado =
          await estornarProducaoLoteAction(
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

  function abrirModal() {
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
        className="text-sm font-semibold text-red-600 transition active:opacity-70"
      >
        Estornar
      </button>

      {modalAberto ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
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
            aria-labelledby={`titulo-estorno-producao-op-${movimentoId}`}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-gray-200 bg-white shadow-2xl sm:rounded-xl"
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
                name="movimentoId"
                value={movimentoId}
              />

              <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
                <h2
                  id={`titulo-estorno-producao-op-${movimentoId}`}
                  className="text-lg font-bold text-gray-900"
                >
                  Estornar produção
                </h2>

                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={pendente}
                  aria-label="Fechar janela"
                  className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </button>
              </header>

              <div className="space-y-4 px-5 py-5">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <p>
                    <strong>{tipo}</strong> ·{" "}
                    {quantidade.toLocaleString(
                      "pt-BR",
                    )}{" "}
                    ovos · {data}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor={`motivo-estorno-producao-op-${movimentoId}`}
                    className="text-sm font-bold text-gray-800"
                  >
                    Justificativa do estorno
                  </label>

                  <textarea
                    id={`motivo-estorno-producao-op-${movimentoId}`}
                    name="motivo"
                    rows={3}
                    minLength={5}
                    maxLength={255}
                    required
                    disabled={pendente}
                    value={motivo}
                    onChange={(evento) => {
                      setMotivo(
                        evento.target.value,
                      );
                      setErroOculto(true);
                    }}
                    className="mt-2 w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
                    placeholder="Explique por que este registro deve ser estornado."
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

              <footer className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4">
                <button
                  type="submit"
                  disabled={pendente}
                  className="w-full rounded-lg border border-red-600 bg-red-600 py-3 text-base font-bold text-white transition active:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendente
                    ? "Estornando..."
                    : "Confirmar estorno"}
                </button>

                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={pendente}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
