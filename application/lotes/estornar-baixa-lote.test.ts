import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const repositorioTransacionalMock = vi.hoisted(
  () => ({
    buscarBaixaPorId: vi.fn(),
    estornarBaixaLote: vi.fn(),
  }),
);

vi.mock(
  "@/infrastructure/repositories/mortalidade-descarte-repository",
  () => ({
    executarEstornoBaixaComBloqueio:
      vi.fn(
        async (
          _baixaId: number,
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

import { executarEstornoBaixaComBloqueio } from "@/infrastructure/repositories/mortalidade-descarte-repository";

import { estornarBaixaLote } from "./estornar-baixa-lote";

const baixaAtiva = {
  mor_id: 10,
  lta_id: 1,
  mor_quantidade: 2,
  mor_status_registro: "ATIVO",
  lote_aves: {
    lta_status: "ATIVO",
  },
};

const dadosBase = {
  baixaId: 10,
  usuarioId: 9,
  motivo:
    "Lançamento realizado incorretamente.",
};

beforeEach(() => {
  vi.clearAllMocks();

  repositorioTransacionalMock
    .buscarBaixaPorId
    .mockResolvedValue(
      baixaAtiva as never,
    );

  repositorioTransacionalMock
    .estornarBaixaLote
    .mockResolvedValue({
      count: 1,
    });
});

describe("estornarBaixaLote", () => {
  it("estorna uma baixa válida dentro do bloqueio do lote", async () => {
    const resultado =
      await estornarBaixaLote(dadosBase);

    expect(resultado).toEqual({
      sucesso: true,
      loteId: 1,
    });

    expect(
      executarEstornoBaixaComBloqueio,
    ).toHaveBeenCalledWith(
      10,
      expect.any(Function),
    );

    expect(
      repositorioTransacionalMock
        .estornarBaixaLote,
    ).toHaveBeenCalledWith({
      usuarioId: 9,
      motivo:
        "Lançamento realizado incorretamente.",
    });
  });

  it("remove espaços extras do motivo", async () => {
    const resultado =
      await estornarBaixaLote({
        ...dadosBase,
        motivo:
          "  Quantidade informada incorretamente.  ",
      });

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock
        .estornarBaixaLote,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        motivo:
          "Quantidade informada incorretamente.",
      }),
    );
  });

  it("rejeita um identificador de baixa inválido antes da transação", async () => {
    const resultado =
      await estornarBaixaLote({
        ...dadosBase,
        baixaId: 0,
      });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarEstornoBaixaComBloqueio,
    ).not.toHaveBeenCalled();

    expect(
      repositorioTransacionalMock
        .estornarBaixaLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita um motivo muito curto", async () => {
    const resultado =
      await estornarBaixaLote({
        ...dadosBase,
        motivo: "Erro",
      });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarEstornoBaixaComBloqueio,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quando o registro não existe", async () => {
    repositorioTransacionalMock
      .buscarBaixaPorId
      .mockResolvedValue(null);

    const resultado =
      await estornarBaixaLote(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "O registro de baixa não foi encontrado.",
      );
    }

    expect(
      repositorioTransacionalMock
        .estornarBaixaLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quando o registro já foi estornado", async () => {
    repositorioTransacionalMock
      .buscarBaixaPorId
      .mockResolvedValue({
        ...baixaAtiva,
        mor_status_registro: "ESTORNADO",
      } as never);

    const resultado =
      await estornarBaixaLote(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Este registro já foi estornado.",
      );
    }

    expect(
      repositorioTransacionalMock
        .estornarBaixaLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita estorno de baixa pertencente a lote finalizado", async () => {
    repositorioTransacionalMock
      .buscarBaixaPorId
      .mockResolvedValue({
        ...baixaAtiva,
        lote_aves: {
          lta_status: "FINALIZADO",
        },
      } as never);

    const resultado =
      await estornarBaixaLote(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Não é possível estornar baixas de um lote finalizado.",
      );
    }

    expect(
      repositorioTransacionalMock
        .estornarBaixaLote,
    ).not.toHaveBeenCalled();
  });

  it("trata estorno concorrente realizado por outro usuário", async () => {
    repositorioTransacionalMock
      .estornarBaixaLote
      .mockResolvedValue({
        count: 0,
      });

    const resultado =
      await estornarBaixaLote(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Este registro já foi estornado por outro usuário.",
      );
    }
  });
});