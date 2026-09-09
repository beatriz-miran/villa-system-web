import "dotenv/config";

import { prisma } from "../infrastructure/database/prisma";

const tiposOvo = [
  {
    tov_nome: "Branco",
    tov_descricao: "Ovos de casca branca ou esbranquiçada.",
  },
  {
    tov_nome: "Marrom",
    tov_descricao:
      "Ovos de casca marrom, castanha ou avermelhada, também chamados popularmente de ovos vermelhos.",
  },
];

// Fonte: Hy-Line Brown Commercial Layers - Alternative Systems,
// International Standards, maio de 2026.
// Cada meta representa o ponto medio entre os limites inferior e superior
// publicados no guia oficial da linhagem.
const metasHyLineBrownSistemaAlternativo = [
  { semana: 1, pesoMetaGramas: 70.5, consumoMetaGramas: 18, produtividadeMetaPercentual: null },
  { semana: 2, pesoMetaGramas: 122.5, consumoMetaGramas: 20.5, produtividadeMetaPercentual: null },
  { semana: 3, pesoMetaGramas: 191, consumoMetaGramas: 24, produtividadeMetaPercentual: null },
  { semana: 4, pesoMetaGramas: 273, consumoMetaGramas: 29.5, produtividadeMetaPercentual: null },
  { semana: 5, pesoMetaGramas: 367, consumoMetaGramas: 36.5, produtividadeMetaPercentual: null },
  { semana: 6, pesoMetaGramas: 469.5, consumoMetaGramas: 43, produtividadeMetaPercentual: null },
  { semana: 7, pesoMetaGramas: 577, consumoMetaGramas: 49, produtividadeMetaPercentual: null },
  { semana: 8, pesoMetaGramas: 687, consumoMetaGramas: 55, produtividadeMetaPercentual: null },
  { semana: 9, pesoMetaGramas: 794, consumoMetaGramas: 60, produtividadeMetaPercentual: null },
  { semana: 10, pesoMetaGramas: 896, consumoMetaGramas: 64.5, produtividadeMetaPercentual: null },
  { semana: 11, pesoMetaGramas: 990, consumoMetaGramas: 68.5, produtividadeMetaPercentual: null },
  { semana: 12, pesoMetaGramas: 1075.5, consumoMetaGramas: 71, produtividadeMetaPercentual: null },
  { semana: 13, pesoMetaGramas: 1152, consumoMetaGramas: 73, produtividadeMetaPercentual: null },
  { semana: 14, pesoMetaGramas: 1220, consumoMetaGramas: 75.5, produtividadeMetaPercentual: null },
  { semana: 15, pesoMetaGramas: 1281.5, consumoMetaGramas: 77, produtividadeMetaPercentual: null },
  { semana: 16, pesoMetaGramas: 1339.5, consumoMetaGramas: 80, produtividadeMetaPercentual: null },
  { semana: 17, pesoMetaGramas: 1395.5, consumoMetaGramas: 84, produtividadeMetaPercentual: null },
  { semana: 18, pesoMetaGramas: 1451.5, consumoMetaGramas: 89, produtividadeMetaPercentual: 6.5 },
  { semana: 19, pesoMetaGramas: 1509, consumoMetaGramas: 94.5, produtividadeMetaPercentual: 23.4 },
  { semana: 20, pesoMetaGramas: 1567.5, consumoMetaGramas: 100.5, produtividadeMetaPercentual: 51.3 },
  { semana: 21, pesoMetaGramas: 1627, consumoMetaGramas: 105, produtividadeMetaPercentual: 74.5 },
  { semana: 22, pesoMetaGramas: 1684.5, consumoMetaGramas: 110, produtividadeMetaPercentual: 85.75 },
  { semana: 23, pesoMetaGramas: 1739.5, consumoMetaGramas: 113.5, produtividadeMetaPercentual: 89.9 },
  { semana: 24, pesoMetaGramas: 1788.5, consumoMetaGramas: 116, produtividadeMetaPercentual: 91.85 },
  { semana: 25, pesoMetaGramas: 1829.5, consumoMetaGramas: 117, produtividadeMetaPercentual: 93.2 },
  { semana: 26, pesoMetaGramas: 1862, consumoMetaGramas: 118.5, produtividadeMetaPercentual: 93.85 },
  { semana: 27, pesoMetaGramas: 1884.5, consumoMetaGramas: 118.5, produtividadeMetaPercentual: 94.1 },
  { semana: 28, pesoMetaGramas: 1900, consumoMetaGramas: 119.5, produtividadeMetaPercentual: 94.3 },
  { semana: 29, pesoMetaGramas: 1910.5, consumoMetaGramas: 119.5, produtividadeMetaPercentual: 94.5 },
  { semana: 30, pesoMetaGramas: 1917.5, consumoMetaGramas: 119.5, produtividadeMetaPercentual: 94.7 },
  { semana: 31, pesoMetaGramas: 1924, consumoMetaGramas: 119, produtividadeMetaPercentual: 94.85 },
  { semana: 32, pesoMetaGramas: 1930.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 94.95 },
  { semana: 33, pesoMetaGramas: 1937, consumoMetaGramas: 119, produtividadeMetaPercentual: 95.05 },
  { semana: 34, pesoMetaGramas: 1943.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 95.1 },
  { semana: 35, pesoMetaGramas: 1950, consumoMetaGramas: 119, produtividadeMetaPercentual: 95.15 },
  { semana: 36, pesoMetaGramas: 1957, consumoMetaGramas: 119, produtividadeMetaPercentual: 95.15 },
  { semana: 37, pesoMetaGramas: 1963.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 95.05 },
  { semana: 38, pesoMetaGramas: 1968.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 95.05 },
  { semana: 39, pesoMetaGramas: 1972, consumoMetaGramas: 119, produtividadeMetaPercentual: 94.95 },
  { semana: 40, pesoMetaGramas: 1976, consumoMetaGramas: 119, produtividadeMetaPercentual: 94.85 },
  { semana: 41, pesoMetaGramas: 1978.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 94.75 },
  { semana: 42, pesoMetaGramas: 1983, consumoMetaGramas: 119, produtividadeMetaPercentual: 94.6 },
  { semana: 43, pesoMetaGramas: 1986.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 94.45 },
  { semana: 44, pesoMetaGramas: 1988.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 94.3 },
  { semana: 45, pesoMetaGramas: 1991, consumoMetaGramas: 119, produtividadeMetaPercentual: 94.2 },
  { semana: 46, pesoMetaGramas: 1993, consumoMetaGramas: 119, produtividadeMetaPercentual: 94 },
  { semana: 47, pesoMetaGramas: 1995, consumoMetaGramas: 119, produtividadeMetaPercentual: 93.85 },
  { semana: 48, pesoMetaGramas: 1996.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 93.7 },
  { semana: 49, pesoMetaGramas: 1998.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 93.5 },
  { semana: 50, pesoMetaGramas: 1999.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 93.3 },
  { semana: 51, pesoMetaGramas: 2001.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 93.1 },
  { semana: 52, pesoMetaGramas: 2003, consumoMetaGramas: 119, produtividadeMetaPercentual: 92.9 },
  { semana: 53, pesoMetaGramas: 2005, consumoMetaGramas: 119, produtividadeMetaPercentual: 92.7 },
  { semana: 54, pesoMetaGramas: 2006, consumoMetaGramas: 119, produtividadeMetaPercentual: 92.5 },
  { semana: 55, pesoMetaGramas: 2007.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 92.2 },
  { semana: 56, pesoMetaGramas: 2009.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 92 },
  { semana: 57, pesoMetaGramas: 2010.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 91.7 },
  { semana: 58, pesoMetaGramas: 2012, consumoMetaGramas: 119, produtividadeMetaPercentual: 91.5 },
  { semana: 59, pesoMetaGramas: 2013.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 91.2 },
  { semana: 60, pesoMetaGramas: 2015, consumoMetaGramas: 119, produtividadeMetaPercentual: 90.9 },
  { semana: 61, pesoMetaGramas: 2016, consumoMetaGramas: 119, produtividadeMetaPercentual: 90.6 },
  { semana: 62, pesoMetaGramas: 2017.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 90.3 },
  { semana: 63, pesoMetaGramas: 2019, consumoMetaGramas: 119, produtividadeMetaPercentual: 89.9 },
  { semana: 64, pesoMetaGramas: 2020.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 89.55 },
  { semana: 65, pesoMetaGramas: 2022, consumoMetaGramas: 119, produtividadeMetaPercentual: 89.2 },
  { semana: 66, pesoMetaGramas: 2023, consumoMetaGramas: 119, produtividadeMetaPercentual: 88.8 },
  { semana: 67, pesoMetaGramas: 2024.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 88.45 },
  { semana: 68, pesoMetaGramas: 2025.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 88.05 },
  { semana: 69, pesoMetaGramas: 2027, consumoMetaGramas: 119, produtividadeMetaPercentual: 87.65 },
  { semana: 70, pesoMetaGramas: 2028.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 87.25 },
  { semana: 71, pesoMetaGramas: 2029.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 86.85 },
  { semana: 72, pesoMetaGramas: 2030.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 86.45 },
  { semana: 73, pesoMetaGramas: 2032, consumoMetaGramas: 119, produtividadeMetaPercentual: 86 },
  { semana: 74, pesoMetaGramas: 2033, consumoMetaGramas: 119, produtividadeMetaPercentual: 85.55 },
  { semana: 75, pesoMetaGramas: 2034, consumoMetaGramas: 119, produtividadeMetaPercentual: 85.15 },
  { semana: 76, pesoMetaGramas: 2035.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 84.75 },
  { semana: 77, pesoMetaGramas: 2036.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 84.3 },
  { semana: 78, pesoMetaGramas: 2037.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 83.85 },
  { semana: 79, pesoMetaGramas: 2038.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 83.4 },
  { semana: 80, pesoMetaGramas: 2040, consumoMetaGramas: 119, produtividadeMetaPercentual: 82.95 },
  { semana: 81, pesoMetaGramas: 2041, consumoMetaGramas: 119, produtividadeMetaPercentual: 82.5 },
  { semana: 82, pesoMetaGramas: 2041.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 82 },
  { semana: 83, pesoMetaGramas: 2042.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 81.6 },
  { semana: 84, pesoMetaGramas: 2043.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 81.1 },
  { semana: 85, pesoMetaGramas: 2044.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 80.65 },
  { semana: 86, pesoMetaGramas: 2045.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 80.2 },
  { semana: 87, pesoMetaGramas: 2046.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 79.75 },
  { semana: 88, pesoMetaGramas: 2047.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 79.25 },
  { semana: 89, pesoMetaGramas: 2048.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 78.75 },
  { semana: 90, pesoMetaGramas: 2049.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 78.35 },
  { semana: 91, pesoMetaGramas: 2050.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 77.85 },
  { semana: 92, pesoMetaGramas: 2051, consumoMetaGramas: 119, produtividadeMetaPercentual: 77.35 },
  { semana: 93, pesoMetaGramas: 2052, consumoMetaGramas: 119, produtividadeMetaPercentual: 76.85 },
  { semana: 94, pesoMetaGramas: 2053, consumoMetaGramas: 119, produtividadeMetaPercentual: 76.4 },
  { semana: 95, pesoMetaGramas: 2053, consumoMetaGramas: 119, produtividadeMetaPercentual: 75.9 },
  { semana: 96, pesoMetaGramas: 2054, consumoMetaGramas: 119, produtividadeMetaPercentual: 75.4 },
  { semana: 97, pesoMetaGramas: 2055, consumoMetaGramas: 119, produtividadeMetaPercentual: 74.9 },
  { semana: 98, pesoMetaGramas: 2055.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 74.45 },
  { semana: 99, pesoMetaGramas: 2056.5, consumoMetaGramas: 119, produtividadeMetaPercentual: 73.95 },
  { semana: 100, pesoMetaGramas: 2057, consumoMetaGramas: 119, produtividadeMetaPercentual: 73.5 },
];

const descricaoHyLineBrown =
  "Poedeira comercial de ovos marrons para sistemas alternativos, livres ou caipiras. Metas baseadas no guia internacional Hy-Line de maio de 2026.";

async function executarSeed() {
  for (const tipoOvo of tiposOvo) {
    await prisma.tipo_ovo.upsert({
      where: {
        tov_nome: tipoOvo.tov_nome,
      },
      update: {
        tov_descricao: tipoOvo.tov_descricao,
      },
      create: tipoOvo,
    });
  }

  const tipoOvoMarrom = await prisma.tipo_ovo.findUniqueOrThrow({
    where: {
      tov_nome: "Marrom",
    },
    select: {
      tov_id: true,
    },
  });

  const hyLineBrown = await prisma.linhagem.upsert({
    where: {
      lin_nome: "Hy-Line Brown",
    },
    update: {},
    create: {
      lin_nome: "Hy-Line Brown",
      lin_descricao: descricaoHyLineBrown,
      tov_id: tipoOvoMarrom.tov_id,
    },
    select: {
      lin_id: true,
    },
  });

  for (const meta of metasHyLineBrownSistemaAlternativo) {
    await prisma.meta_linhagem_semanal.upsert({
      where: {
        lin_id_mls_semana: {
          lin_id: hyLineBrown.lin_id,
          mls_semana: meta.semana,
        },
      },
      update: {},
      create: {
        lin_id: hyLineBrown.lin_id,
        mls_semana: meta.semana,
        mls_peso_meta_gramas: meta.pesoMetaGramas,
        mls_consumo_meta_gramas: meta.consumoMetaGramas,
        mls_produtividade_meta_percentual:
          meta.produtividadeMetaPercentual,
      },
    });
  }

  const quantidadeMetasCadastradas =
    await prisma.meta_linhagem_semanal.count({
      where: {
        lin_id: hyLineBrown.lin_id,
        mls_semana: {
          in: metasHyLineBrownSistemaAlternativo.map((meta) => meta.semana),
        },
      },
    });

  if (
    quantidadeMetasCadastradas !==
    metasHyLineBrownSistemaAlternativo.length
  ) {
    throw new Error(
      "O cadastro das metas semanais da Hy-Line Brown ficou incompleto."
    );
  }

  console.log("Tipos de ovo Branco e Marrom cadastrados com sucesso.");
  console.log(
    `Hy-Line Brown cadastrada com ${quantidadeMetasCadastradas} metas semanais para sistema alternativo.`
  );
}

executarSeed()
  .catch((erro) => {
    console.error("Não foi possível cadastrar os tipos de ovo:", erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
