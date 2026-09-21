import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const repositorioTransacionalMock = vi.hoisted(
  () => ({
    buscarUsuarioPorId: vi.fn(),
    buscarUsuarioPorEmail: vi.fn(),
    contarAdministradoresAtivos: vi.fn(),
    atualizarUsuario: vi.fn(),
    atualizarStatusUsuario: vi.fn(),
  }),
);

vi.mock(
  "@/infrastructure/database/identificar-erro-prisma",
  () => ({
    erroPrismaTemCodigo: vi.fn(
      (
        error: unknown,
        codigo: string,
      ) =>
        typeof error === "object" &&
        error !== null &&
        (error as { code?: unknown })
          .code === codigo,
    ),
  }),
);

vi.mock(
  "@/infrastructure/repositories/usuario-repository",
  () => ({
    executarAlteracaoUsuarioComBloqueio:
      vi.fn(
        async (
          operacao: (
            repositorio: typeof repositorioTransacionalMock,
          ) => Promise<unknown>,
        ) =>
          operacao(
            repositorioTransacionalMock,
          ),
      ),
  }),
);

import { executarAlteracaoUsuarioComBloqueio } from "@/infrastructure/repositories/usuario-repository";

import { alterarStatusUsuario } from "./alterar-status-usuario";

const administradorAtivo = {
  usu_id: 2,
  usu_nome: "Administradora",
  usu_email: "admin@villa.local",
  usu_perfil_acesso: "ADMIN",
  usu_status: "ATIVO",
};

const dadosBase = {
  id: 2,
  status: "INATIVO" as const,
  usuarioLogadoId: 1,
};

beforeEach(() => {
  vi.clearAllMocks();

  repositorioTransacionalMock
    .buscarUsuarioPorId
    .mockResolvedValue(
      administradorAtivo as never,
    );

  repositorioTransacionalMock
    .contarAdministradoresAtivos
    .mockResolvedValue(2);

  repositorioTransacionalMock
    .atualizarStatusUsuario
    .mockResolvedValue({} as never);
});

describe("alterarStatusUsuario", () => {
  it("desativa um administrador quando existe outro administrador ativo", async () => {
    const resultado =
      await alterarStatusUsuario(dadosBase);

    expect(resultado.sucesso).toBe(true);

    expect(
      executarAlteracaoUsuarioComBloqueio,
    ).toHaveBeenCalledWith(
      expect.any(Function),
    );

    expect(
      repositorioTransacionalMock
        .contarAdministradoresAtivos,
    ).toHaveBeenCalledTimes(1);

    expect(
      repositorioTransacionalMock
        .atualizarStatusUsuario,
    ).toHaveBeenCalledWith(
      2,
      "INATIVO",
    );
  });

  it("impede o usuário de desativar a própria conta", async () => {
    const resultado =
      await alterarStatusUsuario({
        ...dadosBase,
        usuarioLogadoId: 2,
      });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Você não pode desativar o seu próprio usuário.",
      );
    }

    expect(
      repositorioTransacionalMock
        .contarAdministradoresAtivos,
    ).not.toHaveBeenCalled();

    expect(
      repositorioTransacionalMock
        .atualizarStatusUsuario,
    ).not.toHaveBeenCalled();
  });

  it("impede a desativação do último administrador ativo", async () => {
    repositorioTransacionalMock
      .contarAdministradoresAtivos
      .mockResolvedValue(1);

    const resultado =
      await alterarStatusUsuario(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "O sistema deve manter pelo menos um administrador ativo.",
      );
    }

    expect(
      repositorioTransacionalMock
        .atualizarStatusUsuario,
    ).not.toHaveBeenCalled();
  });

  it("não atualiza quando o usuário já possui o status solicitado", async () => {
    const resultado =
      await alterarStatusUsuario({
        ...dadosBase,
        status: "ATIVO",
      });

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock
        .contarAdministradoresAtivos,
    ).not.toHaveBeenCalled();

    expect(
      repositorioTransacionalMock
        .atualizarStatusUsuario,
    ).not.toHaveBeenCalled();
  });

  it("ativa um usuário inativo sem contar administradores", async () => {
    repositorioTransacionalMock
      .buscarUsuarioPorId
      .mockResolvedValue({
        ...administradorAtivo,
        usu_status: "INATIVO",
      } as never);

    const resultado =
      await alterarStatusUsuario({
        ...dadosBase,
        status: "ATIVO",
      });

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock
        .contarAdministradoresAtivos,
    ).not.toHaveBeenCalled();

    expect(
      repositorioTransacionalMock
        .atualizarStatusUsuario,
    ).toHaveBeenCalledWith(
      2,
      "ATIVO",
    );
  });

  it("informa quando o usuário não existe", async () => {
    repositorioTransacionalMock
      .buscarUsuarioPorId
      .mockResolvedValue(null);

    const resultado =
      await alterarStatusUsuario(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Usuário não encontrado.",
      );
    }

    expect(
      repositorioTransacionalMock
        .atualizarStatusUsuario,
    ).not.toHaveBeenCalled();
  });

  it("rejeita um status inválido antes de abrir a transação", async () => {
    const resultado =
      await alterarStatusUsuario({
        ...dadosBase,
        status: "BLOQUEADO" as never,
      });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarAlteracaoUsuarioComBloqueio,
    ).not.toHaveBeenCalled();
  });

  it("trata a remoção simultânea do usuário", async () => {
    vi.mocked(
      executarAlteracaoUsuarioComBloqueio,
    ).mockRejectedValueOnce({
      code: "P2025",
    });

    const resultado =
      await alterarStatusUsuario(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Usuário não encontrado.",
      );
    }
  });
});