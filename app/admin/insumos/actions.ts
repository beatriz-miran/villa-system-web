"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type {
  insumo_ins_fase_aplicacao,
  insumo_ins_unidade_medida,
} from "@/generated/prisma/client";
import { alterarStatusInsumo } from "@/application/insumos/alterar-status-insumo";
import { atualizarInsumo } from "@/application/insumos/atualizar-insumo";
import { criarInsumo } from "@/application/insumos/criar-insumo";

export type CriarInsumoActionState = {
  erro?: string;
};

export type AtualizarInsumoActionState = {
  erro?: string;
};

export type AlterarStatusInsumoActionState = {
  erro?: string;
};

export async function criarInsumoAction(
  _prevState: CriarInsumoActionState,
  formData: FormData
): Promise<CriarInsumoActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para cadastrar insumos.",
    };
  }

  const resultado = await criarInsumo({
    nome: String(formData.get("nome") ?? ""),
    composicao: String(formData.get("composicao") ?? "") || undefined,
    faseAplicacao: String(
      formData.get("faseAplicacao") ?? ""
    ) as insumo_ins_fase_aplicacao,
    unidadeMedida: String(
      formData.get("unidadeMedida") ?? ""
    ) as insumo_ins_unidade_medida,
    pontoRessuprimento: Number(formData.get("pontoRessuprimento")),
    diasCarencia: Number(formData.get("diasCarencia")),
    categoriaId: Number(formData.get("categoriaId")),
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/insumos");
  redirect("/admin/insumos");
}

export async function atualizarInsumoAction(
  _prevState: AtualizarInsumoActionState,
  formData: FormData
): Promise<AtualizarInsumoActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para editar insumos.",
    };
  }

  const resultado = await atualizarInsumo({
    id: Number(formData.get("id")),
    nome: String(formData.get("nome") ?? ""),
    composicao: String(formData.get("composicao") ?? "") || undefined,
    faseAplicacao: String(
      formData.get("faseAplicacao") ?? ""
    ) as insumo_ins_fase_aplicacao,
    unidadeMedida: String(
      formData.get("unidadeMedida") ?? ""
    ) as insumo_ins_unidade_medida,
    pontoRessuprimento: Number(formData.get("pontoRessuprimento")),
    diasCarencia: Number(formData.get("diasCarencia")),
    categoriaId: Number(formData.get("categoriaId")),
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/insumos");
  redirect("/admin/insumos");
}

export async function alterarStatusInsumoAction(
  _prevState: AlterarStatusInsumoActionState,
  formData: FormData
): Promise<AlterarStatusInsumoActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para alterar o status de insumos.",
    };
  }

  const resultado = await alterarStatusInsumo({
    id: Number(formData.get("id")),
    status: String(formData.get("status") ?? "") as "ATIVO" | "INATIVO",
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/insumos");

  return {};
}
