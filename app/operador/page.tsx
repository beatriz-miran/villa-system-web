import {
  AlertTriangle,
  Bird,
  ClipboardCheck,
  Egg,
  LogOut,
  QrCode,
} from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";

export default async function OperadorPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.perfil !== "OPERADOR") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Cabeçalho */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B3B32]">
              <Image
                src="/imagens/logo-villa-system.svg"
                alt="Logo Villa System"
                width={38}
                height={30}
                priority
              />
            </div>

            <div>
              <p className="font-bold text-[#1B3B32]">
                Villa System
              </p>

              <p className="text-xs text-gray-500">
                Área Operacional
              </p>
            </div>
          </div>

          <form
            action={async () => {
              "use server";

              await signOut({
                redirectTo: "/login",
              });
            }}
          >
            <button
              type="submit"
              aria-label="Sair do sistema"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-[#1B3B32]"
            >
              <LogOut size={18} />

              <span className="hidden sm:inline">
                Sair
              </span>
            </button>
          </form>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Saudação */}
        <section>
          <p className="text-sm text-gray-500">
            Área do Operador
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            Olá, {session.user.name}.
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Acesse rapidamente as principais atividades da granja.
          </p>
        </section>

        {/* Ações rápidas */}
        <section className="mt-7">
          <h2 className="text-base font-bold text-gray-900">
            Ações rápidas
          </h2>

          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            <button
              type="button"
              className="flex min-h-[125px] flex-col items-start justify-between rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1B3B32]/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F4B324]/15 text-[#B77C00]">
                <Egg size={23} />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900">
                  Produção
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Registrar ovos
                </p>
              </div>
            </button>

            <button
              type="button"
              className="flex min-h-[125px] flex-col items-start justify-between rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1B3B32]/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                <Bird size={23} />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900">
                  Mortalidade
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Registrar aves
                </p>
              </div>
            </button>

            <button
              type="button"
              className="flex min-h-[125px] flex-col items-start justify-between rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1B3B32]/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                <AlertTriangle size={23} />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900">
                  Ocorrência
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Registrar evento
                </p>
              </div>
            </button>

            <button
              type="button"
              className="flex min-h-[125px] flex-col items-start justify-between rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1B3B32]/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B3B32]/10 text-[#1B3B32]">
                <QrCode size={23} />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900">
                  QR Code
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Acessar lote
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Tarefas */}
        <section className="mt-7">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1B3B32]/10 text-[#1B3B32]">
                <ClipboardCheck size={22} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Tarefas de hoje
                </h2>

                <p className="text-xs text-gray-500">
                  Atividades previstas para o manejo diário.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-[#F8FAFC] px-4 py-5 text-center">
              <p className="text-sm font-medium text-gray-600">
                As tarefas do dia aparecerão aqui.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                O painel será integrado aos dados da granja nas próximas etapas.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}