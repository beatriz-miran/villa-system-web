"use client";

import { useActionState } from "react";

import {
  criarFornecedorAction,
  CriarFornecedorActionState,
} from "@/app/admin/fornecedores/actions";
import FornecedorFormFields from "@/app/admin/fornecedores/components/FornecedorFormFields";

type NovoFornecedorFormProps = {
  categorias: {
    ctf_id: number;
    ctf_descricao: string;
  }[];
};

const estadoInicial: CriarFornecedorActionState = {};

export default function NovoFornecedorForm({
  categorias,
}: NovoFornecedorFormProps) {
  const [state, formAction, pendente] = useActionState(
    criarFornecedorAction,
    estadoInicial
  );

  return (
    <FornecedorFormFields
      formAction={formAction}
      pendente={pendente}
      erro={state.erro}
      categorias={categorias}
      submitLabel="Cadastrar fornecedor"
    />
  );
}
