import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { estornarBaixaLote } from "./estornar-baixa-lote";

vi.mock(
  "@/infrastructure/repositories/mortalidade-descarte-repository",
  () => ({
    buscarBaixaPorId: vi.fn(),
    estornarBaixaLote: vi.fn(),
  }),
);

import {
  buscarBaixaPorId,
  estornarBaixaLote as estornarBaixaLoteRepository,
} from "@/infrastructure/repositories/mortalidade-descarte-repository";

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
  motivo: "Lançamento realizado incorretamente.",
};

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(
    buscarBaixaPorId,
  ).mockResolvedValue(baixaAtiva as never);

  vi.mocked(
    estornarBaixaLoteRepository,
  ).mockResolvedValue({
    count: 1,
  });
});

describe("estornarBaixaLote", () => {
  it("estorna uma baixa válida", async () => {
    const resultado = await estornarBaixaLote(
      dadosBase,
    );

    expect(resultado).toEqual({
      sucesso: true,
      loteId: 1,
    });

    expect(
      estornarBaixaLoteRepository,
    ).toHaveBeenCalledWith({
      baixaId: 10,
      usuarioId: 9,
      motivo:
        "Lançamento realizado incorretamente.",
    });
  });

  it("remove espaços extras do motivo", async () => {
    const resultado = await estornarBaixaLote({
      ...dadosBase,
      motivo: "  Quantidade informada incorretamente.  ",
    });

    expect(resultado.sucesso).toBe(true);

    expect(
      estornarBaixaLoteRepository,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        motivo:
          "Quantidade informada incorretamente.",
      }),
    );
  });

  it("rejeita um identificador de baixa inválido", async () => {
    const resultado = await estornarBaixaLote({
      ...dadosBase,
      baixaId: 0,
    });

    expect(resultado.sucesso).toBe(false);

    expect(
      buscarBaixaPorId,
    ).not.toHaveBeenCalled();

    expect(
      estornarBaixaLoteRepository,
    ).not.toHaveBeenCalled();
  });

  it("rejeita um motivo muito curto", async () => {
    const resultado = await estornarBaixaLote({
      ...dadosBase,
      motivo: "Erro",
    });

    expect(resultado.sucesso).toBe(false);

    expect(
      estornarBaixaLoteRepository,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quando o registro não existe", async () => {
    vi.mocked(
      buscarBaixaPorId,
    ).mockResolvedValue(null);

    const resultado = await estornarBaixaLote(
      dadosBase,
    );

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "O registro de baixa não foi encontrado.",
      );
    }

    expect(
      estornarBaixaLoteRepository,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quando o registro já foi estornado", async () => {
    vi.mocked(
      buscarBaixaPorId,
    ).mockResolvedValue({
      ...baixaAtiva,
      mor_status_registro: "ESTORNADO",
    } as never);

    const resultado = await estornarBaixaLote(
      dadosBase,
    );

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Este registro já foi estornado.",
      );
    }

    expect(
      estornarBaixaLoteRepository,
    ).not.toHaveBeenCalled();
  });

  it("trata estorno concorrente realizado por outro usuário", async () => {
    vi.mocked(
      estornarBaixaLoteRepository,
    ).mockResolvedValue({
      count: 0,
    });

    const resultado = await estornarBaixaLote(
      dadosBase,
    );

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Este registro já foi estornado por outro usuário.",
      );
    }
  });
});