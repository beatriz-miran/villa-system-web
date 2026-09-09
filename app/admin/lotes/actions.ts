"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { atualizarLote } from "@/application/lotes/atualizar-lote";
import { criarLote } from "@/application/lotes/criar-lote";

export type CriarLoteActionState = {
  erro?: string;
};

export type AtualizarLoteActionState = {
  erro?: string;
};

function extrairNumero(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return valor ? Number(valor) : NaN;
}

function extrairData(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return new Date(String(valor ?? ""));
}

export async function criarLoteAction(
  _prevState: CriarLoteActionState,
  formData: FormData
): Promise<CriarLoteActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para cadastrar lotes.",
    };
  }

  const resultado = await criarLote({
    linhagemId: extrairNumero(formData, "linhagemId"),
    galpaoId: extrairNumero(formData, "galpaoId"),
    fornecedorId: extrairNumero(formData, "fornecedorId"),
    quantidadeInicial: extrairNumero(formData, "quantidadeInicial"),
    dataAlojamento: extrairData(formData, "dataAlojamento"),
    registradoPorId: Number(session.user.id),
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/lotes");
  redirect("/admin/lotes");
}

export async function atualizarLoteAction(
  _prevState: AtualizarLoteActionState,
  formData: FormData
): Promise<AtualizarLoteActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para editar lotes.",
    };
  }

  const resultado = await atualizarLote({
    id: extrairNumero(formData, "id"),
    linhagemId: extrairNumero(formData, "linhagemId"),
    galpaoId: extrairNumero(formData, "galpaoId"),
    fornecedorId: extrairNumero(formData, "fornecedorId"),
    quantidadeInicial: extrairNumero(formData, "quantidadeInicial"),
    dataAlojamento: extrairData(formData, "dataAlojamento"),
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/lotes");
  redirect("/admin/lotes");
}
