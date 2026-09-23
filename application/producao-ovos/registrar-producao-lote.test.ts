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
    buscarLoteParaRegistrarProducao: vi.fn(),
    buscarOuCriarLoteEstoqueOvoDoDia: vi.fn(),
    registrarMovimentoOvo: vi.fn(),
  }),
);

vi.mock(
  "@/infrastructure/repositories/producao-ovo-repository",
  () => ({
    executarRegistroProducaoComBloqueio: vi.fn(
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

import { executarRegistroProducaoComBloqueio } from "@/infrastructure/repositories/producao-ovo-repository";

import { registrarProducaoLote } from "./registrar-producao-lote";

const loteAtivo = {
  lta_id: 1,
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
  quantidadeComercial: 10,
  quantidadePerda: 0,
  data: new Date(Date.UTC(2026, 8, 15)),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();

  vi.setSystemTime(
    new Date(Date.UTC(2026, 8, 15, 12)),
  );

  repositorioTransacionalMock
    .buscarLoteParaRegistrarProducao
    .mockResolvedValue(loteAtivo as never);

  repositorioTransacionalMock
    .buscarOuCriarLoteEstoqueOvoDoDia
    .mockResolvedValue({
      leo_id: 55,
    } as never);

  repositorioTransacionalMock.registrarMovimentoOvo
    .mockResolvedValue({
      mvo_id: 1,
    } as never);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("registrarProducaoLote", () => {
  it("registra produção somente comercial", async () => {
    const resultado = await registrarProducaoLote(
      dadosBase,
    );

    expect(resultado.sucesso).toBe(true);

    expect(
      executarRegistroProducaoComBloqueio,
    ).toHaveBeenCalledWith(
      1,
      expect.any(Function),
    );

    expect(
      repositorioTransacionalMock.registrarMovimentoOvo,
    ).toHaveBeenCalledTimes(1);

    expect(
      repositorioTransacionalMock.registrarMovimentoOvo,
    ).toHaveBeenCalledWith({
      leoId: 55,
      usuarioId: 9,
      data: dadosBase.data,
      tipo: "COLETA",
      quantidade: 10,
    });
  });

  it("registra produção com perda criando os dois movimentos", async () => {
    const resultado = await registrarProducaoLote({
      ...dadosBase,
      quantidadeComercial: 8,
      quantidadePerda: 2,
    });

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock.registrarMovimentoOvo,
    ).toHaveBeenCalledTimes(2);

    expect(
      repositorioTransacionalMock.registrarMovimentoOvo,
    ).toHaveBeenNthCalledWith(1, {
      leoId: 55,
      usuarioId: 9,
      data: dadosBase.data,
      tipo: "COLETA",
      quantidade: 10,
    });

    expect(
      repositorioTransacionalMock.registrarMovimentoOvo,
    ).toHaveBeenNthCalledWith(2, {
      leoId: 55,
      usuarioId: 9,
      data: dadosBase.data,
      tipo: "PERDA",
      quantidade: 2,
    });
  });

  it("rejeita quando comercial e perda são ambos zero", async () => {
    const resultado = await registrarProducaoLote({
      ...dadosBase,
      quantidadeComercial: 0,
      quantidadePerda: 0,
    });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarRegistroProducaoComBloqueio,
    ).not.toHaveBeenCalled();

    expect(
      repositorioTransacionalMock.registrarMovimentoOvo,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quantidade fracionada", async () => {
    const resultado = await registrarProducaoLote({
      ...dadosBase,
      quantidadeComercial: 1.5,
    });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarRegistroProducaoComBloqueio,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quantidade negativa", async () => {
    const resultado = await registrarProducaoLote({
      ...dadosBase,
      quantidadePerda: -1,
    });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarRegistroProducaoComBloqueio,
    ).not.toHaveBeenCalled();
  });

  it("rejeita uma data futura", async () => {
    const resultado = await registrarProducaoLote({
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
      executarRegistroProducaoComBloqueio,
    ).not.toHaveBeenCalled();
  });

  it("rejeita uma data anterior ao alojamento", async () => {
    const resultado = await registrarProducaoLote({
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
      repositorioTransacionalMock.registrarMovimentoOvo,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quando o lote não existe", async () => {
    repositorioTransacionalMock
      .buscarLoteParaRegistrarProducao
      .mockResolvedValue(null);

    const resultado = await registrarProducaoLote(
      dadosBase,
    );

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Lote não encontrado.",
      );
    }

    expect(
      repositorioTransacionalMock.registrarMovimentoOvo,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quando o lote está finalizado", async () => {
    repositorioTransacionalMock
      .buscarLoteParaRegistrarProducao
      .mockResolvedValue({
        ...loteAtivo,
        lta_status: "FINALIZADO",
      } as never);

    const resultado = await registrarProducaoLote(
      dadosBase,
    );

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /lote finalizado/,
      );
    }

    expect(
      repositorioTransacionalMock.registrarMovimentoOvo,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quantidade maior que o saldo atual de aves", async () => {
    const resultado = await registrarProducaoLote({
      ...dadosBase,
      quantidadeComercial: 93,
    });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /saldo atual de 92 aves/,
      );
    }

    expect(
      repositorioTransacionalMock.registrarMovimentoOvo,
    ).not.toHaveBeenCalled();
  });

  it("permite registrar exatamente o saldo disponível de aves", async () => {
    const resultado = await registrarProducaoLote({
      ...dadosBase,
      quantidadeComercial: 92,
    });

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock.registrarMovimentoOvo,
    ).toHaveBeenCalledTimes(1);
  });

  it("rejeita quando o lote não possui aves disponíveis", async () => {
    repositorioTransacionalMock
      .buscarLoteParaRegistrarProducao
      .mockResolvedValue({
        ...loteAtivo,
        mortalidade_descarte: [
          {
            mor_quantidade: 100,
          },
        ],
      } as never);

    const resultado = await registrarProducaoLote(
      dadosBase,
    );

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /não possui aves disponíveis/,
      );
    }

    expect(
      repositorioTransacionalMock.registrarMovimentoOvo,
    ).not.toHaveBeenCalled();
  });
});
