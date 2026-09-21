"use client";

import {
  Check,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type PerfilUsuario = "ADMIN" | "OPERADOR";

type UsuarioFormFieldsProps = {
  formAction: (formData: FormData) => void;
  pendente: boolean;
  erro?: string;
  submitLabel: string;
  usuarioId?: number;
  exibirSenha?: boolean;
  valoresIniciais?: {
    nome: string;
    email: string;
    perfil: PerfilUsuario;
  };
};

const inputClassName =
  "mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20";

const labelClassName = "text-sm font-semibold text-gray-700";

const perfis: {
  valor: PerfilUsuario;
  nome: string;
  descricao: string;
}[] = [
  {
    valor: "ADMIN",
    nome: "Administrador",
    descricao:
      "Acesso às configurações, cadastros e recursos administrativos.",
  },
  {
    valor: "OPERADOR",
    nome: "Operador",
    descricao:
      "Acesso às funcionalidades operacionais permitidas pelo sistema.",
  },
];

export default function UsuarioFormFields({
  formAction,
  pendente,
  erro,
  submitLabel,
  usuarioId,
  exibirSenha = false,
  valoresIniciais,
}: UsuarioFormFieldsProps) {
  const [nome, setNome] = useState(valoresIniciais?.nome ?? "");
  const [email, setEmail] = useState(valoresIniciais?.email ?? "");
  const [perfil, setPerfil] = useState<PerfilUsuario | "">(
    valoresIniciais?.perfil ?? ""
  );
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const identificacaoCompleta =
    nome.trim().length >= 2 && emailValido;

  const perfilCompleto = perfil !== "";
  const senhaCompleta = !exibirSenha || senha.length >= 8;

  const perfilSelecionado = perfis.find(
    (item) => item.valor === perfil
  );

  return (
    <form
      action={formAction}
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(19rem,0.85fr)]"
    >
      {usuarioId ? (
        <input type="hidden" name="id" value={usuarioId} />
      ) : null}

      {erro ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 xl:col-span-2"
        >
          {erro}
        </p>
      ) : null}

      <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <section className="border-b border-gray-200 p-5 sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
              1
            </span>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Dados pessoais
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Informe o nome e o e-mail utilizados para identificar o
                usuário.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="nome" className={labelClassName}>
                Nome
              </label>

              <input
                id="nome"
                name="nome"
                type="text"
                required
                minLength={2}
                maxLength={100}
                placeholder="Digite o nome completo"
                autoComplete="name"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClassName}>
                E-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={150}
                placeholder="usuario@exemplo.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
              />

              <p className="mt-2 text-xs text-gray-500">
                O e-mail será utilizado para entrar no sistema.
              </p>
            </div>
          </div>
        </section>

        <section className="p-5 sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
              2
            </span>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Acesso ao sistema
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Defina o perfil e as credenciais de acesso do usuário.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="perfil" className={labelClassName}>
                Perfil de acesso
              </label>

              <select
                id="perfil"
                name="perfil"
                required
                value={perfil}
                onChange={(event) =>
                  setPerfil(event.target.value as PerfilUsuario)
                }
                className={`${inputClassName} bg-white`}
              >
                <option value="" disabled>
                  Selecione um perfil
                </option>

                {perfis
                  .toSorted((a, b) =>
                    a.nome.localeCompare(b.nome, "pt-BR")
                  )
                  .map((item) => (
                    <option key={item.valor} value={item.valor}>
                      {item.nome}
                    </option>
                  ))}
              </select>

              {perfilSelecionado ? (
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {perfilSelecionado.descricao}
                </p>
              ) : null}
            </div>

            {exibirSenha ? (
              <div>
                <label htmlFor="senha" className={labelClassName}>
                  Senha
                </label>

                <div className="relative">
                  <input
                    id="senha"
                    name="senha"
                    type={mostrarSenha ? "text" : "password"}
                    required
                    minLength={8}
                    maxLength={72}
                    placeholder="Mínimo de 8 caracteres"
                    autoComplete="new-password"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    className={`${inputClassName} pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha((atual) => !atual)}
                    aria-label={
                      mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                    }
                    aria-pressed={mostrarSenha}
                    className="absolute bottom-2.5 right-3 rounded text-gray-500 transition hover:text-[#1B3B32] focus:outline-none focus:ring-2 focus:ring-[#1B3B32]/30"
                  >
                    {mostrarSenha ? (
                      <EyeOff aria-hidden="true" className="h-5 w-5" />
                    ) : (
                      <Eye aria-hidden="true" className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <p
                  className={`mt-2 text-xs ${
                    senha.length > 0 && !senhaCompleta
                      ? "text-amber-700"
                      : "text-gray-500"
                  }`}
                >
                  A senha deve possuir entre 8 e 72 caracteres.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-white p-5 sm:flex-row sm:justify-end xl:hidden">
          <Link
            href="/admin/usuarios"
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={pendente}
            className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pendente ? "Salvando..." : submitLabel}
          </button>
        </div>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Resumo do usuário
              </p>

              <h2 className="mt-2 break-words text-lg font-bold text-gray-900">
                {nome.trim() || "Novo usuário"}
              </h2>

              <p className="mt-1 break-all text-sm text-gray-500">
                {email.trim() || "E-mail não informado"}
              </p>
            </div>

            <UserRound
              aria-hidden="true"
              className="h-6 w-6 shrink-0 text-[#1B3B32]"
            />
          </div>

          <div className="mt-5 rounded-lg bg-[#F2F7F5] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Perfil de acesso
            </p>

            <p className="mt-2 text-base font-bold text-[#1B3B32]">
              {perfilSelecionado?.nome ?? "Não selecionado"}
            </p>

            {perfilSelecionado ? (
              <p className="mt-1 text-xs leading-5 text-gray-600">
                {perfilSelecionado.descricao}
              </p>
            ) : null}
          </div>

          <ul className="mt-5 divide-y divide-gray-100" aria-live="polite">
            <li className="flex items-start gap-3 py-3">
              {identificacaoCompleta ? (
                <Check
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                />
              ) : (
                <Circle
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-gray-300"
                />
              )}

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Identificação
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  {identificacaoCompleta
                    ? "Nome e e-mail preenchidos"
                    : "Informe nome e e-mail válido"}
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 py-3">
              {perfilCompleto ? (
                <Check
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                />
              ) : (
                <Circle
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-gray-300"
                />
              )}

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Perfil de acesso
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  {perfilCompleto
                    ? perfilSelecionado?.nome
                    : "Selecione o nível de acesso"}
                </p>
              </div>
            </li>

            {exibirSenha ? (
              <li className="flex items-start gap-3 py-3">
                {senhaCompleta ? (
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  />
                ) : (
                  <Circle
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-gray-300"
                  />
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Senha inicial
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {senhaCompleta
                      ? "Quantidade mínima atendida"
                      : "Mínimo de 8 caracteres"}
                  </p>
                </div>
              </li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            {exibirSenha ? (
              <KeyRound
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
              />
            ) : (
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
              />
            )}

            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                {exibirSenha
                  ? "Credencial de acesso"
                  : "Alteração de perfil"}
              </h3>

              <p className="mt-1 text-xs leading-5 text-amber-800">
                {exibirSenha
                  ? "Compartilhe a senha inicial somente com o usuário responsável pelo acesso."
                  : "Mudanças no perfil alteram as funcionalidades disponíveis para esse usuário."}
              </p>
            </div>
          </div>
        </section>

        <section className="hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm xl:block">
          <button
            type="submit"
            disabled={pendente}
            className="w-full rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pendente ? "Salvando..." : submitLabel}
          </button>

          <Link
            href="/admin/usuarios"
            className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </section>
      </aside>
    </form>
  );
}