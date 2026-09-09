"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  atualizarUsuarioAction,
  AtualizarUsuarioActionState,
} from "@/app/admin/usuarios/actions";

type EditarUsuarioFormProps = {
  usuario: {
    id: number;
    nome: string;
    email: string;
    perfil: "ADMIN" | "OPERADOR";
  };
};

const estadoInicial: AtualizarUsuarioActionState = {};

export default function EditarUsuarioForm({
  usuario,
}: EditarUsuarioFormProps) {
  const [state, formAction, pendente] = useActionState(
    atualizarUsuarioAction,
    estadoInicial
  );

  return (
    <form action={formAction} className="space-y-5">
      <input
        type="hidden"
        name="id"
        value={usuario.id}
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
          minLength={2}
          maxLength={100}
          defaultValue={usuario.nome}
          autoComplete="name"
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="text-sm font-semibold text-gray-700"
        >
          E-mail
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={150}
          defaultValue={usuario.email}
          autoComplete="email"
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
        />
      </div>

      <div>
        <label
          htmlFor="perfil"
          className="text-sm font-semibold text-gray-700"
        >
          Perfil
        </label>

        <select
          id="perfil"
          name="perfil"
          required
          defaultValue={usuario.perfil}
          className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
        >
          <option value="ADMIN">
            Administrador
          </option>

          <option value="OPERADOR">
            Operador
          </option>
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
          href="/admin/usuarios"
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
            : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}