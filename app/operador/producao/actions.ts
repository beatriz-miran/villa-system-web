"use server";

import { revalidatePath } from "next/cache";

import { estornarProducaoLote } from "@/application/producao-ovos/estornar-producao-lote";
import { registrarProducaoLote } from "@/application/producao-ovos/registrar-producao-lote";
import { auth } from "@/auth";

export type RegistrarProducaoLoteActionState = {
  erro?: string;
  sucesso?: boolean;
};

export type EstornarProducaoLoteActionState = {
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

export async function registrarProducaoLoteAction(
  _prevState: RegistrarProducaoLoteActionState,
  formData: FormData,
): Promise<RegistrarProducaoLoteActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (
    session.user.perfil !== "OPERADOR" &&
    session.user.perfil !== "ADMIN"
  ) {
    return {
      erro:
        "Você não possui permissão para registrar produção no lote.",
    };
  }

  const loteId = extrairNumero(
    formData,
    "loteId",
  );

  const resultado =
    await registrarProducaoLote({
      loteId,
      usuarioId: Number(
        session.user.id,
      ),
      quantidadeComercial: extrairNumero(
        formData,
        "quantidadeComercial",
      ),
      quantidadePerda: extrairNumero(
        formData,
        "quantidadePerda",
      ),
      data: extrairData(
        formData,
        "data",
      ),
    });

  if (!resultado.sucesso) {
    return {
      erro: resultado.mensagem,
    };
  }

  revalidatePath("/operador/producao");
  revalidatePath(
    `/operador/producao/${loteId}`,
  );

  return {
    sucesso: true,
  };
}

export async function estornarProducaoLoteAction(
  _prevState: EstornarProducaoLoteActionState,
  formData: FormData,
): Promise<EstornarProducaoLoteActionState> {
  const session = await auth();

  if (!session?.user) {
    return {
      erro: "Sua sessão expirou. Entre novamente no sistema.",
    };
  }

  if (
    session.user.perfil !== "OPERADOR" &&
    session.user.perfil !== "ADMIN"
  ) {
    return {
      erro:
        "Você não possui permissão para estornar produção do lote.",
    };
  }

  const resultado =
    await estornarProducaoLote({
      movimentoId: extrairNumero(
        formData,
        "movimentoId",
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

  revalidatePath("/operador/producao");
  revalidatePath(
    `/operador/producao/${resultado.loteId}`,
  );

  return {
    sucesso: true,
  };
}
