import Image from "next/image";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { auth } from "@/auth";

import { sairDoSistema } from "./actions";
import AdminMobileHeader from "./components/AdminMobileHeader";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.perfil !== "ADMIN") {
    redirect("/operador");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <aside className="fixed left-0 top-0 hidden h-screen w-[250px] border-r border-gray-200 bg-white lg:block">
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B3B32]">
            <Image
              src="/imagens/logo-villa-system.svg"
              alt="Logo Villa System"
              width={42}
              height={34}
              priority
            />
          </div>

          <div>
            <h1 className="text-lg font-bold text-[#1B3B32]">
              Villa System
            </h1>

            <p className="text-xs text-gray-500">
              Área Administrativa
            </p>
          </div>
        </div>

        <nav className="px-4 py-5">
          <p className="mb-3 px-2 text-xs font-semibold uppercase text-gray-400">
            Gestão
          </p>

          <div className="space-y-1 text-sm">
            <div className="rounded-md bg-[#1B3B32] px-3 py-2.5 font-medium text-white">
              Visão Geral
            </div>

            <div className="rounded-md px-3 py-2.5 text-gray-600">
              Plantel & Lotes
            </div>

            <div className="rounded-md px-3 py-2.5 text-gray-600">
              Galpões
            </div>

            <div className="rounded-md px-3 py-2.5 text-gray-600">
              Produção de Ovos
            </div>

            <div className="rounded-md px-3 py-2.5 text-gray-600">
              Insumos & Estoque
            </div>

            <div className="rounded-md px-3 py-2.5 text-gray-600">
              Fornecedores
            </div>

            <div className="rounded-md px-3 py-2.5 text-gray-600">
              Financeiro
            </div>

            <div className="rounded-md px-3 py-2.5 text-gray-600">
              Relatórios
            </div>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 w-full border-t border-gray-200 p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-800">
              {session.user.name}
            </p>

            <p className="text-xs text-gray-500">
              Administrador
            </p>
          </div>

          <form action={sairDoSistema}>
            <button
              type="submit"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-left text-sm text-gray-600 transition hover:bg-gray-50 hover:text-[#1B3B32]"
            >
              Sair do Sistema
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:ml-[250px]">
        <AdminMobileHeader />

        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
