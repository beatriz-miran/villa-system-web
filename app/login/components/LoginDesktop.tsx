"use client";

import {
  User,
  LockKeyhole,
  EyeOff,
  Eye,
  LogIn,
  Egg,
  Bird,
  ChartLine,
} from "lucide-react";

import Image from "next/image";
import { useActionState, useState } from "react";

import { autenticar } from "@/app/login/actions";

export default function LoginDesktop() {
  const [showPassword, setShowPassword] = useState(false);

  const [erro, formAction, pendente] = useActionState(
    autenticar,
    undefined
  );

  return (
    <section className="relative min-h-screen overflow-x-hidden">
      {/* Imagem de fundo */}
      <Image
        src="/imagens/b34908c95ef4ea109d869e43fbe8817f4c18a3d9.png"
        alt="Galinhas"
        fill
        priority
        className="object-cover"
      />

      {/* Fundo para celular e tablet */}
      <div className="absolute inset-0 bg-[#1B3B32]/80 lg:hidden" />

      {/* Gradiente usado no desktop */}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-[#1B3B32] from-0% via-[#1B3B32] via-40% to-transparent to-74% lg:block" />

      <div className="relative z-10 min-h-screen">
        {/* Logo */}
        <div className="relative z-20 flex flex-col items-center pt-6 text-white lg:absolute lg:left-1/2 lg:top-4 lg:-translate-x-1/2 lg:pt-0">
          <Image
            src="/imagens/logo-villa-system.svg"
            alt="Logo Villa System"
            width={100}
            height={78}
            priority
            className="lg:h-auto lg:w-[130px]"
          />

          <h2 className="-mt-2 text-[28px] font-bold leading-none lg:-mt-3 lg:text-[36px]">
            Villa System
          </h2>

          <p className="mt-2 text-center text-[13px] text-white/90 lg:text-[14px]">
            Gestão inteligente para a sua granja.
          </p>
        </div>

        {/* Texto institucional - somente desktop */}
        <div className="absolute left-[5%] top-1/2 hidden w-[400px] -translate-y-[38%] text-white lg:block">
          <h1 className="text-[44px] leading-[1.08] tracking-tight">
            Mais controle,
            <br />
            menos anotações,
            <br />
            mais <span className="font-bold">produtividade.</span>
          </h1>

          <div className="my-6 h-[3px] w-28 rounded-full bg-[#F4B324]" />

          <p className="max-w-[350px] text-[15px] leading-[1.45] text-white/90">
            O Villa System é um sistema de gestão desenvolvido para simplificar
            e profissionalizar a administração de pequenas e médias granjas
            avícolas.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex items-center gap-5">
              <div className="flex w-10 shrink-0 justify-center">
                <Egg className="h-8 w-8 text-[#F4B324]" />
              </div>

              <p className="max-w-[245px] text-[15px] leading-5 text-white/90">
                Acompanhe a produção
                <br />
                de ovos com precisão.
              </p>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex w-10 shrink-0 justify-center">
                <Bird className="h-8 w-8 text-[#F4B324]" />
              </div>

              <p className="max-w-[245px] text-[15px] leading-5 text-white/90">
                Gerencie o manejo
                <br />
                e o desempenho do plantel.
              </p>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex w-10 shrink-0 justify-center">
                <ChartLine className="h-8 w-8 text-[#F4B324]" />
              </div>

              <p className="max-w-[245px] text-[15px] leading-5 text-white/90">
                Tome decisões baseadas
                <br />
                em dados reais.
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="relative mx-auto mt-7 w-full max-w-[470px] px-4 pb-8 lg:absolute lg:left-1/2 lg:top-1/2 lg:mt-0 lg:w-[29%] lg:min-w-[440px] lg:max-w-[490px] lg:-translate-x-1/2 lg:-translate-y-[39%] lg:px-0 lg:pb-0">
          <div className="w-full rounded-2xl bg-white px-5 py-7 shadow-2xl sm:px-8 sm:py-9">
            {/* Cabeçalho */}
            <div className="mb-6 text-center">
              <h1 className="text-[22px] font-bold text-gray-900 sm:text-[23px]">
                Acesse sua conta
              </h1>

              <p className="mt-2 text-[14px] text-gray-500">
                Entre no sistema para gerenciar a sua granja.
              </p>
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="redirectTo" value="/" />

              {/* E-mail */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-[13px] font-bold text-gray-700"
                >
                  E-mail
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    autoComplete="email"
                    required
                    className="w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 text-[15px] text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-[13px] font-bold text-gray-700"
                >
                  Senha
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-md border border-gray-300 py-3 pl-10 pr-10 text-[15px] text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#1B3B32]"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Erro */}
              {erro && (
                <p
                  role="alert"
                  className="text-center text-[13px] font-medium text-red-600"
                >
                  {erro}
                </p>
              )}

              {/* Botão */}
              <button
                type="submit"
                disabled={pendente}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[#1B3B32] px-4 py-3 text-[14px] font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <LogIn size={18} />

                {pendente ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
