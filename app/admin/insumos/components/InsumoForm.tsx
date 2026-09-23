"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  atualizarInsumoAction,
  AtualizarInsumoActionState,
  criarInsumoAction,
  CriarInsumoActionState,
} from "@/app/admin/insumos/actions";
import {
  FASES_APLICACAO_INSUMO,
  UNIDADES_MEDIDA_INSUMO,
} from "@/application/insumos/insumo-opcoes";

type InsumoFormProps = {
  categorias: {
    cti_id: number;
    cti_descricao: string;
  }[];
} & (
  | {
      modo: "criar";
    }
  | {
      modo: "editar";
      insumo: {
        id: number;
        nome: string;
        composicao: string | null;
        faseAplicacao: string;
        unidadeMedida: string;
        pontoRessuprimento: number;
        diasCarencia: number;
        categoriaId: number;
      };
    }
);

const estadoInicialCriar: CriarInsumoActionState = {};
const estadoInicialAtualizar: AtualizarInsumoActionState = {};

export default function InsumoForm(props: InsumoFormProps) {
  const { categorias, modo } = props;
  const semCategorias = categorias.length === 0;

  const [estadoCriar, acaoCriar, pendenteCriar] = useActionState(
    criarInsumoAction,
    estadoInicialCriar
  );

  const [estadoAtualizar, acaoAtualizar, pendenteAtualizar] =
    useActionState(atualizarInsumoAction, estadoInicialAtualizar);

  const state = modo === "criar" ? estadoCriar : estadoAtualizar;
  const formAction = modo === "criar" ? acaoCriar : acaoAtualizar;
  const pendente = modo === "criar" ? pendenteCriar : pendenteAtualizar;

  return (
    <form action={formAction} className="space-y-5">
      {modo === "editar" && (
        <input type="hidden" name="id" value={props.insumo.id} />
      )}

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
          placeholder="Digite o nome do insumo"
          defaultValue={modo === "editar" ? props.insumo.nome : ""}
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="categoriaId"
            className="text-sm font-semibold text-gray-700"
          >
            Categoria
          </label>

          <Link
            href="/admin/insumos/categorias/novo"
            className="text-sm font-medium text-[#1B3B32] transition hover:underline"
          >
            + Nova categoria
          </Link>
        </div>

        <select
          id="categoriaId"
          name="categoriaId"
          required
          disabled={semCategorias}
          aria-describedby={
            semCategorias ? "aviso-sem-categorias" : undefined
          }
          defaultValue={
            modo === "editar" ? props.insumo.categoriaId : ""
          }
          className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
        >
          <option value="" disabled>
            {semCategorias
              ? "Nenhuma categoria disponível"
              : "Selecione uma categoria"}
          </option>

          {categorias.map((categoria) => (
            <option key={categoria.cti_id} value={categoria.cti_id}>
              {categoria.cti_descricao}
            </option>
          ))}
        </select>

        {semCategorias && (
          <p
            id="aviso-sem-categorias"
            role="alert"
            className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
          >
            Nenhuma categoria de insumo está cadastrada. Cadastre as
            categorias antes de criar um insumo.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="composicao"
          className="text-sm font-semibold text-gray-700"
        >
          Composição
        </label>

        <textarea
          id="composicao"
          name="composicao"
          rows={3}
          maxLength={255}
          placeholder="Descreva a composição do insumo (opcional)"
          defaultValue={
            modo === "editar" ? (props.insumo.composicao ?? "") : ""
          }
          className="mt-2 w-full resize-none rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="faseAplicacao"
            className="text-sm font-semibold text-gray-700"
          >
            Fase de aplicação
          </label>

          <select
            id="faseAplicacao"
            name="faseAplicacao"
            required
            defaultValue={
              modo === "editar" ? props.insumo.faseAplicacao : ""
            }
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
          >
            <option value="" disabled>
              Selecione a fase de aplicação
            </option>

            {FASES_APLICACAO_INSUMO.map((fase) => (
              <option key={fase.valor} value={fase.valor}>
                {fase.rotulo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="unidadeMedida"
            className="text-sm font-semibold text-gray-700"
          >
            Unidade de medida
          </label>

          <select
            id="unidadeMedida"
            name="unidadeMedida"
            required
            defaultValue={
              modo === "editar" ? props.insumo.unidadeMedida : ""
            }
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
          >
            <option value="" disabled>
              Selecione a unidade de medida
            </option>

            {UNIDADES_MEDIDA_INSUMO.map((unidade) => (
              <option key={unidade.valor} value={unidade.valor}>
                {unidade.rotulo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="pontoRessuprimento"
            className="text-sm font-semibold text-gray-700"
          >
            Ponto de ressuprimento
          </label>

          <input
            id="pontoRessuprimento"
            name="pontoRessuprimento"
            type="number"
            min={0}
            step="0.001"
            required
            placeholder="0"
            defaultValue={
              modo === "editar" ? props.insumo.pontoRessuprimento : 0
            }
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
          />

          <p className="mt-1 text-xs text-gray-500">
            Quantidade mínima em estoque para gerar alerta de reposição.
          </p>
        </div>

        <div>
          <label
            htmlFor="diasCarencia"
            className="text-sm font-semibold text-gray-700"
          >
            Dias de carência
          </label>

          <input
            id="diasCarencia"
            name="diasCarencia"
            type="number"
            min={0}
            step={1}
            required
            placeholder="0"
            defaultValue={
              modo === "editar" ? props.insumo.diasCarencia : 0
            }
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
          />

          <p className="mt-1 text-xs text-gray-500">
            Informe 0 quando não houver período de carência aplicável.
          </p>
        </div>
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
          href="/admin/insumos"
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={pendente || semCategorias}
          className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pendente
            ? "Salvando..."
            : modo === "criar"
              ? "Cadastrar insumo"
              : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
