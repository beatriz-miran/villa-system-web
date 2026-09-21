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
    buscarLoteParaAtualizacao: vi.fn(),
    atualizarLote: vi.fn(),
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
  "@/infrastructure/repositories/fornecedor-repository",
  () => ({
    buscarFornecedorPorId: vi.fn(),
  }),
);

vi.mock(
  "@/infrastructure/repositories/galpao-repository",
  () => ({
    buscarGalpaoPorId: vi.fn(),
    existeLoteAtivoNoGalpao: vi.fn(),
  }),
);

vi.mock(
  "@/infrastructure/repositories/linhagem-repository",
  () => ({
    buscarLinhagemPorId: vi.fn(),
  }),
);

vi.mock(
  "@/infrastructure/repositories/lote-repository",
  () => ({
    executarAtualizacaoLoteComBloqueio:
      vi.fn(
        async (
          _id: number,
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

import { buscarFornecedorPorId } from "@/infrastructure/repositories/fornecedor-repository";
import {
  buscarGalpaoPorId,
  existeLoteAtivoNoGalpao,
} from "@/infrastructure/repositories/galpao-repository";
import { buscarLinhagemPorId } from "@/infrastructure/repositories/linhagem-repository";
import { executarAtualizacaoLoteComBloqueio } from "@/infrastructure/repositories/lote-repository";

import { atualizarLote } from "./atualizar-lote";

const linhagemAtiva = {
  lin_id: 1,
  lin_status: "ATIVO",
  lin_densidade_maxima_aves_m2: 7,
};

const galpaoAtivo = {
  gal_id: 2,
  gal_status: "ATIVO",
  gal_area_m2: 100,
};

const fornecedorAtivo = {
  for_id: 3,
  for_status: "ATIVO",
};

const loteAtivoSemHistorico = {
  lta_id: 10,
  lta_quant_inicial: 100,
  lta_idade_inicial: 2,
  lta_data_alojamento: new Date(
    Date.UTC(2026, 8, 1),
  ),
  lta_status: "ATIVO",
  lin_id: 1,
  gal_id: 2,
  for_id: 3,
  mortalidade_descarte: [],
};

const dadosBase = {
  id: 10,
  linhagemId: 1,
  galpaoId: 2,
  fornecedorId: 3,
  quantidadeInicial: 100,
  idadeInicialDias: 2,
  dataAlojamento: new Date(
    Date.UTC(2026, 8, 1),
  ),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();

  vi.setSystemTime(
    new Date(Date.UTC(2026, 8, 15, 12)),
  );

  vi.mocked(
    buscarLinhagemPorId,
  ).mockResolvedValue(
    linhagemAtiva as never,
  );

  vi.mocked(
    buscarGalpaoPorId,
  ).mockResolvedValue(
    galpaoAtivo as never,
  );

  vi.mocked(
    buscarFornecedorPorId,
  ).mockResolvedValue(
    fornecedorAtivo as never,
  );

  vi.mocked(
    existeLoteAtivoNoGalpao,
  ).mockResolvedValue(false);

  repositorioTransacionalMock
    .buscarLoteParaAtualizacao
    .mockResolvedValue(
      loteAtivoSemHistorico as never,
    );

  repositorioTransacionalMock
    .atualizarLote
    .mockResolvedValue({} as never);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("atualizarLote", () => {
  it("atualiza um lote ativo sem histórico", async () => {
    const resultado =
      await atualizarLote(dadosBase);

    expect(resultado.sucesso).toBe(true);

    expect(
      executarAtualizacaoLoteComBloqueio,
    ).toHaveBeenCalledWith(
      10,
      expect.any(Function),
    );

    expect(
      repositorioTransacionalMock.atualizarLote,
    ).toHaveBeenCalledWith({
      linhagemId: 1,
      galpaoId: 2,
      fornecedorId: 3,
      quantidadeInicial: 100,
      idadeInicialDias: 2,
      dataAlojamento:
        dadosBase.dataAlojamento,
    });
  });

  it("rejeita quantidade inicial igual a zero", async () => {
    const resultado =
      await atualizarLote({
        ...dadosBase,
        quantidadeInicial: 0,
      });

    expect(resultado.sucesso).toBe(false);

    expect(
      executarAtualizacaoLoteComBloqueio,
    ).not.toHaveBeenCalled();
  });

  it("rejeita quando o lote não existe", async () => {
    repositorioTransacionalMock
      .buscarLoteParaAtualizacao
      .mockResolvedValue(null);

    const resultado =
      await atualizarLote(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toBe(
        "Lote não encontrado.",
      );
    }

    expect(
      repositorioTransacionalMock.atualizarLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita a edição de um lote finalizado", async () => {
    repositorioTransacionalMock
      .buscarLoteParaAtualizacao
      .mockResolvedValue({
        ...loteAtivoSemHistorico,
        lta_status: "FINALIZADO",
      } as never);

    const resultado =
      await atualizarLote(dadosBase);

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /finalizados não podem ser editados/,
      );
    }

    expect(
      repositorioTransacionalMock.atualizarLote,
    ).not.toHaveBeenCalled();
  });

  it("bloqueia a alteração da origem quando existe histórico", async () => {
    repositorioTransacionalMock
      .buscarLoteParaAtualizacao
      .mockResolvedValue({
        ...loteAtivoSemHistorico,
        mortalidade_descarte: [
          {
            mor_data: new Date(
              Date.UTC(2026, 8, 5),
            ),
            mor_quantidade: 2,
            mor_status_registro: "ATIVO",
          },
        ],
      } as never);

    vi.mocked(
      buscarLinhagemPorId,
    ).mockResolvedValue({
      ...linhagemAtiva,
      lin_id: 99,
    } as never);

    const resultado =
      await atualizarLote({
        ...dadosBase,
        linhagemId: 99,
      });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /não podem ser alterados/,
      );
    }

    expect(
      repositorioTransacionalMock.atualizarLote,
    ).not.toHaveBeenCalled();
  });

  it("permite corrigir dados iniciais sem alterar a origem", async () => {
    repositorioTransacionalMock
      .buscarLoteParaAtualizacao
      .mockResolvedValue({
        ...loteAtivoSemHistorico,
        mortalidade_descarte: [
          {
            mor_data: new Date(
              Date.UTC(2026, 8, 10),
            ),
            mor_quantidade: 5,
            mor_status_registro: "ATIVO",
          },
        ],
      } as never);

    const resultado =
      await atualizarLote({
        ...dadosBase,
        quantidadeInicial: 120,
        idadeInicialDias: 3,
      });

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock.atualizarLote,
    ).toHaveBeenCalledTimes(1);
  });

  it("rejeita quantidade inicial menor que as baixas ativas", async () => {
    repositorioTransacionalMock
      .buscarLoteParaAtualizacao
      .mockResolvedValue({
        ...loteAtivoSemHistorico,
        mortalidade_descarte: [
          {
            mor_data: new Date(
              Date.UTC(2026, 8, 5),
            ),
            mor_quantidade: 8,
            mor_status_registro: "ATIVO",
          },
          {
            mor_data: new Date(
              Date.UTC(2026, 8, 6),
            ),
            mor_quantidade: 4,
            mor_status_registro: "ATIVO",
          },
        ],
      } as never);

    const resultado =
      await atualizarLote({
        ...dadosBase,
        quantidadeInicial: 11,
      });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /total de 12 aves em baixas ativas/,
      );
    }

    expect(
      repositorioTransacionalMock.atualizarLote,
    ).not.toHaveBeenCalled();
  });

  it("não desconta registros estornados do saldo", async () => {
    repositorioTransacionalMock
      .buscarLoteParaAtualizacao
      .mockResolvedValue({
        ...loteAtivoSemHistorico,
        mortalidade_descarte: [
          {
            mor_data: new Date(
              Date.UTC(2026, 8, 5),
            ),
            mor_quantidade: 80,
            mor_status_registro:
              "ESTORNADO",
          },
        ],
      } as never);

    const resultado =
      await atualizarLote({
        ...dadosBase,
        quantidadeInicial: 10,
      });

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock.atualizarLote,
    ).toHaveBeenCalledTimes(1);
  });

  it("rejeita alojamento posterior à primeira baixa mesmo se ela foi estornada", async () => {
    repositorioTransacionalMock
      .buscarLoteParaAtualizacao
      .mockResolvedValue({
        ...loteAtivoSemHistorico,
        mortalidade_descarte: [
          {
            mor_data: new Date(
              Date.UTC(2026, 8, 10),
            ),
            mor_quantidade: 1,
            mor_status_registro:
              "ESTORNADO",
          },
        ],
      } as never);

    const resultado =
      await atualizarLote({
        ...dadosBase,
        dataAlojamento: new Date(
          Date.UTC(2026, 8, 11),
        ),
      });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /primeira baixa registrada em 10\/09\/2026/,
      );
    }

    expect(
      repositorioTransacionalMock.atualizarLote,
    ).not.toHaveBeenCalled();
  });

  it("permite manter uma linhagem atual que depois foi inativada", async () => {
    vi.mocked(
      buscarLinhagemPorId,
    ).mockResolvedValue({
      ...linhagemAtiva,
      lin_status: "INATIVO",
    } as never);

    const resultado =
      await atualizarLote({
        ...dadosBase,
        idadeInicialDias: 4,
      });

    expect(resultado.sucesso).toBe(true);

    expect(
      repositorioTransacionalMock.atualizarLote,
    ).toHaveBeenCalledTimes(1);
  });

  it("rejeita a troca para uma linhagem inativa", async () => {
    vi.mocked(
      buscarLinhagemPorId,
    ).mockResolvedValue({
      ...linhagemAtiva,
      lin_id: 99,
      lin_status: "INATIVO",
    } as never);

    const resultado =
      await atualizarLote({
        ...dadosBase,
        linhagemId: 99,
      });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /linhagem selecionada está inativa/,
      );
    }

    expect(
      repositorioTransacionalMock.atualizarLote,
    ).not.toHaveBeenCalled();
  });

  it("rejeita um galpão que já possui outro lote ativo", async () => {
    vi.mocked(
      existeLoteAtivoNoGalpao,
    ).mockResolvedValue(true);

    const resultado =
      await atualizarLote({
        ...dadosBase,
        galpaoId: 50,
      });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /já possui outro lote ativo/,
      );
    }

    expect(
      executarAtualizacaoLoteComBloqueio,
    ).not.toHaveBeenCalled();
  });

  it("trata a ocupação simultânea do galpão", async () => {
    vi.mocked(
      existeLoteAtivoNoGalpao,
    )
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    repositorioTransacionalMock
      .atualizarLote
      .mockRejectedValue({
        code: "P2002",
      });

    const resultado =
      await atualizarLote({
        ...dadosBase,
        galpaoId: 50,
      });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /já possui outro lote ativo/,
      );
    }

    expect(
      existeLoteAtivoNoGalpao,
    ).toHaveBeenCalledTimes(2);
  });

  it("rejeita quantidade acima da capacidade", async () => {
    const resultado =
      await atualizarLote({
        ...dadosBase,
        quantidadeInicial: 701,
      });

    expect(resultado.sucesso).toBe(false);

    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(
        /capacidade máxima de 700 aves/,
      );
    }

    expect(
      executarAtualizacaoLoteComBloqueio,
    ).not.toHaveBeenCalled();
  });

  it("rejeita data de alojamento futura", async () => {
    const resultado =
      await atualizarLote({
        ...dadosBase,
        dataAlojamento: new Date(
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
      executarAtualizacaoLoteComBloqueio,
    ).not.toHaveBeenCalled();
  });
});