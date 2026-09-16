"use client";

import { X } from "lucide-react";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  tipoBaixaLoteDescricao,
  tipoBaixaLoteLabel,
  tipoBaixaLoteValores,
  type TipoBaixaLote,
} from "@/application/lotes/tipo-baixa-lote";
import {
  registrarBaixaLoteAction,
  type RegistrarBaixaLoteActionState,
} from "@/app/admin/lotes/actions";

type RegistrarBaixaLoteFormProps = {
  loteId: number;
  quantidadeDisponivel: number;
  dataMinima: string;
  dataMaxima: string;
};

type ModeloMotivo = {
  id: string;
  titulo: string;
  texto: string;
};

const estadoInicial: RegistrarBaixaLoteActionState = {};

const modelosMotivo: Record<
  TipoBaixaLote,
  readonly ModeloMotivo[]
> = {
  MORTALIDADE: [
    {
      id: "rotina",
      titulo: "Inspeção de rotina",
      texto:
        "Mortalidade identificada durante a inspeção de rotina, sem causa aparente.",
    },
    {
      id: "adaptacao",
      titulo: "Período de adaptação",
      texto:
        "Mortalidade observada durante o período de adaptação ao galpão.",
    },
    {
      id: "debilidade",
      titulo: "Fraqueza ou debilidade",
      texto:
        "Mortalidade observada após sinais de fraqueza ou debilidade.",
    },
    {
      id: "acidente",
      titulo: "Acidente ou trauma",
      texto:
        "Mortalidade associada a acidente ou trauma aparente.",
    },
  ],

  DESCARTE: [
    {
      id: "sanitario",
      titulo: "Condição sanitária",
      texto:
        "Descarte realizado devido a condição sanitária observada.",
    },
    {
      id: "desempenho",
      titulo: "Baixo desempenho",
      texto:
        "Descarte realizado por baixo desempenho produtivo.",
    },
    {
      id: "lesao",
      titulo: "Lesão ou limitação física",
      texto:
        "Descarte realizado devido a lesão ou limitação física.",
    },
    {
      id: "manejo",
      titulo: "Decisão de manejo",
      texto:
        "Descarte preventivo realizado durante o manejo do lote.",
    },
  ],
};

export default function RegistrarBaixaLoteForm({
  loteId,
  quantidadeDisponivel,
  dataMinima,
  dataMaxima,
}: RegistrarBaixaLoteFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [modalAberto, setModalAberto] =
    useState(false);

  const [tipoSelecionado, setTipoSelecionado] =
    useState<TipoBaixaLote>("MORTALIDADE");

  const [
    modeloSelecionado,
    setModeloSelecionado,
  ] = useState("");

  const [motivo, setMotivo] = useState("");

  const [erroOculto, setErroOculto] =
    useState(false);

  function limparFormulario() {
    formRef.current?.reset();
    setTipoSelecionado("MORTALIDADE");
    setModeloSelecionado("");
    setMotivo("");
  }

  const [state, formAction, pendente] =
    useActionState(
      async (
        estadoAnterior: RegistrarBaixaLoteActionState,
        formData: FormData,
      ) => {
        const resultado =
          await registrarBaixaLoteAction(
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

  const modelosDisponiveis =
    modelosMotivo[tipoSelecionado];

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

  function selecionarTipo(
    tipo: TipoBaixaLote,
  ) {
    setTipoSelecionado(tipo);
    setModeloSelecionado("");
    setMotivo("");
    setErroOculto(true);
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

    const modelo = modelosDisponiveis.find(
      (item) => item.id === modeloId,
    );

    setMotivo(modelo?.texto ?? "");
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
        Registrar baixa
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
            aria-labelledby={`titulo-baixa-lote-${loteId}`}
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
                    id={`titulo-baixa-lote-${loteId}`}
                    className="text-lg font-bold text-gray-900"
                  >
                    Registrar baixa
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Informe a mortalidade ou o
                    descarte ocorrido neste lote.
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

                <fieldset>
                  <legend className="text-sm font-semibold text-gray-800">
                    Tipo da baixa
                  </legend>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {tipoBaixaLoteValores.map(
                      (tipo) => {
                        const selecionado =
                          tipoSelecionado === tipo;

                        return (
                          <label
                            key={tipo}
                            className={`cursor-pointer rounded-lg border p-4 transition ${
                              selecionado
                                ? "border-[#1B3B32] bg-[#F2F7F5]"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <span className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="tipo"
                                value={tipo}
                                checked={
                                  selecionado
                                }
                                disabled={pendente}
                                onChange={() =>
                                  selecionarTipo(
                                    tipo,
                                  )
                                }
                                className="mt-1 h-4 w-4 accent-[#1B3B32]"
                              />

                              <span>
                                <span className="block text-sm font-semibold text-gray-900">
                                  {
                                    tipoBaixaLoteLabel[
                                      tipo
                                    ]
                                  }
                                </span>

                                <span className="mt-1 block text-xs leading-5 text-gray-500">
                                  {
                                    tipoBaixaLoteDescricao[
                                      tipo
                                    ]
                                  }
                                </span>
                              </span>
                            </span>
                          </label>
                        );
                      },
                    )}
                  </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`quantidade-baixa-${loteId}`}
                      className="text-sm font-semibold text-gray-800"
                    >
                      Quantidade de aves
                    </label>

                    <input
                      id={`quantidade-baixa-${loteId}`}
                      name="quantidade"
                      type="number"
                      min={1}
                      max={quantidadeDisponivel}
                      step={1}
                      required
                      disabled={pendente}
                      onChange={() =>
                        setErroOculto(true)
                      }
                      className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
                      placeholder="Ex.: 3"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`data-baixa-${loteId}`}
                      className="text-sm font-semibold text-gray-800"
                    >
                      Data da ocorrência
                    </label>

                    <input
                      id={`data-baixa-${loteId}`}
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
                </div>

                <div>
                  <label
                    htmlFor={`modelo-motivo-baixa-${loteId}`}
                    className="text-sm font-semibold text-gray-800"
                  >
                    Modelo de motivo
                  </label>

                  <select
                    id={`modelo-motivo-baixa-${loteId}`}
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

                    {modelosDisponiveis.map(
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
                    Ao selecionar um modelo, o texto será preenchido e continuará editável.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor={`motivo-baixa-${loteId}`}
                      className="text-sm font-semibold text-gray-800"
                    >
                      Motivo
                    </label>

                    <span className="text-xs text-gray-400">
                      {motivo.length}/255
                    </span>
                  </div>

                  <textarea
                    id={`motivo-baixa-${loteId}`}
                    name="motivo"
                    rows={3}
                    minLength={3}
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
                    placeholder="Selecione um modelo ou escreva o motivo da baixa."
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
                    : "Confirmar baixa"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}