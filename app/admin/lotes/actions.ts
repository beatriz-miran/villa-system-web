"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { atualizarLote } from "@/application/lotes/atualizar-lote";
import { criarLote } from "@/application/lotes/criar-lote";
import { estornarBaixaLote } from "@/application/lotes/estornar-baixa-lote";
import { finalizarLote } from "@/application/lotes/finalizar-lote";
import { registrarBaixaLote } from "@/application/lotes/registrar-baixa-lote";
import type { TipoBaixaLote } from "@/application/lotes/tipo-baixa-lote";
import { auth } from "@/auth";

export type CriarLoteActionState = {
  erro?: string;
};

export type AtualizarLoteActionState = {
  erro?: string;
};

export type RegistrarBaixaLoteActionState = {
  erro?: string;
  sucesso?: boolean;
};

export type EstornarBaixaLoteActionState = {
  erro?: string;
  sucesso?: boolean;
};

export type FinalizarLoteActionState = {
  erro?: string;
  sucesso?: boolean;
};

function extrairNumero(
  formData: FormData,
  campo: string,
) {
  const valor = formData.get(campo);

  return valor ? Number(valor) : NaN;
}

function extrairData(
  formData: FormData,
  campo: string,
) {
  const valor = formData.get(campo);

  return new Date(String(valor ?? ""));
}

export async function criarLoteAction(
  _prevState: CriarLoteActionState,
  formData: FormData,
): Promise<CriarLoteActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro:
        "Você não possui permissão para cadastrar lotes.",
    };
  }

  const resultado = await criarLote({
    linhagemId: extrairNumero(
      formData,
      "linhagemId",
    ),
    galpaoId: extrairNumero(
      formData,
      "galpaoId",
    ),
    fornecedorId: extrairNumero(
      formData,
      "fornecedorId",
    ),
    quantidadeInicial: extrairNumero(
      formData,
      "quantidadeInicial",
    ),
    idadeInicialDias: extrairNumero(
      formData,
      "idadeInicialDias",
    ),
    dataAlojamento: extrairData(
      formData,
      "dataAlojamento",
    ),
    registradoPorId: Number(
      session.user.id,
    ),
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
  formData: FormData,
): Promise<AtualizarLoteActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro:
        "Você não possui permissão para editar lotes.",
    };
  }

  const resultado = await atualizarLote({
    id: extrairNumero(formData, "id"),
    linhagemId: extrairNumero(
      formData,
      "linhagemId",
    ),
    galpaoId: extrairNumero(
      formData,
      "galpaoId",
    ),
    fornecedorId: extrairNumero(
      formData,
      "fornecedorId",
    ),
    quantidadeInicial: extrairNumero(
      formData,
      "quantidadeInicial",
    ),
    idadeInicialDias: extrairNumero(
      formData,
      "idadeInicialDias",
    ),
    dataAlojamento: extrairData(
      formData,
      "dataAlojamento",
    ),
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/lotes");
  redirect("/admin/lotes");
}

export async function registrarBaixaLoteAction(
  _prevState: RegistrarBaixaLoteActionState,
  formData: FormData,
): Promise<RegistrarBaixaLoteActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro:
        "Você não possui permissão para registrar baixas no lote.",
    };
  }

  const loteId = extrairNumero(
    formData,
    "loteId",
  );

  const resultado =
    await registrarBaixaLote({
      loteId,
      usuarioId: Number(
        session.user.id,
      ),
      tipo: String(
        formData.get("tipo") ?? "",
      ) as TipoBaixaLote,
      quantidade: extrairNumero(
        formData,
        "quantidade",
      ),
      data: extrairData(
        formData,
        "data",
      ),
      motivo: String(
        formData.get("motivo") ?? "",
      ),
    });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/lotes");
  revalidatePath(
    `/admin/lotes/${loteId}`,
  );

  return {
    sucesso: true,
  };
}

export async function estornarBaixaLoteAction(
  _prevState: EstornarBaixaLoteActionState,
  formData: FormData,
): Promise<EstornarBaixaLoteActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro:
        "Você não possui permissão para estornar baixas do lote.",
    };
  }

  const resultado =
    await estornarBaixaLote({
      baixaId: extrairNumero(
        formData,
        "baixaId",
      ),
      usuarioId: Number(
        session.user.id,
      ),
      motivo: String(
        formData.get("motivo") ?? "",
      ),
    });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/lotes");
  revalidatePath(
    `/admin/lotes/${resultado.loteId}`,
  );

  return {
    sucesso: true,
  };
}

export async function finalizarLoteAction(
  _prevState: FinalizarLoteActionState,
  formData: FormData,
): Promise<FinalizarLoteActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (session.user.perfil !== "ADMIN") {
    return {
      erro:
        "Você não possui permissão para finalizar lotes.",
    };
  }

  const loteId = extrairNumero(
    formData,
    "loteId",
  );

  const resultado = await finalizarLote({
    loteId,
    dataEncerramento: extrairData(
      formData,
      "dataEncerramento",
    ),
    motivoEncerramento: String(
      formData.get(
        "motivoEncerramento",
      ) ?? "",
    ),
    destinoAves: String(
      formData.get("destinoAves") ?? "",
    ),
  });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/admin/lotes");
  revalidatePath(
    `/admin/lotes/${loteId}`,
  );

  return {
    sucesso: true,
  };
}