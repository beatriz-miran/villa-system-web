"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { alterarStatusLinhagem } from "@/application/linhagens/alterar-status-linhagem";
import { atualizarLinhagem } from "@/application/linhagens/atualizar-linhagem";
import { criarLinhagem } from "@/application/linhagens/criar-linhagem";
import type { MetaLinhagemInput } from "@/application/linhagens/meta-linhagem-schema";

export type CriarLinhagemActionState = {
  erro?: string;
};

export type AtualizarLinhagemActionState = {
  erro?: string;
};

export type AlterarStatusLinhagemActionState = {
  erro?: string;
};

function extrairMetas(formData: FormData): MetaLinhagemInput[] {
  const bruto = String(formData.get("metas") ?? "[]");

  let dados: unknown;

  try {
    dados = JSON.parse(bruto);
  } catch {
    return [];
  }

  if (!Array.isArray(dados)) {
    return [];
  }

  return dados.map((meta) => ({
    semana: Number(meta?.semana),
    pesoMetaGramas:
      meta?.pesoMetaGramas === null || meta?.pesoMetaGramas === ""
        ? null
        : Number(meta?.pesoMetaGramas),
    produtividadeMetaPercentual:
      meta?.produtividadeMetaPercentual === null ||
      meta?.produtividadeMetaPercentual === ""
        ? null
        : Number(meta?.produtividadeMetaPercentual),
  }));
}

export async function criarLinhagemAction(
  _prevState: CriarLinhagemActionState,
  formData: FormData
): Promise<CriarLinhagemActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para cadastrar linhagens.",
    };
  }

  const resultado = await criarLinhagem({
    nome: String(formData.get("nome") ?? ""),
    descricao: String(formData.get("descricao") ?? "") || undefined,
    tipoOvoId: Number(formData.get("tipoOvoId")),
    metas: extrairMetas(formData),
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/linhagens");
  redirect("/admin/linhagens");
}

export async function atualizarLinhagemAction(
  _prevState: AtualizarLinhagemActionState,
  formData: FormData
): Promise<AtualizarLinhagemActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para editar linhagens.",
    };
  }

  const id = Number(formData.get("id"));

  const resultado = await atualizarLinhagem({
    id,
    nome: String(formData.get("nome") ?? ""),
    descricao: String(formData.get("descricao") ?? "") || undefined,
    tipoOvoId: Number(formData.get("tipoOvoId")),
    metas: extrairMetas(formData),
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/linhagens");
  redirect("/admin/linhagens");
}

export async function alterarStatusLinhagemAction(
  _prevState: AlterarStatusLinhagemActionState,
  formData: FormData
): Promise<AlterarStatusLinhagemActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para alterar o status de linhagens.",
    };
  }

  const resultado = await alterarStatusLinhagem({
    id: Number(formData.get("id")),
    status: String(formData.get("status") ?? "") as
      | "ATIVO"
      | "INATIVO",
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/linhagens");

  return {};
}
