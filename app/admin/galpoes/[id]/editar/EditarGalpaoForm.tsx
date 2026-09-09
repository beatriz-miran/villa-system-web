"use client";

import { useActionState } from "react";

import {
  atualizarGalpaoAction,
  AtualizarGalpaoActionState,
} from "@/app/admin/galpoes/actions";
import GalpaoFormFields from "@/app/admin/galpoes/components/GalpaoFormFields";

type EditarGalpaoFormProps = {
  galpao: {
    id: number;
    nome: string;
    areaM2: string;
  };
};

const estadoInicial: AtualizarGalpaoActionState = {};

export default function EditarGalpaoForm({
  galpao,
}: EditarGalpaoFormProps) {
  const [state, formAction, pendente] = useActionState(
    atualizarGalpaoAction,
    estadoInicial
  );

  return (
    <GalpaoFormFields
      formAction={formAction}
      pendente={pendente}
      erro={state.erro}
      submitLabel="Salvar alterações"
      galpaoId={galpao.id}
      valoresIniciais={{
        nome: galpao.nome,
        areaM2: galpao.areaM2,
      }}
    />
  );
}
