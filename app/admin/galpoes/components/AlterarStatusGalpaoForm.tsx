"use client";

import { useActionState, useState } from "react";

import {
  statusGalpaoLabel,
  statusGalpaoValores,
  type StatusGalpao,
} from "@/application/galpoes/status-galpao";

import { alterarStatusGalpaoAction } from "../actions";

type AlterarStatusGalpaoFormProps = {
  galpaoId: number;
  status: StatusGalpao;
};

export default function AlterarStatusGalpaoForm({
  galpaoId,
  status,
}: AlterarStatusGalpaoFormProps) {
  const [state, formAction, pendente] = useActionState(
    alterarStatusGalpaoAction,
    {}
  );

  const [valorSelecionado, setValorSelecionado] =
    useState<StatusGalpao>(status);

  const [erroOculto, setErroOculto] = useState(false);

  const statusAlterado = valorSelecionado !== status;
  const erroVisivel = erroOculto ? null : state.erro ?? null;

  function confirmarAlteracao(
    evento: React.FormEvent<HTMLFormElement>
  ) {
    if (!statusAlterado) {
      evento.preventDefault();
      return;
    }

    const confirmou = window.confirm(
      `Confirma a alteração do status do galpão de ` +
        `"${statusGalpaoLabel[status]}" para ` +
        `"${statusGalpaoLabel[valorSelecionado]}"?`
    );

    if (!confirmou) {
      evento.preventDefault();
      return;
    }

    setErroOculto(false);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <form
        action={formAction}
        onSubmit={confirmarAlteracao}
        className="flex items-center justify-end gap-2"
      >
        <input type="hidden" name="id" value={galpaoId} />

        <label
          htmlFor={`status-galpao-${galpaoId}`}
          className="sr-only"
        >
          Status do galpão
        </label>

        <select
          id={`status-galpao-${galpaoId}`}
          name="status"
          value={valorSelecionado}
          disabled={pendente}
          onChange={(evento) => {
            setValorSelecionado(
              evento.target.value as StatusGalpao
            );
            setErroOculto(true);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {statusGalpaoValores.map((valor) => (
            <option key={valor} value={valor}>
              {statusGalpaoLabel[valor]}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={pendente || !statusAlterado}
          className="rounded-lg bg-[#173f35] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0f2f28] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pendente ? "Salvando..." : "Salvar"}
        </button>
      </form>

      {erroVisivel ? (
        <p
          role="alert"
          className="max-w-xs text-right text-sm text-red-600"
        >
          {erroVisivel}
        </p>
      ) : null}
    </div>
  );
}