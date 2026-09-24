import Link from "next/link";
import { notFound } from "next/navigation";

import { buscarUsuario } from "@/application/usuarios/buscar-usuario";

type VisualizarUsuarioPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const campoClassName =
  "rounded-lg border border-gray-100 bg-gray-50 p-4";

const rotuloClassName =
  "text-xs font-semibold uppercase tracking-wide text-gray-400";

const valorClassName =
  "mt-1 break-words text-sm font-medium text-gray-900";

export default async function VisualizarUsuarioPage({
  params,
}: VisualizarUsuarioPageProps) {
  const { id } = await params;
  const usuarioId = Number(id);
  const usuario = await buscarUsuario(usuarioId);

  if (!usuario) {
    notFound();
  }

  const perfil =
    usuario.usu_perfil_acesso === "ADMIN"
      ? "Administrador"
      : "Operador";

  const status = usuario.usu_status ?? "INATIVO";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1B3B32]">
              Administração / Usuários
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {usuario.usu_nome}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Visualização dos dados cadastrais e do nível de acesso do
              usuário.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/usuarios"
              className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Voltar
            </Link>

            <Link
              href={`/admin/usuarios/${usuario.usu_id}/editar`}
              className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#142d26]"
            >
              Editar usuário
            </Link>
          </div>
        </header>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900">
              Informações do usuário
            </h2>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                status === "ATIVO"
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {status}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className={campoClassName}>
              <p className={rotuloClassName}>
                Nome completo
              </p>

              <p className={valorClassName}>
                {usuario.usu_nome}
              </p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>E-mail</p>

              <p className={valorClassName}>
                {usuario.usu_email}
              </p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>
                Perfil de acesso
              </p>

              <p className={valorClassName}>
                {perfil}
              </p>
            </div>

            <div className={campoClassName}>
              <p className={rotuloClassName}>Status</p>

              <p className={valorClassName}>
                {status}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
          <h2 className="text-sm font-bold text-blue-900">
            Permissões no sistema
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            {usuario.usu_perfil_acesso === "ADMIN"
              ? "Este usuário possui acesso administrativo e pode gerenciar cadastros, usuários e configurações do Villa System."
              : "Este usuário possui acesso operacional às funcionalidades liberadas para acompanhamento e registro das atividades da granja."}
          </p>
        </section>
      </div>
    </div>
  );
}