"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  criarUsuarioAction,
  CriarUsuarioActionState,
} from "@/app/admin/usuarios/actions";
import UsuarioFormFields from "@/app/admin/usuarios/components/UsuarioFormFields";

const estadoInicial: CriarUsuarioActionState = {};

export default function NovoUsuarioPage() {
  const [state, formAction, pendente] = useActionState(
    criarUsuarioAction,
    estadoInicial
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração / Usuários
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Novo usuário
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Cadastre os dados pessoais e defina o nível de acesso ao
              Villa System.
            </p>
          </div>

          <Link
            href="/admin/usuarios"
            className="self-start rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Voltar
          </Link>
        </header>

        <UsuarioFormFields
          formAction={formAction}
          pendente={pendente}
          erro={state.erro}
          submitLabel="Cadastrar usuário"
          exibirSenha
        />
      </div>
    </div>
  );
}