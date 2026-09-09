import {
  FileQuestion,
  House,
} from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4B324]/15 text-[#B77C00]">
          <FileQuestion size={29} />
        </div>

        <p className="mt-5 text-sm font-bold uppercase tracking-wider text-[#1B3B32]">
          Erro 404
        </p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Página não encontrada
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          O endereço acessado não existe ou a página pode
          ter sido movida.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26]"
        >
          <House size={17} />
          Voltar ao início
        </Link>
      </section>
    </main>
  );
}