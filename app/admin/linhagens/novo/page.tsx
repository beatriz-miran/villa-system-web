import { listarTiposOvo } from "@/application/linhagens/listar-tipos-ovo";
import LinhagemForm from "@/app/admin/linhagens/components/LinhagemForm";

export default async function NovaLinhagemPage() {
  const tiposOvo = await listarTiposOvo();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-[#1B3B32]">
          Administração
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Nova linhagem
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Cadastre uma nova linhagem no catálogo do Villa System.
        </p>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <LinhagemForm modo="criar" tiposOvo={tiposOvo} />
        </section>
      </div>
    </div>
  );
}
