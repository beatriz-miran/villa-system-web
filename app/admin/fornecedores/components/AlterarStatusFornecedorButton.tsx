"use client";

import { useActionState, useEffect, useState } from "react";

import {
  alterarStatusFornecedorAction,
  type AlterarStatusFornecedorActionState,
} from "@/app/admin/fornecedores/actions";

type StatusFornecedor = "ATIVO" | "INATIVO";

type AlterarStatusFornecedorButtonProps = {
  fornecedorId: number;
  status: StatusFornecedor;
};

const estadoInicial: AlterarStatusFornecedorActionState = {};

export default function AlterarStatusFornecedorButton({
  fornecedorId,
  status,
}: AlterarStatusFornecedorButtonProps) {
  const [state, formAction, pendente] = useActionState(
    alterarStatusFornecedorAction,
    estadoInicial,
  );

  const [erroOculto, setErroOculto] = useState(false);

  const fornecedorAtivo = status === "ATIVO";

  const novoStatus: StatusFornecedor = fornecedorAtivo
    ? "INATIVO"
    : "ATIVO";

  const acao = fornecedorAtivo ? "desativar" : "ativar";

  const erroVisivel =
    !pendente && !erroOculto
      ? state.erro ?? null
      : null;

  useEffect(() => {
    if (!erroVisivel) {
      return;
    }

    function fecharErro() {
      setErroOculto(true);
    }

    document.addEventListener("pointerdown", fecharErro);

    return () => {
      document.removeEventListener("pointerdown", fecharErro);
    };
  }, [erroVisivel]);

  function confirmarAlteracao(
    evento: React.FormEvent<HTMLFormElement>,
  ) {
    const confirmou = window.confirm(
      `Confirma ${acao} este fornecedor?`,
    );

    if (!confirmou) {
      evento.preventDefault();
      return;
    }

    setErroOculto(false);
  }

  return (
    <>
      <form
        action={formAction}
        onSubmit={confirmarAlteracao}
        className="shrink-0"
      >
        <input
          type="hidden"
          name="id"
          value={fornecedorId}
        />

        <input
          type="hidden"
          name="status"
          value={novoStatus}
        />

        <button
          type="submit"
          disabled={pendente}
          className={`w-24 rounded-md border px-3 py-2 text-center text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
            fornecedorAtivo
              ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
              : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          {pendente
            ? "Salvando..."
            : fornecedorAtivo
              ? "Desativar"
              : "Ativar"}
        </button>
      </form>

      {erroVisivel ? (
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

              <p className="mt-1 text-sm text-gray-600">
                {erroVisivel}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setErroOculto(true)}
              className="shrink-0 rounded-md px-2 py-1 text-lg leading-none text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}