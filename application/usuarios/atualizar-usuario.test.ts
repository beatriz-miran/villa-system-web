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

import { atualizarUsuario } from "./atualizar-usuario";

const administradorAtivo = {
  usu_id: 2,
  usu_nome: "Administradora",
  usu_email: "admin@villa.local",
  usu_perfil_acesso: "ADMIN",
  usu_status: "ATIVO",
};

const dadosBase = {
  id: 2,
  usuarioLogadoId: 1,
  nome: "  Administradora Atualizada  ",
  email: "  ADMIN.NOVO@VILLA.LOCAL  ",
  perfil: "ADMIN" as const,
};

beforeEach(() => {
  vi.clearAllMocks();

  repositorioTransacionalMock
    .buscarUsuarioPorId
    .mockResolvedValue(
      administradorAtivo as never,
    );

  repositorioTransacionalMock
    .buscarUsuarioPorEmail
    .mockResolvedValue(null);

  repositorioTransacionalMock
    .contarAdministradoresAtivos
    .mockResolvedValue(2);

  repositorioTransacionalMock
    .atualizarUsuario
    .mockResolvedValue({} as never);
});

describe("atualizarUsuario", () => {
  it("atualiza os dados e normaliza nome e e-mail", async () => {
    const resultado =
      await atualizarUsuario(dadosBase);

    expect(resultado.sucesso).toBe(true);

    expect(
      executarAlteracaoUsuarioComBloqueio,
    ).toHaveBeenCalledWith(
      expect.any(Function),
    );

    expect(
      repositorioTransacionalMock
        .buscarUsuarioPorEmail,
    ).toHaveBeenCalledWith(
      "admin.novo@villa.local",
    );

    expect(
      repositorioTransacionalMock
        .atualizarUsuario,
    ).toHaveBeenCalledWith(
      2,
      {
        nome: "Administradora Atualizada",
        email: "admin.novo@villa.local",
        perfil: "ADMIN",
      },
    );
  });

  it("impede o administrador de rebaixar o próprio perfil", async () => {
    const resultado =
      await atualizarUsuario({
        ...dadosBase,
        usuarioLogadoId: 2,
        perfil: "OPERADOR",
      });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Você não pode alterar o seu próprio perfil de administrador para operador.",
      );
    }

    expect(
      repositorioTransacionalMock
        .buscarUsuarioPorEmail,
    ).not.toHaveBeenCalled();

    expect(
      repositorioTransacionalMock
        .atualizarUsuario,
    ).not.toHaveBeenCalled();
  });

  it("impede o rebaixamento do último administrador ativo", async () => {
    repositorioTransacionalMock
      .contarAdministradoresAtivos
      .mockResolvedValue(1);

    const resultado =
      await atualizarUsuario({
        ...dadosBase,
        perfil: "OPERADOR",
      });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "O sistema deve manter pelo menos um administrador ativo.",
      );
    }

    expect(
      repositorioTransacionalMock
        .atualizarUsuario,
    ).not.toHaveBeenCalled();
  });

  it("permite rebaixar outro administrador quando existe mais um ativo", async () => {
    const resultado =
      await atualizarUsuario({
        ...dadosBase,
        perfil: "OPERADOR",
      });

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock
        .contarAdministradoresAtivos,
    ).toHaveBeenCalledTimes(1);

    expect(
      repositorioTransacionalMock
        .atualizarUsuario,
    ).toHaveBeenCalledWith(
      2,
      expect.objectContaining({
        perfil: "OPERADOR",
      }),
    );
  });

  it("rejeita um e-mail utilizado por outro usuário", async () => {
    repositorioTransacionalMock
      .buscarUsuarioPorEmail
      .mockResolvedValue({
        usu_id: 99,
      } as never);

    const resultado =
      await atualizarUsuario(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Já existe outro usuário com este e-mail.",
      );
    }

    expect(
      repositorioTransacionalMock
        .atualizarUsuario,
    ).not.toHaveBeenCalled();
  });

  it("permite manter o e-mail do próprio usuário", async () => {
    repositorioTransacionalMock
      .buscarUsuarioPorEmail
      .mockResolvedValue({
        usu_id: 2,
      } as never);

    const resultado =
      await atualizarUsuario(dadosBase);

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock
        .atualizarUsuario,
    ).toHaveBeenCalledTimes(1);
  });

  it("informa quando o usuário não existe", async () => {
    repositorioTransacionalMock
      .buscarUsuarioPorId
      .mockResolvedValue(null);

    const resultado =
      await atualizarUsuario(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Usuário não encontrado.",
      );
    }

    expect(
      repositorioTransacionalMock
        .atualizarUsuario,
    ).not.toHaveBeenCalled();
  });

  it("rejeita dados inválidos antes de abrir a transação", async () => {
    const resultado =
      await atualizarUsuario({
        ...dadosBase,
        email: "email-invalido",
      });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarAlteracaoUsuarioComBloqueio,
    ).not.toHaveBeenCalled();
  });

  it("trata conflito simultâneo de e-mail", async () => {
    repositorioTransacionalMock
      .atualizarUsuario
      .mockRejectedValue({
        code: "P2002",
      });

    const resultado =
      await atualizarUsuario(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Já existe outro usuário com este e-mail.",
      );
    }
  });

  it("trata a remoção simultânea do usuário", async () => {
    vi.mocked(
      executarAlteracaoUsuarioComBloqueio,
    ).mockRejectedValueOnce({
      code: "P2025",
    });

    const resultado =
      await atualizarUsuario(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Usuário não encontrado.",
      );
    }
  });
});