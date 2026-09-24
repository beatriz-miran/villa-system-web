"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { categoria_insumo_cti_tipo } from "@/generated/prisma/client";
import { atualizarCategoriaInsumo } from "@/application/insumos/atualizar-categoria-insumo";
import { criarCategoriaInsumo } from "@/application/insumos/criar-categoria-insumo";

export type CriarCategoriaInsumoActionState = {
  erro?: string;
};

export type AtualizarCategoriaInsumoActionState = {
  erro?: string;
};

export async function criarCategoriaInsumoAction(
  _prevState: CriarCategoriaInsumoActionState,
  formData: FormData
): Promise<CriarCategoriaInsumoActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para cadastrar categorias de insumo.",
    };
  }

  const resultado = await criarCategoriaInsumo({
    descricao: String(formData.get("descricao") ?? ""),
    tipo: String(formData.get("tipo") ?? "") as categoria_insumo_cti_tipo,
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/insumos/categorias");
  revalidatePath("/admin/insumos");
  redirect("/admin/insumos/categorias");
}

export async function atualizarCategoriaInsumoAction(
  _prevState: AtualizarCategoriaInsumoActionState,
  formData: FormData
): Promise<AtualizarCategoriaInsumoActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para editar categorias de insumo.",
    };
  }

  const resultado = await atualizarCategoriaInsumo({
    id: Number(formData.get("id")),
    descricao: String(formData.get("descricao") ?? ""),
    tipo: String(formData.get("tipo") ?? "") as categoria_insumo_cti_tipo,
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/insumos/categorias");
  revalidatePath("/admin/insumos");
  redirect("/admin/insumos/categorias");
}
