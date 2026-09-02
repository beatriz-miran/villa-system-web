"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  atualizarLinhagemAction,
  AtualizarLinhagemActionState,
  criarLinhagemAction,
  CriarLinhagemActionState,
} from "@/app/admin/linhagens/actions";

type MetaLinha = {
  semana: string;
  pesoMetaGramas: string;
  consumoMetaGramas: string;
  produtividadeMetaPercentual: string;
};

type LinhagemFormProps = {
  tiposOvo: {
    tov_id: number;
    tov_nome: string;
  }[];
} & (
  | {
      modo: "criar";
    }
  | {
      modo: "editar";
      linhagem: {
        id: number;
        nome: string;
        descricao: string | null;
        tipoOvoId: number;
        metas: {
          semana: number;
          pesoMetaGramas: number | null;
          consumoMetaGramas: number | null;
          produtividadeMetaPercentual: number | null;
        }[];
      };
    }
);

const estadoInicialCriar: CriarLinhagemActionState = {};
const estadoInicialAtualizar: AtualizarLinhagemActionState = {};

function metaParaLinha(meta: {
  semana: number;
  pesoMetaGramas: number | null;
  consumoMetaGramas: number | null;
  produtividadeMetaPercentual: number | null;
}): MetaLinha {
  return {
    semana: String(meta.semana),
    pesoMetaGramas:
      meta.pesoMetaGramas === null ? "" : String(meta.pesoMetaGramas),
    consumoMetaGramas:
      meta.consumoMetaGramas === null
        ? ""
        : String(meta.consumoMetaGramas),
    produtividadeMetaPercentual:
      meta.produtividadeMetaPercentual === null
        ? ""
        : String(meta.produtividadeMetaPercentual),
  };
}

function proximaSemana(metas: MetaLinha[]) {
  const semanas = metas
    .map((meta) => Number(meta.semana))
    .filter((semana) => Number.isInteger(semana) && semana > 0);

  if (semanas.length === 0) {
    return 1;
  }

  return Math.max(...semanas) + 1;
}

export default function LinhagemForm(props: LinhagemFormProps) {
  const { tiposOvo, modo } = props;
  const semTiposOvo = tiposOvo.length === 0;

  const [estadoCriar, acaoCriar, pendenteCriar] = useActionState(
    criarLinhagemAction,
    estadoInicialCriar
  );

  const [estadoAtualizar, acaoAtualizar, pendenteAtualizar] =
    useActionState(atualizarLinhagemAction, estadoInicialAtualizar);

  const state = modo === "criar" ? estadoCriar : estadoAtualizar;
  const formAction = modo === "criar" ? acaoCriar : acaoAtualizar;
  const pendente = modo === "criar" ? pendenteCriar : pendenteAtualizar;

  const [metas, setMetas] = useState<MetaLinha[]>(
    modo === "editar" ? props.linhagem.metas.map(metaParaLinha) : []
  );

  function adicionarMeta() {
    setMetas((atual) => [
      ...atual,
      {
        semana: String(proximaSemana(atual)),
        pesoMetaGramas: "",
        consumoMetaGramas: "",
        produtividadeMetaPercentual: "",
      },
    ]);
  }

  function removerMeta(indice: number) {
    setMetas((atual) => atual.filter((_, i) => i !== indice));
  }

  function atualizarMeta(
    indice: number,
    campo: keyof MetaLinha,
    valor: string
  ) {
    setMetas((atual) =>
      atual.map((meta, i) =>
        i === indice ? { ...meta, [campo]: valor } : meta
      )
    );
  }

  const metasParaEnvio = metas.map((meta) => ({
    semana: Number(meta.semana),
    pesoMetaGramas:
      meta.pesoMetaGramas === "" ? null : Number(meta.pesoMetaGramas),
    consumoMetaGramas:
      meta.consumoMetaGramas === ""
        ? null
        : Number(meta.consumoMetaGramas),
    produtividadeMetaPercentual:
      meta.produtividadeMetaPercentual === ""
        ? null
        : Number(meta.produtividadeMetaPercentual),
  }));

  return (
    <form action={formAction} className="space-y-5">
      {modo === "editar" && (
        <input
          type="hidden"
          name="id"
          value={props.linhagem.id}
        />
      )}

      <input
        type="hidden"
        name="metas"
        value={JSON.stringify(metasParaEnvio)}
      />

      <div>
        <label
          htmlFor="nome"
          className="text-sm font-semibold text-gray-700"
        >
          Nome
        </label>

        <input
          id="nome"
          name="nome"
          type="text"
          required
          maxLength={100}
          placeholder="Digite o nome da linhagem"
          defaultValue={modo === "editar" ? props.linhagem.nome : ""}
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
        />
      </div>

      <div>
        <label
          htmlFor="descricao"
          className="text-sm font-semibold text-gray-700"
        >
          Descrição
        </label>

        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          maxLength={255}
          placeholder="Descreva características da linhagem (opcional)"
          defaultValue={
            modo === "editar" ? (props.linhagem.descricao ?? "") : ""
          }
          className="mt-2 w-full resize-none rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
        />
      </div>

      <div>
        <label
          htmlFor="tipoOvoId"
          className="text-sm font-semibold text-gray-700"
        >
          Tipo de ovo
        </label>

        <select
          id="tipoOvoId"
          name="tipoOvoId"
          required
          disabled={semTiposOvo}
          aria-describedby={
            semTiposOvo ? "aviso-sem-tipos-ovo" : undefined
          }
          defaultValue={
            modo === "editar" ? props.linhagem.tipoOvoId : ""
          }
          className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
        >
          <option value="" disabled>
            {semTiposOvo
              ? "Nenhum tipo de ovo disponível"
              : "Selecione um tipo de ovo"}
          </option>

          {tiposOvo.map((tipoOvo) => (
            <option key={tipoOvo.tov_id} value={tipoOvo.tov_id}>
              {tipoOvo.tov_nome}
            </option>
          ))}
        </select>

        {semTiposOvo && (
          <p
            id="aviso-sem-tipos-ovo"
            role="alert"
            className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
          >
            Nenhum tipo de ovo está cadastrado. Cadastre os tipos de ovo
            antes de criar uma linhagem.
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            Metas semanais
          </p>

          <button
            type="button"
            onClick={adicionarMeta}
            className="text-sm font-medium text-[#1B3B32] transition hover:underline"
          >
            + Adicionar semana
          </button>
        </div>

        {metas.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            Nenhuma meta cadastrada para esta linhagem.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {metas.map((meta, indice) => (
              <div
                key={indice}
                className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 p-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
              >
                <div>
                  <label
                    htmlFor={`meta-semana-${indice}`}
                    className="text-xs font-medium text-gray-500"
                  >
                    Semana
                  </label>

                  <input
                    id={`meta-semana-${indice}`}
                    type="number"
                    min={1}
                    required
                    value={meta.semana}
                    onChange={(event) =>
                      atualizarMeta(indice, "semana", event.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`meta-peso-${indice}`}
                    className="text-xs font-medium text-gray-500"
                  >
                    Peso meta (g)
                  </label>

                  <input
                    id={`meta-peso-${indice}`}
                    type="number"
                    min={0.01}
                    step="0.01"
                    placeholder="—"
                    value={meta.pesoMetaGramas}
                    onChange={(event) =>
                      atualizarMeta(
                        indice,
                        "pesoMetaGramas",
                        event.target.value
                      )
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`meta-consumo-${indice}`}
                    className="text-xs font-medium text-gray-500"
                  >
                    Consumo de ração (g/ave/dia)
                  </label>

                  <input
                    id={`meta-consumo-${indice}`}
                    type="number"
                    min={0.01}
                    step="0.01"
                    placeholder="—"
                    value={meta.consumoMetaGramas}
                    onChange={(event) =>
                      atualizarMeta(
                        indice,
                        "consumoMetaGramas",
                        event.target.value
                      )
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`meta-produtividade-${indice}`}
                    className="text-xs font-medium text-gray-500"
                  >
                    Produtividade (%)
                  </label>

                  <input
                    id={`meta-produtividade-${indice}`}
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    placeholder="—"
                    value={meta.produtividadeMetaPercentual}
                    onChange={(event) =>
                      atualizarMeta(
                        indice,
                        "produtividadeMetaPercentual",
                        event.target.value
                      )
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <button
                    type="button"
                    onClick={() => removerMeta(indice)}
                    className="text-sm font-medium text-red-600 transition hover:underline"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {state.erro && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          {state.erro}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link
          href="/admin/linhagens"
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={pendente || semTiposOvo}
          className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pendente
            ? "Salvando..."
            : modo === "criar"
              ? "Cadastrar linhagem"
              : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
