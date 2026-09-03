import { prisma } from "../database/prisma";

type CriarFornecedorDados = {
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  email: string;
  telefonePrincipal: string;
  telefoneSecundario: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  categoriaId: number;
};

type AtualizarFornecedorDados = CriarFornecedorDados;

type FornecedorStatus = "ATIVO" | "INATIVO";

const selectFornecedor = {
  for_id: true,
  for_razao_social: true,
  for_nome_fantasia: true,
  for_cnpj: true,
  for_email: true,
  for_telefone_principal: true,
  for_telefone_secundario: true,
  for_cep: true,
  for_logradouro: true,
  for_numero: true,
  for_bairro: true,
  for_cidade: true,
  for_estado: true,
  for_status: true,
  ctf_id: true,
  categoria_fornecedor: {
    select: {
      ctf_id: true,
      ctf_descricao: true,
    },
  },
} as const;

export async function listarFornecedores() {
  return prisma.fornecedor.findMany({
    select: selectFornecedor,
    orderBy: {
      for_razao_social: "asc",
    },
  });
}

export async function listarFornecedoresAtivos() {
  return prisma.fornecedor.findMany({
    where: {
      for_status: "ATIVO",
    },
    select: {
      for_id: true,
      for_razao_social: true,
      for_nome_fantasia: true,
    },
    orderBy: {
      for_razao_social: "asc",
    },
  });
}

export async function buscarFornecedorPorId(id: number) {
  return prisma.fornecedor.findUnique({
    where: {
      for_id: id,
    },
    select: selectFornecedor,
  });
}

export async function buscarFornecedorPorCnpj(cnpj: string) {
  return prisma.fornecedor.findUnique({
    where: {
      for_cnpj: cnpj,
    },
    select: {
      for_id: true,
    },
  });
}

export async function buscarFornecedorPorEmail(email: string) {
  return prisma.fornecedor.findUnique({
    where: {
      for_email: email,
    },
    select: {
      for_id: true,
    },
  });
}

export async function criarFornecedor(dados: CriarFornecedorDados) {
  return prisma.fornecedor.create({
    data: {
      for_razao_social: dados.razaoSocial,
      for_nome_fantasia: dados.nomeFantasia,
      for_cnpj: dados.cnpj,
      for_email: dados.email,
      for_telefone_principal: dados.telefonePrincipal,
      for_telefone_secundario: dados.telefoneSecundario,
      for_cep: dados.cep,
      for_logradouro: dados.logradouro,
      for_numero: dados.numero,
      for_bairro: dados.bairro,
      for_cidade: dados.cidade,
      for_estado: dados.estado,
      ctf_id: dados.categoriaId,
      for_status: "ATIVO",
    },
    select: selectFornecedor,
  });
}

export async function atualizarFornecedor(
  id: number,
  dados: AtualizarFornecedorDados
) {
  return prisma.fornecedor.update({
    where: {
      for_id: id,
    },
    data: {
      for_razao_social: dados.razaoSocial,
      for_nome_fantasia: dados.nomeFantasia,
      for_cnpj: dados.cnpj,
      for_email: dados.email,
      for_telefone_principal: dados.telefonePrincipal,
      for_telefone_secundario: dados.telefoneSecundario,
      for_cep: dados.cep,
      for_logradouro: dados.logradouro,
      for_numero: dados.numero,
      for_bairro: dados.bairro,
      for_cidade: dados.cidade,
      for_estado: dados.estado,
      ctf_id: dados.categoriaId,
    },
    select: selectFornecedor,
  });
}

export async function atualizarStatusFornecedor(
  id: number,
  status: FornecedorStatus
) {
  return prisma.fornecedor.update({
    where: {
      for_id: id,
    },
    data: {
      for_status: status,
    },
    select: selectFornecedor,
  });
}

export async function buscarHistoricoFornecimento(id: number) {
  const [lotesAves, entradasInsumo] = await Promise.all([
    prisma.lote_aves.findMany({
      where: {
        for_id: id,
      },
      select: {
        lta_id: true,
        lta_codigo_qr_code: true,
        lta_data_alojamento: true,
        lta_quant_inicial: true,
        lta_status: true,
        linhagem: {
          select: {
            lin_nome: true,
          },
        },
      },
      orderBy: {
        lta_data_alojamento: "desc",
      },
    }),
    prisma.lote_estoque_insumo.findMany({
      where: {
        for_id: id,
      },
      select: {
        lei_id: true,
        lei_data_entrada: true,
        lei_lote_fabricante: true,
        insumo: {
          select: {
            ins_nome: true,
          },
        },
      },
      orderBy: {
        lei_data_entrada: "desc",
      },
    }),
  ]);

  return {
    lotesAves,
    entradasInsumo,
  };
}
