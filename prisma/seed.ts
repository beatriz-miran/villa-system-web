import "dotenv/config";

import { prisma } from "../infrastructure/database/prisma";

type MetaLinhagem = {
  semana: number;
  pesoMetaGramas: number | null;
  consumoMetaGramas: number | null;
  produtividadeMetaPercentual: number | null;
};

type SistemaCartilha =
  | "CAGE_FREE"
  | "CONVENCIONAL"
  | "FREE_RANGE"
  | "GERAL"
  | "SISTEMAS_ALTERNATIVOS";

type CartilhaSeed = {
  titulo: string;
  fonte: string;
  sistema: SistemaCartilha;
  edicao: string | null;
  url: string;
};

type LinhagemSeed = {
  nome: string;
  descricao: string;
  densidadeMaximaAvesM2: number;
  imagemGalinhaUrl: string;
  imagemOvoUrl: string;
  metas: MetaLinhagem[];
  cartilhas: CartilhaSeed[];
};

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

const categoriasFornecedor = [
  "Aves",
  "Embalagens",
  "Equipamentos e manutenção",
  "Higiene e biossegurança",
  "Medicamentos e vacinas",
  "Outros",
  "Rações e suplementos",
  "Serviços",
];

function converterValorMeta(valor: string): number | null {
  if (valor === "-") {
    return null;
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    throw new Error(`Valor inválido encontrado na tabela de metas: ${valor}`);
  }

  return numero;
}

function criarMetasDaTabela(tabela: string): MetaLinhagem[] {
  const metas = tabela
    .trim()
    .split(/\r?\n/)
    .filter((linha) => linha.trim().length > 0)
    .map((linha) => {
      const colunas = linha.trim().split(/\s+/);

      if (colunas.length !== 4) {
        throw new Error(
          `Linha inválida na tabela de metas: "${linha}". Esperadas quatro colunas.`
        );
      }

      const [
        semanaTexto,
        pesoTexto,
        consumoTexto,
        produtividadeTexto,
      ] = colunas as [string, string, string, string];

      const semana = Number(semanaTexto);

      if (!Number.isInteger(semana) || semana <= 0) {
        throw new Error(
          `Semana inválida encontrada na tabela de metas: ${semanaTexto}`
        );
      }

      return {
        semana,
        pesoMetaGramas: converterValorMeta(pesoTexto),
        consumoMetaGramas: converterValorMeta(consumoTexto),
        produtividadeMetaPercentual: converterValorMeta(
          produtividadeTexto
        ),
      };
    });

  const semanasUnicas = new Set(metas.map((meta) => meta.semana));

  if (semanasUnicas.size !== metas.length) {
    throw new Error("A tabela de metas contém semanas duplicadas.");
  }

  return metas;
}

// Hy-Line Brown — Sistemas alternativos.
// Os valores representam os pontos médios das faixas do guia oficial.
const metasHyLineBrown = criarMetasDaTabela(`
1 70.5 18 -
2 122.5 20.5 -
3 191 24 -
4 273 29.5 -
5 367 36.5 -
6 469.5 43 -
7 577 49 -
8 687 55 -
9 794 60 -
10 896 64.5 -
11 990 68.5 -
12 1075.5 71 -
13 1152 73 -
14 1220 75.5 -
15 1281.5 77 -
16 1339.5 80 -
17 1395.5 84 -
18 1451.5 89 6.5
19 1509 94.5 23.4
20 1567.5 100.5 51.3
21 1627 105 74.5
22 1684.5 110 85.75
23 1739.5 113.5 89.9
24 1788.5 116 91.85
25 1829.5 117 93.2
26 1862 118.5 93.85
27 1884.5 118.5 94.1
28 1900 119.5 94.3
29 1910.5 119.5 94.5
30 1917.5 119.5 94.7
31 1924 119 94.85
32 1930.5 119 94.95
33 1937 119 95.05
34 1943.5 119 95.1
35 1950 119 95.15
36 1957 119 95.15
37 1963.5 119 95.05
38 1968.5 119 95.05
39 1972 119 94.95
40 1976 119 94.85
41 1978.5 119 94.75
42 1983 119 94.6
43 1986.5 119 94.45
44 1988.5 119 94.3
45 1991 119 94.2
46 1993 119 94
47 1995 119 93.85
48 1996.5 119 93.7
49 1998.5 119 93.5
50 1999.5 119 93.3
51 2001.5 119 93.1
52 2003 119 92.9
53 2005 119 92.7
54 2006 119 92.5
55 2007.5 119 92.2
56 2009.5 119 92
57 2010.5 119 91.7
58 2012 119 91.5
59 2013.5 119 91.2
60 2015 119 90.9
61 2016 119 90.6
62 2017.5 119 90.3
63 2019 119 89.9
64 2020.5 119 89.55
65 2022 119 89.2
66 2023 119 88.8
67 2024.5 119 88.45
68 2025.5 119 88.05
69 2027 119 87.65
70 2028.5 119 87.25
71 2029.5 119 86.85
72 2030.5 119 86.45
73 2032 119 86
74 2033 119 85.55
75 2034 119 85.15
76 2035.5 119 84.75
77 2036.5 119 84.3
78 2037.5 119 83.85
79 2038.5 119 83.4
80 2040 119 82.95
81 2041 119 82.5
82 2041.5 119 82
83 2042.5 119 81.6
84 2043.5 119 81.1
85 2044.5 119 80.65
86 2045.5 119 80.2
87 2046.5 119 79.75
88 2047.5 119 79.25
89 2048.5 119 78.75
90 2049.5 119 78.35
91 2050.5 119 77.85
92 2051 119 77.35
93 2052 119 76.85
94 2053 119 76.4
95 2053 119 75.9
96 2054 119 75.4
97 2055 119 74.9
98 2055.5 119 74.45
99 2056.5 119 73.95
100 2057 119 73.5
`);

// Embrapa 051 — Quadros 9 e 10 do manual
// "Produção de ovos em sistemas de base ecológica", Embrapa, 2017.
// Semanas 1–19: produtividade ainda não publicada.
// Semanas 20–90: produtividade corresponde à postura por ave alojada.
const metasEmbrapa051 = criarMetasDaTabela(`
1 80 14 -
2 135 19 -
3 195 23 -
4 260 28 -
5 330 32 -
6 415 37 -
7 510 41 -
8 620 46 -
9 735 51 -
10 850 56 -
11 960 61 -
12 1060 65 -
13 1150 70 -
14 1230 74 -
15 1310 79 -
16 1385 83 -
17 1457 87 -
18 1527 92 -
19 1595 96 -
20 1662 100 0.52
21 1728 104 8.81
22 1791 108 30.62
23 1845 111 55.35
24 1894 113 74.56
25 1939 114 84.8
26 1981 115 88.85
27 2018 115 90.45
28 2052 115 90.71
29 2082 115 90.35
30 2110 115 89.73
31 2134 115 89.1
32 2156 115 88.48
33 2177 115 87.85
34 2195 115 87.23
35 2212 115 86.61
36 2217 115 85.98
37 2221 115 85.36
38 2225 115 84.74
39 2228 115 84.11
40 2232 115 83.49
41 2235 115 82.87
42 2239 115 82.24
43 2242 115 81.62
44 2246 115 81
45 2249 115 80.37
46 2252 115 79.75
47 2255 115 79.12
48 2259 115 78.5
49 2262 115 77.88
50 2265 115 77.25
51 2268 115 76.63
52 2271 115 76.01
53 2274 115 75.38
54 2277 115 74.76
55 2280 115 74.14
56 2283 115 73.51
57 2286 115 72.89
58 2289 115 72.27
59 2292 115 71.64
60 2295 115 71.02
61 2298 115 70.39
62 2301 115 69.77
63 2304 115 69.15
64 2307 115 68.52
65 2310 115 67.9
66 2313 115 67.28
67 2316 115 66.65
68 2319 115 66.03
69 2322 115 65.41
70 2325 115 64.78
71 2328 115 64.16
72 2331 115 63.54
73 2334 115 62.91
74 2337 115 62.29
75 2340 115 61.66
76 2343 115 61.04
77 2346 115 60.42
78 2349 115 59.79
79 2352 115 59.17
80 2355 115 58.55
81 2358 115 57.92
82 2361 115 57.3
83 2364 115 56.68
84 2367 115 56.05
85 2370 115 55.43
86 2373 115 54.81
87 2376 115 54.18
88 2379 115 53.56
89 2382 115 52.93
90 2385 115 52.31
`);

// Lohmann Brown-Classic — peso padrão e produção por ave/dia.
// O consumo semanal permanece nulo porque o documento informa conversão
// alimentar, mas não uma meta semanal única em g/ave/dia.
const metasLohmannBrownClassic = criarMetasDaTabela(`
1 75 - -
2 130 - -
3 195 - -
4 273 - -
5 366 - -
6 469 - -
7 573 - -
8 677 - -
9 777 - -
10 873 - -
11 963 - -
12 1047 - -
13 1128 - -
14 1205 - -
15 1279 - -
16 1351 - -
17 1421 - -
18 1493 - -
19 1565 - 8.9
20 1635 - 36.3
21 1701 - 54.3
22 1760 - 71.8
23 1808 - 82.2
24 1846 - 87.7
25 1874 - 90.9
26 1893 - 92.7
27 1906 - 93.8
28 1914 - 94.4
29 1918 - 94.7
30 1921 - 94.9
31 1924 - 95.1
32 1926 - 95.2
33 1929 - 95.3
34 1932 - 95.3
35 1934 - 95.2
36 1936 - 95.1
37 1939 - 94.9
38 1941 - 94.7
39 1944 - 94.6
40 1946 - 94.3
41 1949 - 94.1
42 1952 - 93.9
43 1954 - 93.7
44 1956 - 93.5
45 1959 - 93.2
46 1961 - 92.9
47 1964 - 92.4
48 1966 - 92.1
49 1969 - 91.8
50 1972 - 91.4
51 1974 - 91.1
52 1976 - 90.7
53 1979 - 90.4
54 1981 - 90
55 1985 - 89.7
56 1986 - 89.3
57 1990 - 88.9
58 1992 - 88.5
59 1994 - 88.2
60 1996 - 87.8
61 1999 - 87.4
62 2001 - 87
63 2004 - 86.6
64 2006 - 86.2
65 2009 - 85.8
66 2012 - 85.3
67 2014 - 84.9
68 2016 - 84.5
69 2019 - 84
70 2021 - 83.6
71 2024 - 83
72 2026 - 82.5
73 2029 - 82
74 2032 - 81.5
75 2034 - 80.9
76 2036 - 80.4
77 2039 - 79.8
78 2041 - 79.3
79 2044 - 78.7
80 2046 - 78.2
81 2047 - 77.6
82 2048 - 77
83 2049 - 76.4
84 2050 - 75.9
85 2051 - 75.3
86 2051 - 74.7
87 2052 - 74.1
88 2052 - 73.4
89 2053 - 72.8
90 2053 - 72.2
`);

const linhagensOficiais: LinhagemSeed[] = [
  {
    nome: "Hy-Line Brown",
    descricao:
      "Poedeira comercial de ovos marrons para sistemas alternativos, livres ou caipiras. Metas baseadas no guia Hy-Line Brown em português, publicado em maio de 2026.",
    densidadeMaximaAvesM2: 9,
    imagemGalinhaUrl: "/linhagens/hy-line-brown-galinha.png",
    imagemOvoUrl: "/linhagens/hy-line-brown-ovos.png",
    metas: metasHyLineBrown,
    cartilhas: [
      {
        titulo:
          "Guia de desempenho Hy-Line Brown — Sistemas alternativos",
        fonte: "Hy-Line International",
        sistema: "SISTEMAS_ALTERNATIVOS",
        edicao: "Maio de 2026",
        url:
          "https://www.hyline.com/filesimages/Hy-Line-Products/Hy-Line-Product-PDFs/Brown/Brown%20Alt/BRN%20ALT%20STD%20POR.pdf",
      },
      {
        titulo:
          "Manual de Boas Práticas na Produção de Galinhas Poedeiras",
        fonte: "Embrapa",
        sistema: "GERAL",
        edicao: null,
        url:
          "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1127416/1/Cartilha.pdf",
      },
    ],
  },
  {
    nome: "Embrapa 051",
    descricao:
      "Poedeira colonial brasileira de ovos castanhos, rústica e indicada para sistemas semiconfinados, caipiras ou free-range. As metas semanais são provenientes dos Quadros 9 e 10 da publicação Produção de ovos em sistemas de base ecológica, da Embrapa.",
    densidadeMaximaAvesM2: 7,
    imagemGalinhaUrl: "/linhagens/embrapa-051-galinha.png",
    imagemOvoUrl: "/linhagens/embrapa-051-ovos.png",
    metas: metasEmbrapa051,
    cartilhas: [
      {
        titulo:
          "Poedeira Embrapa 051 — Guia de manejo das poedeiras coloniais de ovos castanhos",
        fonte: "Embrapa Suínos e Aves",
        sistema: "GERAL",
        edicao: "2017",
        url:
          "https://www.embrapa.br/documents/1355242/0/Manual%20Poedeira%20051%20Embrapa.pdf",
      },
      {
        titulo:
          "Produção de ovos em sistemas de base ecológica",
        fonte: "Embrapa Suínos e Aves",
        sistema: "FREE_RANGE",
        edicao: "1ª edição, 2017",
        url:
          "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1081503/1/final8573.pdf",
      },
    ],
  },
  {
    nome: "Lohmann Brown-Classic",
    descricao:
      "Poedeira comercial de ovos marrons para sistemas alternativos. O guia oficial informa 321 ovos por ave alojada às 72 semanas e 412 às 90 semanas.",
    densidadeMaximaAvesM2: 8,
    imagemGalinhaUrl:
      "/linhagens/lohmann-brown-classic-galinha.png",
    imagemOvoUrl:
      "/linhagens/lohmann-brown-classic-ovos.png",
    metas: metasLohmannBrownClassic,
    cartilhas: [
      {
        titulo:
          "Lohmann Brown-Classic — Dados de performance em sistemas alternativos",
        fonte: "Lohmann Breeders",
        sistema: "SISTEMAS_ALTERNATIVOS",
        edicao: "06.21 V01-21",
        url:
          "https://lohmann-breeders.com/files/downloads/MG/e-Guides/Alternative/Portogues/LB_eMG_Alternativ_PT_PerfData-LB-Classic_p2_1.pdf",
      },
      {
        titulo: "Manual de manejo — Sistemas alternativos",
        fonte: "Lohmann Breeders",
        sistema: "SISTEMAS_ALTERNATIVOS",
        edicao: "06.21 V02-24",
        url:
          "https://lohmann-breeders.com/files/downloads/MG/Alternative%20breeds/LB_eMG_Alternative%20Haltung_Printversion_PT_06.21_V02-24_high.pdf",
      },
    ],
  },
];

async function cadastrarLinhagem(
  linhagemSeed: LinhagemSeed,
  tipoOvoMarromId: number
) {
  const linhagem = await prisma.linhagem.upsert({
    where: {
      lin_nome: linhagemSeed.nome,
    },
    update: {
      lin_descricao: linhagemSeed.descricao,
      lin_densidade_maxima_aves_m2:linhagemSeed.densidadeMaximaAvesM2,
      lin_imagem_galinha_url: linhagemSeed.imagemGalinhaUrl,
      lin_imagem_ovo_url: linhagemSeed.imagemOvoUrl,
      tov_id: tipoOvoMarromId,
      updated_at: new Date(),
    },
    create: {
      lin_nome: linhagemSeed.nome,
      lin_descricao: linhagemSeed.descricao,
      lin_densidade_maxima_aves_m2: linhagemSeed.densidadeMaximaAvesM2,
      lin_imagem_galinha_url: linhagemSeed.imagemGalinhaUrl,
      lin_imagem_ovo_url: linhagemSeed.imagemOvoUrl,
      tov_id: tipoOvoMarromId,
    },
    select: {
      lin_id: true,
    },
  });

  for (const metaLinhagem of linhagemSeed.metas) {
    await prisma.meta_linhagem_semanal.upsert({
      where: {
        lin_id_mls_semana: {
          lin_id: linhagem.lin_id,
          mls_semana: metaLinhagem.semana,
        },
      },
      update: {
        mls_peso_meta_gramas:
          metaLinhagem.pesoMetaGramas,
        mls_consumo_meta_gramas:
          metaLinhagem.consumoMetaGramas,
        mls_produtividade_meta_percentual:
          metaLinhagem.produtividadeMetaPercentual,
      },
      create: {
        lin_id: linhagem.lin_id,
        mls_semana: metaLinhagem.semana,
        mls_peso_meta_gramas:
          metaLinhagem.pesoMetaGramas,
        mls_consumo_meta_gramas:
          metaLinhagem.consumoMetaGramas,
        mls_produtividade_meta_percentual:
          metaLinhagem.produtividadeMetaPercentual,
      },
    });
  }

  for (const cartilha of linhagemSeed.cartilhas) {
    await prisma.cartilha_linhagem.upsert({
      where: {
        lin_id_ctl_url: {
          lin_id: linhagem.lin_id,
          ctl_url: cartilha.url,
        },
      },
      update: {
        ctl_titulo: cartilha.titulo,
        ctl_fonte: cartilha.fonte,
        ctl_sistema: cartilha.sistema,
        ctl_edicao: cartilha.edicao,
        updated_at: new Date(),
      },
      create: {
        lin_id: linhagem.lin_id,
        ctl_titulo: cartilha.titulo,
        ctl_fonte: cartilha.fonte,
        ctl_sistema: cartilha.sistema,
        ctl_edicao: cartilha.edicao,
        ctl_url: cartilha.url,
      },
    });
  }

  const quantidadeMetas =
    await prisma.meta_linhagem_semanal.count({
      where: {
        lin_id: linhagem.lin_id,
        mls_semana: {
          in: linhagemSeed.metas.map(
            (metaLinhagem) => metaLinhagem.semana
          ),
        },
      },
    });

  if (quantidadeMetas !== linhagemSeed.metas.length) {
    throw new Error(
      `O cadastro das metas da linhagem ${linhagemSeed.nome} ficou incompleto.`
    );
  }

  const quantidadeCartilhas =
    await prisma.cartilha_linhagem.count({
      where: {
        lin_id: linhagem.lin_id,
        ctl_url: {
          in: linhagemSeed.cartilhas.map(
            (cartilha) => cartilha.url
          ),
        },
      },
    });

  if (quantidadeCartilhas !== linhagemSeed.cartilhas.length) {
    throw new Error(
      `O cadastro das cartilhas da linhagem ${linhagemSeed.nome} ficou incompleto.`
    );
  }

  return {
    nome: linhagemSeed.nome,
    quantidadeMetas,
    quantidadeCartilhas,
  };
}

const categoriasInsumo = [
  { cti_descricao: "Ração", cti_tipo: "RACAO" as const },
  { cti_descricao: "Medicamento", cti_tipo: "MEDICAMENTO" as const },
  { cti_descricao: "Vacina", cti_tipo: "VACINA" as const },
  { cti_descricao: "Embalagem", cti_tipo: "EMBALAGEM" as const },
  { cti_descricao: "Outros", cti_tipo: "OUTROS" as const },
];

async function executarSeed() {
  for (const categoriaInsumo of categoriasInsumo) {
    await prisma.categoria_insumo.upsert({
      where: {
        cti_descricao: categoriaInsumo.cti_descricao,
      },
      update: {
        cti_tipo: categoriaInsumo.cti_tipo,
      },
      create: categoriaInsumo,
    });
  }

  console.log("Categorias de insumo cadastradas com sucesso.");
  for (const categoria of categoriasFornecedor) {
    await prisma.categoria_fornecedor.upsert({
      where: {
        ctf_descricao: categoria,
      },
      update: {},
      create: {
        ctf_descricao: categoria,
      },
    });
  }
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

  const resultados = [];

  for (const linhagemSeed of linhagensOficiais) {
    const resultado = await cadastrarLinhagem(
      linhagemSeed,
      tipoOvoMarrom.tov_id
    );

    resultados.push(resultado);
  }

  console.log(
    `${categoriasFornecedor.length} categorias de fornecedor cadastradas com sucesso.`
  );

  console.log(
    "Tipos de ovo Branco e Marrom cadastrados com sucesso."
  );

  for (const resultado of resultados) {
    console.log(
      `${resultado.nome}: ${resultado.quantidadeMetas} metas e ${resultado.quantidadeCartilhas} cartilha(s) oficial(is) cadastradas com sucesso.`
    );
  }

  const totalMetas = resultados.reduce(
    (total, resultado) => total + resultado.quantidadeMetas,
    0
  );

  console.log(
    `${totalMetas} metas oficiais cadastradas nas três linhagens.`
  );
}

executarSeed()
  .catch((erro) => {
    console.error("Não foi possível executar a seed:", erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });