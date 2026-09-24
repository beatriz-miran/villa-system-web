"use client";

import { useActionState } from "react";

import {
  atualizarUsuarioAction,
  AtualizarUsuarioActionState,
} from "@/app/admin/usuarios/actions";
import UsuarioFormFields from "@/app/admin/usuarios/components/UsuarioFormFields";

type EditarUsuarioFormProps = {
  usuario: {
    id: number;
    nome: string;
    email: string;
    perfil: "ADMIN" | "OPERADOR";
  };
};

const estadoInicial: AtualizarUsuarioActionState = {};

export default function EditarUsuarioForm({
  usuario,
}: EditarUsuarioFormProps) {
  const [state, formAction, pendente] = useActionState(
    atualizarUsuarioAction,
    estadoInicial
  );

  return (
    <UsuarioFormFields
      formAction={formAction}
      pendente={pendente}
      erro={state.erro}
      submitLabel="Salvar alterações"
      usuarioId={usuario.id}
      valoresIniciais={{
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      }}
    />
  );
}