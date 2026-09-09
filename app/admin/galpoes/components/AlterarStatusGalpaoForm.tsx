"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  alterarStatusGalpaoAction,
  AlterarStatusGalpaoActionState,
} from "@/app/admin/galpoes/actions";
import {
  statusGalpaoLabel,
  statusGalpaoValores,
  StatusGalpao,
} from "@/application/galpoes/status-galpao";

type AlterarStatusGalpaoFormProps = {
  galpaoId: number;
  status: StatusGalpao;
};

const estadoInicial: AlterarStatusGalpaoActionState = {};

export default function AlterarStatusGalpaoForm({
  galpaoId,
  status,
}: AlterarStatusGalpaoFormProps) {
  const [state, formAction, pendente] = useActionState(
    alterarStatusGalpaoAction,
    estadoInicial
  );

  const formRef = useRef<HTMLFormElement>(null);

  const [erroVisivel, setErroVisivel] = useState<string | null>(null);
  const [valorSelecionado, setValorSelecionado] =
    useState<StatusGalpao>(status);

  const [statusAnterior, setStatusAnterior] = useState(status);

  if (status !== statusAnterior) {
    setStatusAnterior(status);
    setValorSelecionado(status);
  }

  const [estadoAnterior, setEstadoAnterior] = useState(state);

  if (state !== estadoAnterior) {
    setEstadoAnterior(state);
    setErroVisivel(state.erro ?? null);

    if (state.erro) {
      setValorSelecionado(status);
    }
  }

  useEffect(() => {
    if (!erroVisivel) {
      return;
    }

    function fecharErro() {
      setErroVisivel(null);
    }

    document.addEventListener("pointerdown", fecharErro);

    return () => {
      document.removeEventListener("pointerdown", fecharErro);
    };
  }, [erroVisivel]);

  return (
    <>
      <form ref={formRef} action={formAction}>
        <input type="hidden" name="id" value={galpaoId} />

        <select
          name="status"
          value={valorSelecionado}
          disabled={pendente}
          onChange={(event) => {
            setValorSelecionado(event.target.value as StatusGalpao);
            formRef.current?.requestSubmit();
          }}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-700 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {statusGalpaoValores.map((valor) => (
            <option key={valor} value={valor}>
              {statusGalpaoLabel[valor]}
            </option>
          ))}
        </select>
      </form>

      {erroVisivel && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed left-4 right-4 top-4 z-50 rounded-xl border border-red-200 bg-white p-4 shadow-lg sm:left-auto sm:right-6 sm:top-6 sm:w-full sm:max-w-sm"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
              !
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Ação não permitida
              </p>

              <p className="mt-1 text-sm text-gray-600">{erroVisivel}</p>
            </div>

            <button
              type="button"
              onClick={() => setErroVisivel(null)}
              className="shrink-0 rounded-md px-2 py-1 text-lg leading-none text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
