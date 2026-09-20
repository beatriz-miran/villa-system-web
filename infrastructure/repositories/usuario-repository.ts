import type { Prisma } from "../../generated/prisma/client";

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

const CHAVE_BLOQUEIO_ADMINISTRADORES =
  2_026_092_001;

const selectUsuario = {
  usu_id: true,
  usu_nome: true,
  usu_email: true,
  usu_perfil_acesso: true,
  usu_status: true,
} as const;

async function buscarUsuarioPorIdComCliente(
  cliente: Prisma.TransactionClient,
  id: number,
) {
  return cliente.usuario.findUnique({
    where: {
      usu_id: id,
    },
    select: selectUsuario,
  });
}

async function buscarUsuarioPorEmailComCliente(
  cliente: Prisma.TransactionClient,
  email: string,
) {
  return cliente.usuario.findUnique({
    where: {
      usu_email: email,
    },
    select: {
      usu_id: true,
    },
  });
}

async function contarAdministradoresAtivosComCliente(
  cliente: Prisma.TransactionClient,
) {
  return cliente.usuario.count({
    where: {
      usu_perfil_acesso: "ADMIN",
      usu_status: "ATIVO",
    },
  });
}

async function atualizarUsuarioComCliente(
  cliente: Prisma.TransactionClient,
  id: number,
  dados: AtualizarUsuarioDados,
) {
  return cliente.usuario.update({
    where: {
      usu_id: id,
    },
    data: {
      usu_nome: dados.nome,
      usu_email: dados.email,
      usu_perfil_acesso: dados.perfil,
      updated_at: new Date(),
    },
    select: selectUsuario,
  });
}

async function atualizarStatusUsuarioComCliente(
  cliente: Prisma.TransactionClient,
  id: number,
  status: UsuarioStatus,
) {
  return cliente.usuario.update({
    where: {
      usu_id: id,
    },
    data: {
      usu_status: status,
      updated_at: new Date(),
    },
    select: selectUsuario,
  });
}

type OperacoesAlteracaoUsuario = {
  buscarUsuarioPorId: (
    id: number,
  ) => ReturnType<
    typeof buscarUsuarioPorIdComCliente
  >;

  buscarUsuarioPorEmail: (
    email: string,
  ) => ReturnType<
    typeof buscarUsuarioPorEmailComCliente
  >;

  contarAdministradoresAtivos: () => ReturnType<
    typeof contarAdministradoresAtivosComCliente
  >;

  atualizarUsuario: (
    id: number,
    dados: AtualizarUsuarioDados,
  ) => ReturnType<
    typeof atualizarUsuarioComCliente
  >;

  atualizarStatusUsuario: (
    id: number,
    status: UsuarioStatus,
  ) => ReturnType<
    typeof atualizarStatusUsuarioComCliente
  >;
};

export async function executarAlteracaoUsuarioComBloqueio<T>(
  operacao: (
    repositorio: OperacoesAlteracaoUsuario,
  ) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(
    async (transacao) => {
      await transacao.$queryRaw`
        SELECT pg_advisory_xact_lock(
          ${CHAVE_BLOQUEIO_ADMINISTRADORES}
        )::text AS "bloqueio"
      `;

      return operacao({
        buscarUsuarioPorId: (id) =>
          buscarUsuarioPorIdComCliente(
            transacao,
            id,
          ),

        buscarUsuarioPorEmail: (email) =>
          buscarUsuarioPorEmailComCliente(
            transacao,
            email,
          ),

        contarAdministradoresAtivos: () =>
          contarAdministradoresAtivosComCliente(
            transacao,
          ),

        atualizarUsuario: (id, dados) =>
          atualizarUsuarioComCliente(
            transacao,
            id,
            dados,
          ),

        atualizarStatusUsuario: (
          id,
          status,
        ) =>
          atualizarStatusUsuarioComCliente(
            transacao,
            id,
            status,
          ),
      });
    },
    {
      maxWait: 5000,
      timeout: 10000,
    },
  );
}

export async function listarUsuarios() {
  return prisma.usuario.findMany({
    select: selectUsuario,
    orderBy: {
      usu_nome: "asc",
    },
  });
}

export async function buscarUsuarioPorId(
  id: number,
) {
  return prisma.usuario.findUnique({
    where: {
      usu_id: id,
    },
    select: selectUsuario,
  });
}

export async function buscarUsuarioPorEmail(
  email: string,
) {
  return prisma.usuario.findUnique({
    where: {
      usu_email: email,
    },
    select: {
      usu_id: true,
    },
  });
}

export async function criarUsuario(
  dados: CriarUsuarioDados,
) {
  return prisma.usuario.create({
    data: {
      usu_nome: dados.nome,
      usu_email: dados.email,
      usu_perfil_acesso: dados.perfil,
      usu_senha: dados.senhaHash,
      usu_status: "ATIVO",
    },
    select: selectUsuario,
  });
}