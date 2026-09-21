"use client";

import { X } from "lucide-react";
import {
  useActionState,
  useEffect,
  useState,
} from "react";

import {
  statusGalpaoLabel,
  statusGalpaoValores,
  type StatusGalpao,
} from "@/application/galpoes/status-galpao";
import {
  alterarStatusGalpaoAction,
  type AlterarStatusGalpaoActionState,
} from "@/app/admin/galpoes/actions";

type AlterarStatusGalpaoFormProps = {
  galpaoId: number;
  status: StatusGalpao;
};

const estadoInicial: AlterarStatusGalpaoActionState = {};

const statusDescricao: Record<StatusGalpao, string> = {
  ATIVO: "Disponível para receber e manter lotes de aves.",
  VAZIO_SANITARIO:
    "Temporariamente sem aves para limpeza e higienização.",
  MANUTENCAO:
    "Indisponível enquanto são realizados reparos ou ajustes.",
  DESATIVADO:
    "Retirado de operação por tempo indeterminado.",
};

const statusPillClassName: Record<StatusGalpao, string> = {
  ATIVO: "bg-green-50 text-green-700",
  VAZIO_SANITARIO: "bg-blue-50 text-blue-700",
  MANUTENCAO: "bg-amber-50 text-amber-700",
  DESATIVADO: "bg-gray-100 text-gray-600",
};

export default function AlterarStatusGalpaoForm({
  galpaoId,
  status,
}: AlterarStatusGalpaoFormProps) {
  const [modalAberto, setModalAberto] = useState(false);

  const [valorSelecionado, setValorSelecionado] =
    useState<StatusGalpao>(status);

  const [erroOculto, setErroOculto] = useState(false);

  const [state, formAction, pendente] = useActionState(
    async (
      estadoAnterior: AlterarStatusGalpaoActionState,
      formData: FormData,
    ) => {
      const resultado = await alterarStatusGalpaoAction(
        estadoAnterior,
        formData,
      );

      if (resultado.sucesso) {
        setModalAberto(false);
      }

      return resultado;
    },
    estadoInicial,
  );

  const statusAlterado = valorSelecionado !== status;
  const erroVisivel = erroOculto ? null : state.erro ?? null;

  useEffect(() => {
    if (!modalAberto) {
      return;
    }

    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape" && !pendente) {
        setModalAberto(false);
      }
    }

    window.addEventListener("keydown", fecharComEscape);

    return () => {
      window.removeEventListener("keydown", fecharComEscape);
    };
  }, [modalAberto, pendente]);

  function abrirModal() {
    setValorSelecionado(status);
    setErroOculto(true);
    setModalAberto(true);
  }

  function fecharModal() {
    if (pendente) {
      return;
    }

    setModalAberto(false);
    setValorSelecionado(status);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrirModal}
        className="rounded-md border border-[#1B3B32] bg-white px-3 py-2 text-sm font-medium text-[#1B3B32] transition hover:bg-[#EAF4EF]"
      >
        Alterar status
      </button>

      {modalAberto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              fecharModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`titulo-status-galpao-${galpaoId}`}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
          >
            <form
              action={formAction}
              onSubmit={() => setErroOculto(false)}
            >
              <input
                type="hidden"
                name="id"
                value={galpaoId}
              />

              <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
                <div>
                  <h2
                    id={`titulo-status-galpao-${galpaoId}`}
                    className="text-lg font-bold text-gray-900"
                  >
                    Alterar status do galpão
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Selecione a situação operacional atual.
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

              <div className="px-5 py-5">
                <div className="mb-5 flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Status atual
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {statusGalpaoLabel[status]}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusPillClassName[status]
                    }`}
                  >
                    {statusGalpaoLabel[status]}
                  </span>
                </div>

                <fieldset>
                  <legend className="text-sm font-semibold text-gray-800">
                    Novo status
                  </legend>

                  <div className="mt-3 space-y-2">
                    {statusGalpaoValores.map((valor) => {
                      const selecionado =
                        valorSelecionado === valor;

                      return (
                        <label
                          key={valor}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                            selecionado
                              ? "border-[#1B3B32] bg-[#F2F7F5]"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={valor}
                            checked={selecionado}
                            disabled={pendente}
                            onChange={() => {
                              setValorSelecionado(valor);
                              setErroOculto(true);
                            }}
                            className="mt-1 h-4 w-4 accent-[#1B3B32]"
                          />

                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {statusGalpaoLabel[valor]}
                              </span>

                              {valor === status ? (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                                  Atual
                                </span>
                              ) : null}
                            </span>

                            <span className="mt-1 block text-xs leading-5 text-gray-500">
                              {statusDescricao[valor]}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {erroVisivel ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
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
                  disabled={pendente || !statusAlterado}
                  className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendente
                    ? "Alterando..."
                    : "Confirmar alteração"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}