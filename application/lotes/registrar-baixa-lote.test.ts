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
    buscarLoteParaRegistrarBaixa: vi.fn(),
    registrarBaixaLote: vi.fn(),
  }),
);

vi.mock(
  "@/infrastructure/repositories/mortalidade-descarte-repository",
  () => ({
    executarRegistroBaixaComBloqueio: vi.fn(
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

import { executarRegistroBaixaComBloqueio } from "@/infrastructure/repositories/mortalidade-descarte-repository";

import { registrarBaixaLote } from "./registrar-baixa-lote";

const loteAtivo = {
  lta_id: 1,
  lta_codigo_qr_code: "LT-TESTE",
  lta_quant_inicial: 100,
  lta_data_alojamento: new Date(
    Date.UTC(2026, 8, 1),
  ),
  lta_status: "ATIVO",
  mortalidade_descarte: [
    {
      mor_quantidade: 5,
    },
    {
      mor_quantidade: 3,
    },
  ],
};

const dadosBase = {
  loteId: 1,
  usuarioId: 9,
  tipo: "MORTALIDADE" as const,
  quantidade: 10,
  data: new Date(Date.UTC(2026, 8, 15)),
  motivo: "Mortalidade natural",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();

  vi.setSystemTime(
    new Date(Date.UTC(2026, 8, 15, 12)),
  );

  repositorioTransacionalMock
    .buscarLoteParaRegistrarBaixa
    .mockResolvedValue(loteAtivo as never);

  repositorioTransacionalMock.registrarBaixaLote
    .mockResolvedValue({
      mor_id: 1,
    } as never);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("registrarBaixaLote", () => {
  it("registra uma baixa quando os dados são válidos", async () => {
    const resultado = await registrarBaixaLote(
      dadosBase,
    );

    expect(resultado.sucesso).toBe(true);

    expect(
      executarRegistroBaixaComBloqueio,
    ).toHaveBeenCalledWith(
      1,
      expect.any(Function),
    );

    expect(
      repositorioTransacionalMock.registrarBaixaLote,
    ).toHaveBeenCalledWith({
      loteId: 1,
      usuarioId: 9,
      tipo: "MORTALIDADE",
      quantidade: 10,
      data: dadosBase.data,
      motivo: "Mortalidade natural",
    });
  });

  it("remove espaços extras do motivo", async () => {
    const resultado = await registrarBaixaLote({
      ...dadosBase,
      motivo: "  Descarte sanitário  ",
    });

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock.registrarBaixaLote,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        motivo: "Descarte sanitário",
      }),
    );
  });

  it("rejeita quantidade igual a zero", async () => {
    const resultado = await registrarBaixaLote({
      ...dadosBase,
      quantidade: 0,
    });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarRegistroBaixaComBloqueio,
    ).not.toHaveBeenCalled();

    expect(
      repositorioTransacionalMock.registrarBaixaLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita uma quantidade fracionada", async () => {
    const resultado = await registrarBaixaLote({
      ...dadosBase,
      quantidade: 1.5,
    });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarRegistroBaixaComBloqueio,
    ).not.toHaveBeenCalled();

    expect(
      repositorioTransacionalMock.registrarBaixaLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita um tipo de baixa inválido", async () => {
    const resultado = await registrarBaixaLote({
      ...dadosBase,
      tipo: "OUTRO" as never,
    });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarRegistroBaixaComBloqueio,
    ).not.toHaveBeenCalled();

    expect(
      repositorioTransacionalMock.registrarBaixaLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita uma data futura", async () => {
    const resultado = await registrarBaixaLote({
      ...dadosBase,
      data: new Date(Date.UTC(2026, 8, 16)),
    });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /não pode ser uma data futura/,
      );
    }

    expect(
      executarRegistroBaixaComBloqueio,
    ).not.toHaveBeenCalled();

    expect(
      repositorioTransacionalMock.registrarBaixaLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita uma data anterior ao alojamento", async () => {
    const resultado = await registrarBaixaLote({
      ...dadosBase,
      data: new Date(Date.UTC(2026, 7, 31)),
    });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /anterior à data de alojamento/,
      );
    }

    expect(
      repositorioTransacionalMock.registrarBaixaLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quando o lote não existe", async () => {
    repositorioTransacionalMock
      .buscarLoteParaRegistrarBaixa
      .mockResolvedValue(null);

    const resultado = await registrarBaixaLote(
      dadosBase,
    );

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Lote não encontrado.",
      );
    }

    expect(
      repositorioTransacionalMock.registrarBaixaLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quando o lote está finalizado", async () => {
    repositorioTransacionalMock
      .buscarLoteParaRegistrarBaixa
      .mockResolvedValue({
        ...loteAtivo,
        lta_status: "FINALIZADO",
      } as never);

    const resultado = await registrarBaixaLote(
      dadosBase,
    );

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /lote finalizado/,
      );
    }

    expect(
      repositorioTransacionalMock.registrarBaixaLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quantidade maior que o saldo atual", async () => {
    const resultado = await registrarBaixaLote({
      ...dadosBase,
      quantidade: 93,
    });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /saldo atual de 92 aves/,
      );
    }

    expect(
      repositorioTransacionalMock.registrarBaixaLote,
    ).not.toHaveBeenCalled();
  });

  it("permite registrar exatamente o saldo disponível", async () => {
    const resultado = await registrarBaixaLote({
      ...dadosBase,
      quantidade: 92,
    });

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock.registrarBaixaLote,
    ).toHaveBeenCalledTimes(1);
  });

  it("rejeita quando o lote não possui aves disponíveis", async () => {
    repositorioTransacionalMock
      .buscarLoteParaRegistrarBaixa
      .mockResolvedValue({
        ...loteAtivo,
        mortalidade_descarte: [
          {
            mor_quantidade: 100,
          },
        ],
      } as never);

    const resultado = await registrarBaixaLote(
      dadosBase,
    );

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /não possui aves disponíveis/,
      );
    }

    expect(
      repositorioTransacionalMock.registrarBaixaLote,
    ).not.toHaveBeenCalled();
  });
});