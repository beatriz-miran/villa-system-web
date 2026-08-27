"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { alterarStatusUsuario } from "@/application/usuarios/alterar-status-usuario";
import { atualizarUsuario } from "@/application/usuarios/atualizar-usuario";
import { criarUsuario } from "@/application/usuarios/criar-usuario";

export type CriarUsuarioActionState = {
  erro?: string;
};

export type AtualizarUsuarioActionState = {
  erro?: string;
};

export type AlterarStatusUsuarioActionState = {
  erro?: string;
};

export async function criarUsuarioAction(
  _prevState: CriarUsuarioActionState,
  formData: FormData
): Promise<CriarUsuarioActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para cadastrar usuários.",
    };
  }

  const resultado = await criarUsuario({
    nome: String(formData.get("nome") ?? ""),
    email: String(formData.get("email") ?? ""),
    perfil: String(formData.get("perfil") ?? "") as
      | "ADMIN"
      | "OPERADOR",
    senha: String(formData.get("senha") ?? ""),
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function atualizarUsuarioAction(
  _prevState: AtualizarUsuarioActionState,
  formData: FormData
): Promise<AtualizarUsuarioActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para editar usuários.",
    };
  }

  const id = Number(formData.get("id"));

  const resultado = await atualizarUsuario({
    id,
    nome: String(formData.get("nome") ?? ""),
    email: String(formData.get("email") ?? ""),
    perfil: String(formData.get("perfil") ?? "") as
      | "ADMIN"
      | "OPERADOR",
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function alterarStatusUsuarioAction(
  _prevState: AlterarStatusUsuarioActionState,
  formData: FormData
): Promise<AlterarStatusUsuarioActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para alterar o status de usuários.",
    };
  }

  const usuarioLogadoId = Number(session.user.id);

  if (!Number.isInteger(usuarioLogadoId) || usuarioLogadoId <= 0) {
    return {
      erro: "Não foi possível identificar o usuário autenticado.",
    };
  }

  const resultado = await alterarStatusUsuario({
    id: Number(formData.get("id")),
    status: String(formData.get("status") ?? "") as
      | "ATIVO"
      | "INATIVO",
    usuarioLogadoId,
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/usuarios");

  return {};
}
