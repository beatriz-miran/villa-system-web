import { beforeEach, describe, expect, it, vi } from "vitest";

import { criarLote } from "./criar-lote";

vi.mock("@/infrastructure/repositories/galpao-repository", () => ({
  buscarGalpaoPorId: vi.fn(),
  existeLoteAtivoNoGalpao: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/fornecedor-repository", () => ({
  buscarFornecedorPorId: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/linhagem-repository", () => ({
  buscarLinhagemPorId: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/lote-repository", () => ({
  buscarLotePorCodigo: vi.fn(),
  criarLote: vi.fn(),
}));

import {
  buscarGalpaoPorId,
  existeLoteAtivoNoGalpao,
} from "@/infrastructure/repositories/galpao-repository";
import { buscarFornecedorPorId } from "@/infrastructure/repositories/fornecedor-repository";
import { buscarLinhagemPorId } from "@/infrastructure/repositories/linhagem-repository";
import {
  buscarLotePorCodigo,
  criarLote as criarLoteRepository,
} from "@/infrastructure/repositories/lote-repository";

const linhagemAtiva = { lin_id: 1, lin_status: "ATIVO" };
const galpaoDisponivel = {
  gal_id: 2,
  gal_status: "ATIVO",
  gal_area_m2: 100,
};
const fornecedorAtivo = { for_id: 3, for_status: "ATIVO" };

const dadosBase = {
  linhagemId: 1,
  galpaoId: 2,
  fornecedorId: 3,
  quantidadeInicial: 500,
  dataAlojamento: new Date(Date.UTC(2020, 0, 1)),
  registradoPorId: 9,
};

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(buscarLinhagemPorId).mockResolvedValue(
    linhagemAtiva as never
  );
  vi.mocked(buscarGalpaoPorId).mockResolvedValue(
    galpaoDisponivel as never
  );
  vi.mocked(buscarFornecedorPorId).mockResolvedValue(
    fornecedorAtivo as never
  );
  vi.mocked(existeLoteAtivoNoGalpao).mockResolvedValue(false);
  vi.mocked(buscarLotePorCodigo).mockResolvedValue(null);
  vi.mocked(criarLoteRepository).mockResolvedValue({} as never);
});

describe("criarLote", () => {
  it("cadastra o lote quando todos os dados são válidos", async () => {
    const resultado = await criarLote(dadosBase);

    expect(resultado.sucesso).toBe(true);
    expect(criarLoteRepository).toHaveBeenCalledTimes(1);
  });

  it("rejeita quantidade inicial menor ou igual a zero", async () => {
    const resultado = await criarLote({
      ...dadosBase,
      quantidadeInicial: 0,
    });

    expect(resultado.sucesso).toBe(false);
    expect(criarLoteRepository).not.toHaveBeenCalled();
  });

  it("rejeita quando o galpão já possui um lote ativo", async () => {
    vi.mocked(existeLoteAtivoNoGalpao).mockResolvedValue(true);

    const resultado = await criarLote(dadosBase);

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(/já possui um lote ativo/);
    }
    expect(criarLoteRepository).not.toHaveBeenCalled();
  });

  it("rejeita quando o galpão não está disponível (status diferente de ATIVO)", async () => {
    vi.mocked(buscarGalpaoPorId).mockResolvedValue({
      ...galpaoDisponivel,
      gal_status: "MANUTENCAO",
    } as never);

    const resultado = await criarLote(dadosBase);

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(/não está disponível/);
    }
    expect(criarLoteRepository).not.toHaveBeenCalled();
  });

  it("rejeita quando a quantidade excede a capacidade máxima do galpão", async () => {
    // área de 100 m² * 7 aves/m² = capacidade máxima de 700 aves
    const resultado = await criarLote({
      ...dadosBase,
      quantidadeInicial: 701,
    });

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(/excede a capacidade máxima/);
    }
    expect(criarLoteRepository).not.toHaveBeenCalled();
  });

  it("rejeita datas de alojamento futuras", async () => {
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 1);

    const resultado = await criarLote({
      ...dadosBase,
      dataAlojamento: dataFutura,
    });

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.mensagem).toMatch(/não pode ser uma data futura/);
    }
    expect(criarLoteRepository).not.toHaveBeenCalled();
  });

  it("rejeita quando a linhagem não existe", async () => {
    vi.mocked(buscarLinhagemPorId).mockResolvedValue(null);

    const resultado = await criarLote(dadosBase);

    expect(resultado.sucesso).toBe(false);
    expect(criarLoteRepository).not.toHaveBeenCalled();
  });

  it("rejeita quando o fornecedor está inativo", async () => {
    vi.mocked(buscarFornecedorPorId).mockResolvedValue({
      ...fornecedorAtivo,
      for_status: "INATIVO",
    } as never);

    const resultado = await criarLote(dadosBase);

    expect(resultado.sucesso).toBe(false);
    expect(criarLoteRepository).not.toHaveBeenCalled();
  });

  it("tenta novamente ao gerar um código já existente, até encontrar um único", async () => {
    vi.mocked(buscarLotePorCodigo)
      .mockResolvedValueOnce({ lta_id: 999 } as never)
      .mockResolvedValueOnce(null);

    const resultado = await criarLote(dadosBase);

    expect(resultado.sucesso).toBe(true);
    expect(buscarLotePorCodigo).toHaveBeenCalledTimes(2);
    expect(criarLoteRepository).toHaveBeenCalledTimes(1);
  });
});
