import Link from "next/link";
import { notFound } from "next/navigation";

import { buscarUsuario } from "@/application/usuarios/buscar-usuario";

import EditarUsuarioForm from "./EditarUsuarioForm";

type EditarUsuarioPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarUsuarioPage({
  params,
}: EditarUsuarioPageProps) {
  const { id } = await params;
  const usuarioId = Number(id);
  const usuario = await buscarUsuario(usuarioId);

  if (!usuario) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração / Usuários
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Editar usuário
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Atualize os dados pessoais e o nível de acesso do usuário.
            </p>
          </div>

          <Link
            href="/admin/usuarios"
            className="self-start rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Voltar
          </Link>
        </header>

        <EditarUsuarioForm
          usuario={{
            id: usuario.usu_id,
            nome: usuario.usu_nome,
            email: usuario.usu_email,
            perfil: usuario.usu_perfil_acesso,
          }}
        />
      </div>
    </div>
  );
}