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

type ExtrairMetasResultado =
  | {
      sucesso: true;
      metas: MetaLinhagemInput[];
    }
  | {
      sucesso: false;
      mensagem: string;
    };

function extrairMetas(formData: FormData): ExtrairMetasResultado {
  const campoMetas = formData.get("metas");

  if (typeof campoMetas !== "string") {
    return {
      sucesso: false,
      mensagem: "Os dados das metas semanais não foram enviados.",
    };
  }

  const bruto = campoMetas;

  let dados: unknown;

  try {
    dados = JSON.parse(bruto);
  } catch {
    return {
      sucesso: false,
      mensagem:
        "Não foi possível ler as metas semanais. Atualize a página e tente novamente.",
    };
  }

  if (!Array.isArray(dados)) {
    return {
      sucesso: false,
      mensagem: "Os dados das metas semanais são inválidos.",
    };
  }

  return {
    sucesso: true,
    metas: dados.map((meta) => ({
      semana: Number(meta?.semana),
      pesoMetaGramas:
        meta?.pesoMetaGramas === null || meta?.pesoMetaGramas === ""
          ? null
          : Number(meta?.pesoMetaGramas),
      consumoMetaGramas:
        meta?.consumoMetaGramas === null ||
        meta?.consumoMetaGramas === ""
          ? null
          : Number(meta?.consumoMetaGramas),
      produtividadeMetaPercentual:
        meta?.produtividadeMetaPercentual === null ||
        meta?.produtividadeMetaPercentual === ""
          ? null
          : Number(meta?.produtividadeMetaPercentual),
    })),
  };
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

  const metasResultado = extrairMetas(formData);

  if (!metasResultado.sucesso) {
    return {
      erro: metasResultado.mensagem,
    };
  }

  const resultado = await criarLinhagem({
    nome: String(formData.get("nome") ?? ""),
    descricao: String(formData.get("descricao") ?? "") || undefined,
    tipoOvoId: Number(formData.get("tipoOvoId")),
    metas: metasResultado.metas,
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

  const metasResultado = extrairMetas(formData);

  if (!metasResultado.sucesso) {
    return {
      erro: metasResultado.mensagem,
    };
  }

  const id = Number(formData.get("id"));

  const resultado = await atualizarLinhagem({
    id,
    nome: String(formData.get("nome") ?? ""),
    descricao: String(formData.get("descricao") ?? "") || undefined,
    tipoOvoId: Number(formData.get("tipoOvoId")),
    metas: metasResultado.metas,
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
