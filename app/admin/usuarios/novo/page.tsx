"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  criarUsuarioAction,
  CriarUsuarioActionState,
} from "@/app/admin/usuarios/actions";

const estadoInicial: CriarUsuarioActionState = {};

export default function NovoUsuarioPage() {
  const [state, formAction, pendente] = useActionState(
    criarUsuarioAction,
    estadoInicial
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-[#1B3B32]">
          Administração
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Novo usuário
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Cadastre um novo usuário para acesso ao Villa System.
        </p>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <form action={formAction} className="space-y-5">
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
                placeholder="Digite o nome"
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
                placeholder="Digite o e-mail"
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
                defaultValue=""
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
              >
                <option value="" disabled>
                  Selecione um perfil
                </option>

                <option value="ADMIN">
                  Administrador
                </option>

                <option value="OPERADOR">
                  Operador
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="senha"
                className="text-sm font-semibold text-gray-700"
              >
                Senha
              </label>

              <input
                id="senha"
                name="senha"
                type="password"
                required
                minLength={8}
                maxLength={72}
                placeholder="Mínimo de 8 caracteres"
                autoComplete="new-password"
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
              />
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
                  : "Cadastrar usuário"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}