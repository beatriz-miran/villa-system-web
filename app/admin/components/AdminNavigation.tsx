"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavigationProps = {
  onNavigate?: () => void;
};

const itensComRota = [
  {
    nome: "Visão Geral",
    href: "/admin",
  },
  {
    nome: "Usuários",
    href: "/admin/usuarios",
  },
  {
    nome: "Linhagens",
    href: "/admin/linhagens",
  },
];

const itensFuturos = [
  "Plantel & Lotes",
  "Galpões",
  "Produção de Ovos",
  "Insumos & Estoque",
  "Fornecedores",
  "Financeiro",
  "Relatórios",
];

export default function AdminNavigation({
  onNavigate,
}: AdminNavigationProps) {
  const pathname = usePathname();

  function estaAtivo(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <nav className="px-4 py-5">
      <p className="mb-3 px-2 text-xs font-semibold uppercase text-gray-400">
        Gestão
      </p>

      <div className="space-y-1 text-sm">
        {itensComRota.map((item) => {
          const ativo = estaAtivo(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`block rounded-md px-3 py-2.5 transition ${
                ativo
                  ? "bg-[#1B3B32] font-medium text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#1B3B32]"
              }`}
            >
              {item.nome}
            </Link>
          );
        })}

        {itensFuturos.map((item) => (
          <div
            key={item}
            className="rounded-md px-3 py-2.5 text-gray-500"
          >
            {item}
          </div>
        ))}
      </div>
    </nav>
  );
}
