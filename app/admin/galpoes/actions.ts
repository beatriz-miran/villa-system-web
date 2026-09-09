"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { alterarStatusGalpao } from "@/application/galpoes/alterar-status-galpao";
import { atualizarGalpao } from "@/application/galpoes/atualizar-galpao";
import { criarGalpao } from "@/application/galpoes/criar-galpao";
import { StatusGalpao } from "@/application/galpoes/status-galpao";

export type CriarGalpaoActionState = {
  erro?: string;
};

export type AtualizarGalpaoActionState = {
  erro?: string;
};

export type AlterarStatusGalpaoActionState = {
  erro?: string;
};

export async function criarGalpaoAction(
  _prevState: CriarGalpaoActionState,
  formData: FormData
): Promise<CriarGalpaoActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para cadastrar galpões.",
    };
  }

  const resultado = await criarGalpao({
    nome: String(formData.get("nome") ?? ""),
    areaM2: Number(formData.get("areaM2")),
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/galpoes");
  redirect("/admin/galpoes");
}

export async function atualizarGalpaoAction(
  _prevState: AtualizarGalpaoActionState,
  formData: FormData
): Promise<AtualizarGalpaoActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para editar galpões.",
    };
  }

  const resultado = await atualizarGalpao({
    id: Number(formData.get("id")),
    nome: String(formData.get("nome") ?? ""),
    areaM2: Number(formData.get("areaM2")),
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/galpoes");
  redirect("/admin/galpoes");
}

export async function alterarStatusGalpaoAction(
  _prevState: AlterarStatusGalpaoActionState,
  formData: FormData
): Promise<AlterarStatusGalpaoActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para alterar o status de galpões.",
    };
  }

  const resultado = await alterarStatusGalpao({
    id: Number(formData.get("id")),
    status: String(formData.get("status") ?? "") as StatusGalpao,
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/galpoes");

  return {};
}
