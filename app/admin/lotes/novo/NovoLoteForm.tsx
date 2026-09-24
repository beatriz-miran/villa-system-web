"use client";

import { useActionState } from "react";

import {
  criarLoteAction,
  type CriarLoteActionState,
} from "@/app/admin/lotes/actions";
import LoteFormFields from "@/app/admin/lotes/components/LoteFormFields";

type NovoLoteFormProps = {
  linhagens: {
    lin_id: number;
    lin_nome: string;
    lin_densidade_maxima_aves_m2: number | null;
  }[];
  galpoes: {
    gal_id: number;
    gal_nome: string;
    gal_area_m2: number;
  }[];
  fornecedores: {
    for_id: number;
    for_razao_social: string;
    for_nome_fantasia: string | null;
  }[];
};

const estadoInicial: CriarLoteActionState = {};

export default function NovoLoteForm({
  linhagens,
  galpoes,
  fornecedores,
}: NovoLoteFormProps) {
  const [state, formAction, pendente] = useActionState(
    criarLoteAction,
    estadoInicial,
  );

  return (
    <LoteFormFields
      formAction={formAction}
      pendente={pendente}
      erro={state.erro}
      submitLabel="Cadastrar lote"
      linhagens={linhagens}
      galpoes={galpoes}
      fornecedores={fornecedores}
    />
  );
}