"use client";

import { X } from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  finalizarLoteAction,
  type FinalizarLoteActionState,
} from "@/app/admin/lotes/actions";

type FinalizarLoteFormProps = {
  loteId: number;
  quantidadeAtual: number;
  dataMinima: string;
  dataMaxima: string;
};

type ModeloTexto = {
  id: string;
  titulo: string;
  texto: string;
};

const estadoInicial: FinalizarLoteActionState =
  {};

const modelosMotivo: readonly ModeloTexto[] =
  [
    {
      id: "ciclo",
      titulo: "Fim do ciclo produtivo",
      texto:
        "Encerramento do lote ao término do ciclo produtivo.",
    },
    {
      id: "sanitario",
      titulo: "Decisão sanitária",
      texto:
        "Encerramento antecipado do lote por decisão sanitária.",
    },
    {
      id: "desempenho",
      titulo: "Desempenho produtivo",
      texto:
        "Encerramento do lote devido ao desempenho produtivo observado.",
    },
    {
      id: "transferencia",
      titulo: "Transferência das aves",
      texto:
        "Encerramento do lote devido à transferência das aves.",
    },
  ];

const modelosDestino: readonly ModeloTexto[] =
  [
    {
      id: "venda",
      titulo: "Venda das aves",
      texto:
        "Venda das aves ao final do ciclo.",
    },
    {
      id: "abate",
      titulo: "Encaminhamento para abate",
      texto:
        "Encaminhamento das aves para abate.",
    },
    {
      id: "transferencia",
      titulo: "Outra instalação",
      texto:
        "Transferência das aves para outra instalação.",
    },
    {
      id: "sem-aves",
      titulo: "Sem aves remanescentes",
      texto:
        "Não se aplica — lote sem aves remanescentes.",
    },
  ];

export default function FinalizarLoteForm({
  loteId,
  quantidadeAtual,
  dataMinima,
  dataMaxima,
}: FinalizarLoteFormProps) {
  const formRef =
    useRef<HTMLFormElement>(null);

  const [modalAberto, setModalAberto] =
    useState(false);

  const [
    modeloMotivoSelecionado,
    setModeloMotivoSelecionado,
  ] = useState("");

  const [
    modeloDestinoSelecionado,
    setModeloDestinoSelecionado,
  ] = useState("");

  const [
    motivoEncerramento,
    setMotivoEncerramento,
  ] = useState("");

  const [destinoAves, setDestinoAves] =
    useState("");

  const [erroOculto, setErroOculto] =
    useState(false);

  function limparFormulario() {
    formRef.current?.reset();
    setModeloMotivoSelecionado("");
    setModeloDestinoSelecionado("");
    setMotivoEncerramento("");
    setDestinoAves("");
  }

  const [state, formAction, pendente] =
    useActionState(
      async (
        estadoAnterior: FinalizarLoteActionState,
        formData: FormData,
      ) => {
        const resultado =
          await finalizarLoteAction(
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

  function selecionarModeloMotivo(
    modeloId: string,
  ) {
    setModeloMotivoSelecionado(
      modeloId,
    );
    setErroOculto(true);

    if (!modeloId) {
      setMotivoEncerramento("");
      return;
    }

    const modelo = modelosMotivo.find(
      (item) => item.id === modeloId,
    );

    setMotivoEncerramento(
      modelo?.texto ?? "",
    );
  }

  function selecionarModeloDestino(
    modeloId: string,
  ) {
    setModeloDestinoSelecionado(
      modeloId,
    );
    setErroOculto(true);

    if (!modeloId) {
      setDestinoAves("");
      return;
    }

    const modelo = modelosDestino.find(
      (item) => item.id === modeloId,
    );

    setDestinoAves(modelo?.texto ?? "");
  }

  return (
    <>
      <button
        type="button"
        onClick={abrirModal}
        className="rounded-md border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50"
      >
        Finalizar lote
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
            aria-labelledby={`titulo-finalizar-lote-${loteId}`}
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
                    id={`titulo-finalizar-lote-${loteId}`}
                    className="text-lg font-bold text-gray-900"
                  >
                    Finalizar lote
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Registre o encerramento e o destino das aves.
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
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Aves atualmente vinculadas ao lote
                  </p>

                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {quantidadeAtual.toLocaleString(
                      "pt-BR",
                    )}{" "}
                    {quantidadeAtual === 1
                      ? "ave"
                      : "aves"}
                  </p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-semibold text-amber-800">
                    Atenção
                  </p>

                  <p className="mt-1 text-sm leading-5 text-amber-700">
                    A finalização libera o galpão e encerra os lançamentos deste lote. As aves remanescentes deixarão de contar na ocupação, mas não serão registradas como mortalidade ou descarte.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor={`data-encerramento-${loteId}`}
                    className="text-sm font-semibold text-gray-800"
                  >
                    Data de encerramento
                  </label>

                  <input
                    id={`data-encerramento-${loteId}`}
                    name="dataEncerramento"
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

                <div>
                  <label
                    htmlFor={`modelo-motivo-finalizacao-${loteId}`}
                    className="text-sm font-semibold text-gray-800"
                  >
                    Modelo de motivo
                  </label>

                  <select
                    id={`modelo-motivo-finalizacao-${loteId}`}
                    value={
                      modeloMotivoSelecionado
                    }
                    disabled={pendente}
                    onChange={(evento) =>
                      selecionarModeloMotivo(
                        evento.target.value,
                      )
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="">
                      Escrever por conta própria
                    </option>

                    {modelosMotivo.map(
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
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor={`motivo-finalizacao-${loteId}`}
                      className="text-sm font-semibold text-gray-800"
                    >
                      Motivo do encerramento
                    </label>

                    <span className="text-xs text-gray-400">
                      {
                        motivoEncerramento.length
                      }
                      /255
                    </span>
                  </div>

                  <textarea
                    id={`motivo-finalizacao-${loteId}`}
                    name="motivoEncerramento"
                    rows={3}
                    minLength={5}
                    maxLength={255}
                    required
                    disabled={pendente}
                    value={motivoEncerramento}
                    onChange={(evento) => {
                      setMotivoEncerramento(
                        evento.target.value,
                      );
                      setErroOculto(true);
                    }}
                    className="mt-2 w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
                    placeholder="Selecione um modelo ou informe o motivo do encerramento."
                  />
                </div>

                <div>
                  <label
                    htmlFor={`modelo-destino-finalizacao-${loteId}`}
                    className="text-sm font-semibold text-gray-800"
                  >
                    Modelo de destino
                  </label>

                  <select
                    id={`modelo-destino-finalizacao-${loteId}`}
                    value={
                      modeloDestinoSelecionado
                    }
                    disabled={pendente}
                    onChange={(evento) =>
                      selecionarModeloDestino(
                        evento.target.value,
                      )
                    }
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="">
                      Escrever por conta própria
                    </option>

                    {modelosDestino.map(
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
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor={`destino-aves-${loteId}`}
                      className="text-sm font-semibold text-gray-800"
                    >
                      Destino das aves
                    </label>

                    <span className="text-xs text-gray-400">
                      {destinoAves.length}/255
                    </span>
                  </div>

                  <textarea
                    id={`destino-aves-${loteId}`}
                    name="destinoAves"
                    rows={2}
                    minLength={2}
                    maxLength={255}
                    required
                    disabled={pendente}
                    value={destinoAves}
                    onChange={(evento) => {
                      setDestinoAves(
                        evento.target.value,
                      );
                      setErroOculto(true);
                    }}
                    className="mt-2 w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
                    placeholder="Selecione um modelo ou informe o destino das aves."
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-red-100 bg-red-50/60 px-4 py-3">
                  <input
                    type="checkbox"
                    required
                    disabled={pendente}
                    className="mt-0.5 h-4 w-4 accent-red-700"
                  />

                  <span className="text-sm leading-5 text-red-800">
                    Confirmo que revisei os dados e compreendo que o lote não poderá receber novos lançamentos após a finalização.
                  </span>
                </label>

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
                    ? "Finalizando..."
                    : "Confirmar finalização"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}