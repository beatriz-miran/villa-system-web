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
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-[#1B3B32]">
          Administração
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Editar usuário
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Atualize os dados cadastrais do usuário.
        </p>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <EditarUsuarioForm
            usuario={{
              id: usuario.usu_id,
              nome: usuario.usu_nome,
              email: usuario.usu_email,
              perfil: usuario.usu_perfil_acesso,
            }}
          />
        </section>
      </div>
    </div>
  );
}
