"use client";

import { useActionState } from "react";

import {
  criarGalpaoAction,
  CriarGalpaoActionState,
} from "@/app/admin/galpoes/actions";
import GalpaoFormFields from "@/app/admin/galpoes/components/GalpaoFormFields";

const estadoInicial: CriarGalpaoActionState = {};

export default function NovoGalpaoForm() {
  const [state, formAction, pendente] = useActionState(
    criarGalpaoAction,
    estadoInicial
  );

  return (
    <GalpaoFormFields
      formAction={formAction}
      pendente={pendente}
      erro={state.erro}
      submitLabel="Cadastrar galpão"
    />
  );
}
