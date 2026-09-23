import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const repositorioTransacionalMock = vi.hoisted(
  () => ({
    buscarMovimentoPorId: vi.fn(),
    estornarMovimento: vi.fn(),
  }),
);

vi.mock(
  "@/infrastructure/repositories/producao-ovo-repository",
  () => ({
    executarEstornoProducaoComBloqueio: vi.fn(
      async (
        _movimentoId: number,
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

import { executarEstornoProducaoComBloqueio } from "@/infrastructure/repositories/producao-ovo-repository";

import { estornarProducaoLote } from "./estornar-producao-lote";

const movimentoAtivo = {
  mvo_id: 10,
  mvo_status_registro: "ATIVO",
  lote_estoque_ovo: {
    lta_id: 1,
    lote_aves: {
      lta_status: "ATIVO",
    },
  },
};

const dadosBase = {
  movimentoId: 10,
  usuarioId: 9,
  motivo:
    "Lançamento realizado incorretamente.",
};

beforeEach(() => {
  vi.clearAllMocks();

  repositorioTransacionalMock
    .buscarMovimentoPorId
    .mockResolvedValue(movimentoAtivo as never);

  repositorioTransacionalMock
    .estornarMovimento
    .mockResolvedValue({
      count: 1,
    });
});

describe("estornarProducaoLote", () => {
  it("estorna um movimento válido dentro do bloqueio do lote", async () => {
    const resultado =
      await estornarProducaoLote(dadosBase);

    expect(resultado).toEqual({
      sucesso: true,
      loteId: 1,
    });

    expect(
      executarEstornoProducaoComBloqueio,
    ).toHaveBeenCalledWith(
      10,
      expect.any(Function),
    );

    expect(
      repositorioTransacionalMock.estornarMovimento,
    ).toHaveBeenCalledWith({
      usuarioId: 9,
      motivo:
        "Lançamento realizado incorretamente.",
    });
  });

  it("remove espaços extras do motivo", async () => {
    const resultado = await estornarProducaoLote({
      ...dadosBase,
      motivo:
        "  Quantidade informada incorretamente.  ",
    });

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock.estornarMovimento,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        motivo:
          "Quantidade informada incorretamente.",
      }),
    );
  });

  it("rejeita um identificador de movimento inválido antes da transação", async () => {
    const resultado = await estornarProducaoLote({
      ...dadosBase,
      movimentoId: 0,
    });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarEstornoProducaoComBloqueio,
    ).not.toHaveBeenCalled();
  });

  it("rejeita um motivo muito curto", async () => {
    const resultado = await estornarProducaoLote({
      ...dadosBase,
      motivo: "Erro",
    });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarEstornoProducaoComBloqueio,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quando o registro não existe", async () => {
    repositorioTransacionalMock
      .buscarMovimentoPorId
      .mockResolvedValue(null);

    const resultado =
      await estornarProducaoLote(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "O registro de produção não foi encontrado.",
      );
    }

    expect(
      repositorioTransacionalMock.estornarMovimento,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quando o registro já foi estornado", async () => {
    repositorioTransacionalMock
      .buscarMovimentoPorId
      .mockResolvedValue({
        ...movimentoAtivo,
        mvo_status_registro: "ESTORNADO",
      } as never);

    const resultado =
      await estornarProducaoLote(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Este registro já foi estornado.",
      );
    }

    expect(
      repositorioTransacionalMock.estornarMovimento,
    ).not.toHaveBeenCalled();
  });

  it("rejeita estorno de produção pertencente a lote finalizado", async () => {
    repositorioTransacionalMock
      .buscarMovimentoPorId
      .mockResolvedValue({
        ...movimentoAtivo,
        lote_estoque_ovo: {
          ...movimentoAtivo.lote_estoque_ovo,
          lote_aves: {
            lta_status: "FINALIZADO",
          },
        },
      } as never);

    const resultado =
      await estornarProducaoLote(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Não é possível estornar produção de um lote finalizado.",
      );
    }

    expect(
      repositorioTransacionalMock.estornarMovimento,
    ).not.toHaveBeenCalled();
  });

  it("trata estorno concorrente realizado por outro usuário", async () => {
    repositorioTransacionalMock
      .estornarMovimento
      .mockResolvedValue({
        count: 0,
      });

    const resultado =
      await estornarProducaoLote(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Este registro já foi estornado por outro usuário.",
      );
    }
  });
});
