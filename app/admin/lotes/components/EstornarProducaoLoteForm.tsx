"use client";

import { X } from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  estornarProducaoLoteAction,
  type EstornarProducaoLoteActionState,
} from "@/app/admin/lotes/actions";

type EstornarProducaoLoteFormProps = {
  movimentoId: number;
  tipo: string;
  quantidade: number;
  data: string;
};

type ModeloMotivoEstorno = {
  id: string;
  titulo: string;
  texto: string;
};

const estadoInicial: EstornarProducaoLoteActionState =
  {};

const modelosMotivoEstorno: readonly ModeloMotivoEstorno[] =
  [
    {
      id: "quantidade",
      titulo: "Quantidade incorreta",
      texto:
        "Estorno realizado porque a quantidade de ovos foi informada incorretamente.",
    },
    {
      id: "data",
      titulo: "Data incorreta",
      texto:
        "Estorno realizado porque a data da coleta foi informada incorretamente.",
    },
    {
      id: "duplicidade",
      titulo: "Registro duplicado",
      texto:
        "Estorno realizado porque esta produção foi registrada em duplicidade.",
    },
    {
      id: "lote",
      titulo: "Lote incorreto",
      texto:
        "Estorno realizado porque a produção foi vinculada ao lote incorreto.",
    },
  ];

export default function EstornarProducaoLoteForm({
  movimentoId,
  tipo,
  quantidade,
  data,
}: EstornarProducaoLoteFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [modalAberto, setModalAberto] =
    useState(false);

  const [
    modeloSelecionado,
    setModeloSelecionado,
  ] = useState("");

  const [motivo, setMotivo] = useState("");

  const [erroOculto, setErroOculto] =
    useState(false);

  function limparFormulario() {
    formRef.current?.reset();
    setModeloSelecionado("");
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

  function selecionarModelo(
    modeloId: string,
  ) {
    setModeloSelecionado(modeloId);
    setErroOculto(true);

    if (!modeloId) {
      setMotivo("");
      return;
    }

    const modelo = modelosMotivoEstorno.find(
      (item) => item.id === modeloId,
    );

    setMotivo(modelo?.texto ?? "");
  }

  return (
    <>
      <button
        type="button"
        onClick={abrirModal}
        className="text-sm font-medium text-red-600 transition hover:text-red-800 hover:underline"
      >
        Estornar
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
            aria-labelledby={`titulo-estorno-producao-${movimentoId}`}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl"
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
                <div>
                  <h2
                    id={`titulo-estorno-producao-${movimentoId}`}
                    className="text-lg font-bold text-gray-900"
                  >
                    Estornar produção
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Corrija um lançamento realizado incorretamente.
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
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Registro selecionado
                  </p>

                  <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-gray-500">
                        Tipo
                      </dt>

                      <dd className="mt-1 text-sm font-semibold text-gray-900">
                        {tipo}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-gray-500">
                        Quantidade
                      </dt>

                      <dd className="mt-1 text-sm font-semibold text-gray-900">
                        {quantidade.toLocaleString(
                          "pt-BR",
                        )}{" "}
                        ovos
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-gray-500">
                        Data
                      </dt>

                      <dd className="mt-1 text-sm font-semibold text-gray-900">
                        {data}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-semibold text-amber-800">
                    Atenção
                  </p>

                  <p className="mt-1 text-sm leading-5 text-amber-700">
                    A quantidade deste registro será removida do estoque de ovos. O lançamento permanecerá visível no histórico como estornado.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor={`modelo-estorno-producao-${movimentoId}`}
                    className="text-sm font-semibold text-gray-800"
                  >
                    Modelo de justificativa
                  </label>

                  <select
                    id={`modelo-estorno-producao-${movimentoId}`}
                    value={modeloSelecionado}
                    disabled={pendente}
                    onChange={(evento) =>
                      selecionarModelo(
                        evento.target.value,
                      )
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="">
                      Escrever por conta própria
                    </option>

                    {modelosMotivoEstorno.map(
                      (modelo) => (
                        <option
                          key={modelo.id}
                          value={modelo.id}
                        >
                          {modelo.titulo}
                        </option>
                      ),
                    )}
                  </select>

                  <p className="mt-1 text-xs text-gray-500">
                    O texto do modelo poderá ser editado antes da confirmação.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor={`motivo-estorno-producao-${movimentoId}`}
                      className="text-sm font-semibold text-gray-800"
                    >
                      Justificativa do estorno
                    </label>

                    <span className="text-xs text-gray-400">
                      {motivo.length}/255
                    </span>
                  </div>

                  <textarea
                    id={`motivo-estorno-producao-${movimentoId}`}
                    name="motivo"
                    rows={4}
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
                  className="rounded-md border border-red-600 bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendente
                    ? "Estornando..."
                    : "Confirmar estorno"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
