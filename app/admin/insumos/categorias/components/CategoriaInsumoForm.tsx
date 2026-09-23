"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  atualizarCategoriaInsumoAction,
  AtualizarCategoriaInsumoActionState,
  criarCategoriaInsumoAction,
  CriarCategoriaInsumoActionState,
} from "@/app/admin/insumos/categorias/actions";
import { TIPOS_CATEGORIA_INSUMO } from "@/application/insumos/insumo-opcoes";

type CategoriaInsumoFormProps =
  | {
      modo: "criar";
    }
  | {
      modo: "editar";
      categoria: {
        id: number;
        descricao: string;
        tipo: string;
      };
    };

const estadoInicialCriar: CriarCategoriaInsumoActionState = {};
const estadoInicialAtualizar: AtualizarCategoriaInsumoActionState = {};

export default function CategoriaInsumoForm(props: CategoriaInsumoFormProps) {
  const { modo } = props;

  const [estadoCriar, acaoCriar, pendenteCriar] = useActionState(
    criarCategoriaInsumoAction,
    estadoInicialCriar
  );

  const [estadoAtualizar, acaoAtualizar, pendenteAtualizar] =
    useActionState(atualizarCategoriaInsumoAction, estadoInicialAtualizar);

  const state = modo === "criar" ? estadoCriar : estadoAtualizar;
  const formAction = modo === "criar" ? acaoCriar : acaoAtualizar;
  const pendente = modo === "criar" ? pendenteCriar : pendenteAtualizar;

  return (
    <form action={formAction} className="space-y-5">
      {modo === "editar" && (
        <input type="hidden" name="id" value={props.categoria.id} />
      )}

      <div>
        <label
          htmlFor="descricao"
          className="text-sm font-semibold text-gray-700"
        >
          Descrição
        </label>

        <input
          id="descricao"
          name="descricao"
          type="text"
          required
          maxLength={100}
          placeholder="Digite a descrição da categoria"
          defaultValue={modo === "editar" ? props.categoria.descricao : ""}
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
        />
      </div>

      <div>
        <label
          htmlFor="tipo"
          className="text-sm font-semibold text-gray-700"
        >
          Tipo
        </label>

        <select
          id="tipo"
          name="tipo"
          required
          defaultValue={modo === "editar" ? props.categoria.tipo : ""}
          className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
        >
          <option value="" disabled>
            Selecione o tipo da categoria
          </option>

          {TIPOS_CATEGORIA_INSUMO.map((tipo) => (
            <option key={tipo.valor} value={tipo.valor}>
              {tipo.rotulo}
            </option>
          ))}
        </select>
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
          href="/admin/insumos/categorias"
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={pendente}
          className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pendente
            ? "Salvando..."
            : modo === "criar"
              ? "Cadastrar categoria"
              : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
