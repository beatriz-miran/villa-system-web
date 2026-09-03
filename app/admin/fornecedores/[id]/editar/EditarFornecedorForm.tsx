"use client";

import { useActionState } from "react";

import {
  atualizarFornecedorAction,
  AtualizarFornecedorActionState,
} from "@/app/admin/fornecedores/actions";
import FornecedorFormFields from "@/app/admin/fornecedores/components/FornecedorFormFields";

type EditarFornecedorFormProps = {
  categorias: {
    ctf_id: number;
    ctf_descricao: string;
  }[];
  fornecedor: {
    id: number;
    razaoSocial: string;
    nomeFantasia: string | null;
    cnpj: string;
    email: string;
    telefonePrincipal: string;
    telefoneSecundario: string | null;
    cep: string | null;
    logradouro: string | null;
    numero: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    categoriaId: number;
  };
};

const estadoInicial: AtualizarFornecedorActionState = {};

export default function EditarFornecedorForm({
  categorias,
  fornecedor,
}: EditarFornecedorFormProps) {
  const [state, formAction, pendente] = useActionState(
    atualizarFornecedorAction,
    estadoInicial
  );

  return (
    <FornecedorFormFields
      formAction={formAction}
      pendente={pendente}
      erro={state.erro}
      categorias={categorias}
      submitLabel="Salvar alterações"
      fornecedorId={fornecedor.id}
      valoresIniciais={fornecedor}
    />
  );
}
