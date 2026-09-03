"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { alterarStatusFornecedor } from "@/application/fornecedores/alterar-status-fornecedor";
import { atualizarFornecedor } from "@/application/fornecedores/atualizar-fornecedor";
import {
  buscarDadosCnpj,
  BuscarDadosCnpjResultado,
} from "@/application/fornecedores/buscar-dados-cnpj";
import { criarFornecedor } from "@/application/fornecedores/criar-fornecedor";

export type CriarFornecedorActionState = {
  erro?: string;
};

export type AtualizarFornecedorActionState = {
  erro?: string;
};

export type AlterarStatusFornecedorActionState = {
  erro?: string;
};

function extrairCampoOpcional(formData: FormData, campo: string) {
  const valor = String(formData.get(campo) ?? "").trim();

  return valor.length > 0 ? valor : undefined;
}

export async function buscarDadosCnpjAction(
  cnpj: string
): Promise<BuscarDadosCnpjResultado> {
  const session = await auth();

  if (!session?.user) {
    return {
      sucesso: false,
      mensagem: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      sucesso: false,
      mensagem: "Você não possui permissão para consultar dados de CNPJ.",
    };
  }

  return buscarDadosCnpj(cnpj);
}

export async function criarFornecedorAction(
  _prevState: CriarFornecedorActionState,
  formData: FormData
): Promise<CriarFornecedorActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para cadastrar fornecedores.",
    };
  }

  const resultado = await criarFornecedor({
    razaoSocial: String(formData.get("razaoSocial") ?? ""),
    nomeFantasia: extrairCampoOpcional(formData, "nomeFantasia"),
    cnpj: String(formData.get("cnpj") ?? ""),
    email: String(formData.get("email") ?? ""),
    telefonePrincipal: String(formData.get("telefonePrincipal") ?? ""),
    telefoneSecundario: extrairCampoOpcional(
      formData,
      "telefoneSecundario"
    ),
    cep: extrairCampoOpcional(formData, "cep"),
    logradouro: extrairCampoOpcional(formData, "logradouro"),
    numero: extrairCampoOpcional(formData, "numero"),
    bairro: extrairCampoOpcional(formData, "bairro"),
    cidade: extrairCampoOpcional(formData, "cidade"),
    estado: extrairCampoOpcional(formData, "estado"),
    categoriaId: Number(formData.get("categoriaId")),
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/fornecedores");
  redirect("/admin/fornecedores");
}

export async function atualizarFornecedorAction(
  _prevState: AtualizarFornecedorActionState,
  formData: FormData
): Promise<AtualizarFornecedorActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para editar fornecedores.",
    };
  }

  const resultado = await atualizarFornecedor({
    id: Number(formData.get("id")),
    razaoSocial: String(formData.get("razaoSocial") ?? ""),
    nomeFantasia: extrairCampoOpcional(formData, "nomeFantasia"),
    cnpj: String(formData.get("cnpj") ?? ""),
    email: String(formData.get("email") ?? ""),
    telefonePrincipal: String(formData.get("telefonePrincipal") ?? ""),
    telefoneSecundario: extrairCampoOpcional(
      formData,
      "telefoneSecundario"
    ),
    cep: extrairCampoOpcional(formData, "cep"),
    logradouro: extrairCampoOpcional(formData, "logradouro"),
    numero: extrairCampoOpcional(formData, "numero"),
    bairro: extrairCampoOpcional(formData, "bairro"),
    cidade: extrairCampoOpcional(formData, "cidade"),
    estado: extrairCampoOpcional(formData, "estado"),
    categoriaId: Number(formData.get("categoriaId")),
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/fornecedores");
  redirect("/admin/fornecedores");
}

export async function alterarStatusFornecedorAction(
  _prevState: AlterarStatusFornecedorActionState,
  formData: FormData
): Promise<AlterarStatusFornecedorActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro: "Você não possui permissão para alterar o status de fornecedores.",
    };
  }

  const resultado = await alterarStatusFornecedor({
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

  revalidatePath("/admin/fornecedores");

  return {};
}
