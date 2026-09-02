"use client";

import {
  AlertTriangle,
  House,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  retry: () => void;
};

export default function ErrorPage({
  error,
  retry,
}: ErrorPageProps) {
  useEffect(() => {
    console.error(
      "Erro inesperado na aplicação:",
      error
    );
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle size={28} />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-gray-900">
          Algo não saiu como esperado
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Não foi possível carregar esta página. Você pode
          tentar novamente ou voltar para o início do
          sistema.
        </p>

        {error.digest && (
          <p className="mt-3 text-xs text-gray-400">
            Código de referência: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26]"
          >
            <RefreshCw size={17} />
            Tentar novamente
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <House size={17} />
            Voltar ao início
          </Link>
        </div>
      </section>
    </main>
  );
}