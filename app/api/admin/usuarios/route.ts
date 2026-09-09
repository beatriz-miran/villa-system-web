import { NextResponse } from "next/server";

import { autorizarApi } from "@/app/api/_shared/autorizar-api";
import { listarUsuarios } from "@/application/usuarios/listar-usuarios";

export const runtime = "nodejs";

export async function GET() {
  const acesso = await autorizarApi(["ADMIN"]);

  if (!acesso.autorizado) {
    return acesso.resposta;
  }

  const usuarios = await listarUsuarios();

  return NextResponse.json({
    usuarios: usuarios.map((usuario) => ({
      id: usuario.usu_id,
      nome: usuario.usu_nome,
      email: usuario.usu_email,
      perfil: usuario.usu_perfil_acesso,
      status: usuario.usu_status,
    })),
  });
}