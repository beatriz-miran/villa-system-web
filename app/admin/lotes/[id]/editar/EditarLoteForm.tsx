"use client";

import { useActionState } from "react";

import {
  atualizarLoteAction,
  AtualizarLoteActionState,
} from "@/app/admin/lotes/actions";
import LoteFormFields from "@/app/admin/lotes/components/LoteFormFields";

type EditarLoteFormProps = {
  lote: {
    id: number;
    linhagemId: number;
    galpaoId: number;
    fornecedorId: number;
    quantidadeInicial: string;
    dataAlojamento: string;
  };
  linhagens: {
    lin_id: number;
    lin_nome: string;
  }[];
  galpoes: {
    gal_id: number;
    gal_nome: string;
    gal_area_m2: unknown;
  }[];
  fornecedores: {
    for_id: number;
    for_razao_social: string;
    for_nome_fantasia: string | null;
  }[];
};

const estadoInicial: AtualizarLoteActionState = {};

export default function EditarLoteForm({
  lote,
  linhagens,
  galpoes,
  fornecedores,
}: EditarLoteFormProps) {
  const [state, formAction, pendente] = useActionState(
    atualizarLoteAction,
    estadoInicial
  );

  return (
    <LoteFormFields
      formAction={formAction}
      pendente={pendente}
      erro={state.erro}
      submitLabel="Salvar alterações"
      loteId={lote.id}
      linhagens={linhagens}
      galpoes={galpoes}
      fornecedores={fornecedores}
      valoresIniciais={{
        linhagemId: lote.linhagemId,
        galpaoId: lote.galpaoId,
        fornecedorId: lote.fornecedorId,
        quantidadeInicial: lote.quantidadeInicial,
        dataAlojamento: lote.dataAlojamento,
      }}
    />
  );
}
