import { prisma } from "../database/prisma";

type CriarUsuarioDados = {
  nome: string;
  email: string;
  perfil: "ADMIN" | "OPERADOR";
  senhaHash: string;
};

type AtualizarUsuarioDados = {
  nome: string;
  email: string;
  perfil: "ADMIN" | "OPERADOR";
};

type UsuarioStatus = "ATIVO" | "INATIVO";

export async function listarUsuarios() {
  return prisma.usuario.findMany({
    select: {
      usu_id: true,
      usu_nome: true,
      usu_email: true,
      usu_perfil_acesso: true,
      usu_status: true,
    },
    orderBy: {
      usu_nome: "asc",
    },
  });
}

export async function buscarUsuarioPorId(id: number) {
  return prisma.usuario.findUnique({
    where: {
      usu_id: id,
    },
    select: {
      usu_id: true,
      usu_nome: true,
      usu_email: true,
      usu_perfil_acesso: true,
      usu_status: true,
    },
  });
}

export async function buscarUsuarioPorEmail(email: string) {
  return prisma.usuario.findUnique({
    where: {
      usu_email: email,
    },
    select: {
      usu_id: true,
    },
  });
}

export async function criarUsuario(dados: CriarUsuarioDados) {
  return prisma.usuario.create({
    data: {
      usu_nome: dados.nome,
      usu_email: dados.email,
      usu_perfil_acesso: dados.perfil,
      usu_senha: dados.senhaHash,
      usu_status: "ATIVO",
    },
    select: {
      usu_id: true,
      usu_nome: true,
      usu_email: true,
      usu_perfil_acesso: true,
      usu_status: true,
    },
  });
}

export async function atualizarUsuario(
  id: number,
  dados: AtualizarUsuarioDados
) {
  return prisma.usuario.update({
    where: {
      usu_id: id,
    },
    data: {
      usu_nome: dados.nome,
      usu_email: dados.email,
      usu_perfil_acesso: dados.perfil,
    },
    select: {
      usu_id: true,
      usu_nome: true,
      usu_email: true,
      usu_perfil_acesso: true,
      usu_status: true,
    },
  });
}

export async function atualizarStatusUsuario(
  id: number,
  status: UsuarioStatus
) {
  return prisma.usuario.update({
    where: {
      usu_id: id,
    },
    data: {
      usu_status: status,
    },
    select: {
      usu_id: true,
      usu_nome: true,
      usu_email: true,
      usu_perfil_acesso: true,
      usu_status: true,
    },
  });
}
