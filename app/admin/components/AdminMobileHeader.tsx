"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

import { sairDoSistema } from "../actions";

export default function AdminMobileHeader() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
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
              Área Administrativa
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          className="rounded-md p-2 text-gray-700 transition hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
      </header>

      {menuAberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuAberto(false)}
            className="absolute inset-0 bg-black/40"
          />

          <aside className="absolute right-0 top-0 flex h-full w-[280px] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <p className="font-bold text-[#1B3B32]">
                Menu
              </p>

              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
                className="rounded-md p-2 text-gray-600 transition hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <p className="mb-3 px-2 text-xs font-semibold uppercase text-gray-400">
                Gestão
              </p>

              <div className="space-y-1 text-sm">
                <Link
                  href="/admin"
                  onClick={() => setMenuAberto(false)}
                  className="block rounded-md bg-[#1B3B32] px-3 py-2.5 font-medium text-white"
                >
                  Visão Geral
                </Link>

                <div className="rounded-md px-3 py-2.5 text-gray-500">
                  Plantel & Lotes
                </div>

                <div className="rounded-md px-3 py-2.5 text-gray-500">
                  Galpões
                </div>

                <div className="rounded-md px-3 py-2.5 text-gray-500">
                  Produção de Ovos
                </div>

                <div className="rounded-md px-3 py-2.5 text-gray-500">
                  Insumos & Estoque
                </div>

                <div className="rounded-md px-3 py-2.5 text-gray-500">
                  Fornecedores
                </div>

                <div className="rounded-md px-3 py-2.5 text-gray-500">
                  Financeiro
                </div>

                <div className="rounded-md px-3 py-2.5 text-gray-500">
                  Relatórios
                </div>
              </div>
            </nav>

            <div className="border-t border-gray-200 p-4">
              <form action={sairDoSistema}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-gray-600 transition hover:bg-gray-50 hover:text-[#1B3B32]"
                >
                  <LogOut size={18} />

                  Sair do Sistema
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
