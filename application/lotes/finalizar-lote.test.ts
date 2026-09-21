import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const repositorioTransacionalMock = vi.hoisted(
  () => ({
    buscarLoteParaFinalizacao: vi.fn(),
    finalizarLote: vi.fn(),
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
  "@/infrastructure/repositories/lote-repository",
  () => ({
    executarFinalizacaoLoteComBloqueio:
      vi.fn(
        async (
          _loteId: number,
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

import { executarFinalizacaoLoteComBloqueio } from "@/infrastructure/repositories/lote-repository";

import { finalizarLote } from "./finalizar-lote";

const loteAtivo = {
  lta_id: 1,
  lta_status: "ATIVO",
  lta_data_alojamento: new Date(
    Date.UTC(2026, 8, 1),
  ),
  mortalidade_descarte: [
    {
      mor_data: new Date(
        Date.UTC(2026, 8, 5),
      ),
    },
    {
      mor_data: new Date(
        Date.UTC(2026, 8, 10),
      ),
    },
  ],
};

const dadosBase = {
  loteId: 1,
  dataEncerramento: new Date(
    Date.UTC(2026, 8, 15),
  ),
  motivoEncerramento:
    "  Encerramento do ciclo produtivo  ",
  destinoAves:
    "  Venda das aves ao final do ciclo  ",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();

  vi.setSystemTime(
    new Date(Date.UTC(2026, 8, 15, 12)),
  );

  repositorioTransacionalMock
    .buscarLoteParaFinalizacao
    .mockResolvedValue(
      loteAtivo as never,
    );

  repositorioTransacionalMock
    .finalizarLote
    .mockResolvedValue({} as never);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("finalizarLote", () => {
  it("finaliza um lote ativo com dados válidos", async () => {
    const resultado =
      await finalizarLote(dadosBase);

    expect(resultado.sucesso).toBe(true);

    expect(
      executarFinalizacaoLoteComBloqueio,
    ).toHaveBeenCalledWith(
      1,
      expect.any(Function),
    );

    expect(
      repositorioTransacionalMock.finalizarLote,
    ).toHaveBeenCalledWith({
      dataEncerramento:
        dadosBase.dataEncerramento,
      motivoEncerramento:
        "Encerramento do ciclo produtivo",
      destinoAves:
        "Venda das aves ao final do ciclo",
    });
  });

  it("rejeita um lote inválido antes de abrir a transação", async () => {
    const resultado =
      await finalizarLote({
        ...dadosBase,
        loteId: 0,
      });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarFinalizacaoLoteComBloqueio,
    ).not.toHaveBeenCalled();
  });

  it("rejeita uma data de encerramento futura", async () => {
    const resultado =
      await finalizarLote({
        ...dadosBase,
        dataEncerramento: new Date(
          Date.UTC(2026, 8, 16),
        ),
      });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /não pode ser uma data futura/,
      );
    }

    expect(
      executarFinalizacaoLoteComBloqueio,
    ).not.toHaveBeenCalled();
  });

  it("informa quando o lote não existe", async () => {
    repositorioTransacionalMock
      .buscarLoteParaFinalizacao
      .mockResolvedValue(null);

    const resultado =
      await finalizarLote(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Lote não encontrado.",
      );
    }

    expect(
      repositorioTransacionalMock.finalizarLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita um lote que já foi finalizado", async () => {
    repositorioTransacionalMock
      .buscarLoteParaFinalizacao
      .mockResolvedValue({
        ...loteAtivo,
        lta_status: "FINALIZADO",
      } as never);

    const resultado =
      await finalizarLote(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Este lote já está finalizado.",
      );
    }

    expect(
      repositorioTransacionalMock.finalizarLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita encerramento anterior ao alojamento", async () => {
    const resultado =
      await finalizarLote({
        ...dadosBase,
        dataEncerramento: new Date(
          Date.UTC(2026, 7, 31),
        ),
      });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /anterior à data de alojamento/,
      );
    }

    expect(
      repositorioTransacionalMock.finalizarLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita encerramento anterior à última baixa válida", async () => {
    const resultado =
      await finalizarLote({
        ...dadosBase,
        dataEncerramento: new Date(
          Date.UTC(2026, 8, 9),
        ),
      });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /anterior à última baixa válida/,
      );
    }

    expect(
      repositorioTransacionalMock.finalizarLote,
    ).not.toHaveBeenCalled();
  });

  it("permite encerramento na mesma data da última baixa", async () => {
    const resultado =
      await finalizarLote({
        ...dadosBase,
        dataEncerramento: new Date(
          Date.UTC(2026, 8, 10),
        ),
      });

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock.finalizarLote,
    ).toHaveBeenCalledTimes(1);
  });

  it("trata a remoção simultânea do lote", async () => {
    vi.mocked(
      executarFinalizacaoLoteComBloqueio,
    ).mockRejectedValueOnce({
      code: "P2025",
    });

    const resultado =
      await finalizarLote(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Lote não encontrado.",
      );
    }
  });
});