"use client";

import {
  BookOpen,
  Check,
  Circle,
  Egg,
  ImageIcon,
  TableProperties,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";

import {
  atualizarLinhagemAction,
  AtualizarLinhagemActionState,
  criarLinhagemAction,
  CriarLinhagemActionState,
} from "@/app/admin/linhagens/actions";
import {
  sistemaCartilhaLabel,
  sistemasCartilhaValores,
  type SistemaCartilha,
} from "@/application/linhagens/cartilha-linhagem-schema";

type MetaLinha = {
  semana: string;
  pesoMetaGramas: string;
  consumoMetaGramas: string;
  produtividadeMetaPercentual: string;
};

type CartilhaLinha = {
  titulo: string;
  fonte: string;
  sistema: SistemaCartilha | "";
  edicao: string;
  url: string;
};

type LinhagemFormProps = {
  tiposOvo: {
    tov_id: number;
    tov_nome: string;
  }[];
} & (
  | {
      modo: "criar";
    }
  | {
      modo: "editar";
      linhagem: {
        id: number;
        nome: string;
        descricao: string | null;
        imagemGalinhaUrl: string | null;
        imagemOvoUrl: string | null;
        tipoOvoId: number;
        metas: {
          semana: number;
          pesoMetaGramas: number | null;
          consumoMetaGramas: number | null;
          produtividadeMetaPercentual: number | null;
        }[];
        cartilhas: {
          ctl_id: number;
          ctl_titulo: string;
          ctl_fonte: string;
          ctl_sistema: SistemaCartilha;
          ctl_edicao: string | null;
          ctl_url: string;
        }[];
      };
    }
);

const estadoInicialCriar: CriarLinhagemActionState = {};
const estadoInicialAtualizar: AtualizarLinhagemActionState = {};

const caminhoImagemRegex =
  /^\/linhagens\/[a-z0-9][a-z0-9/_-]*\.(?:avif|jpe?g|png|webp)$/i;

function metaParaLinha(meta: {
  semana: number;
  pesoMetaGramas: number | null;
  consumoMetaGramas: number | null;
  produtividadeMetaPercentual: number | null;
}): MetaLinha {
  return {
    semana: String(meta.semana),
    pesoMetaGramas:
      meta.pesoMetaGramas === null ? "" : String(meta.pesoMetaGramas),
    consumoMetaGramas:
      meta.consumoMetaGramas === null
        ? ""
        : String(meta.consumoMetaGramas),
    produtividadeMetaPercentual:
      meta.produtividadeMetaPercentual === null
        ? ""
        : String(meta.produtividadeMetaPercentual),
  };
}

function cartilhaParaLinha(cartilha: {
  ctl_titulo: string;
  ctl_fonte: string;
  ctl_sistema: SistemaCartilha;
  ctl_edicao: string | null;
  ctl_url: string;
}): CartilhaLinha {
  return {
    titulo: cartilha.ctl_titulo,
    fonte: cartilha.ctl_fonte,
    sistema: cartilha.ctl_sistema,
    edicao: cartilha.ctl_edicao ?? "",
    url: cartilha.ctl_url,
  };
}

function proximaSemana(metas: MetaLinha[]) {
  const semanas = metas
    .map((meta) => Number(meta.semana))
    .filter((semana) => Number.isInteger(semana) && semana > 0);

  if (semanas.length === 0) {
    return 1;
  }

  return Math.max(...semanas) + 1;
}

export default function LinhagemForm(props: LinhagemFormProps) {
  const { tiposOvo, modo } = props;
  const semTiposOvo = tiposOvo.length === 0;

  const [estadoCriar, acaoCriar, pendenteCriar] = useActionState(
    criarLinhagemAction,
    estadoInicialCriar
  );

  const [estadoAtualizar, acaoAtualizar, pendenteAtualizar] =
    useActionState(atualizarLinhagemAction, estadoInicialAtualizar);

  const state = modo === "criar" ? estadoCriar : estadoAtualizar;
  const formAction = modo === "criar" ? acaoCriar : acaoAtualizar;
  const pendente = modo === "criar" ? pendenteCriar : pendenteAtualizar;

  const [nome, setNome] = useState(
    modo === "editar" ? props.linhagem.nome : ""
  );
  const [descricao, setDescricao] = useState(
    modo === "editar" ? (props.linhagem.descricao ?? "") : ""
  );
  const [imagemGalinhaUrl, setImagemGalinhaUrl] = useState(
    modo === "editar" ? (props.linhagem.imagemGalinhaUrl ?? "") : ""
  );
  const [imagemOvoUrl, setImagemOvoUrl] = useState(
    modo === "editar" ? (props.linhagem.imagemOvoUrl ?? "") : ""
  );
  const [tipoOvoId, setTipoOvoId] = useState(
    modo === "editar" ? String(props.linhagem.tipoOvoId) : ""
  );
  const [metas, setMetas] = useState<MetaLinha[]>(
    modo === "editar" ? props.linhagem.metas.map(metaParaLinha) : []
  );
  const [cartilhas, setCartilhas] = useState<CartilhaLinha[]>(
    modo === "editar"
      ? props.linhagem.cartilhas.map(cartilhaParaLinha)
      : []
  );

  const tiposOvoOrdenados = [...tiposOvo].sort((a, b) =>
    a.tov_nome.localeCompare(b.tov_nome, "pt-BR")
  );
  const sistemasCartilhaOrdenados = [...sistemasCartilhaValores].sort(
    (a, b) =>
      sistemaCartilhaLabel[a].localeCompare(
        sistemaCartilhaLabel[b],
        "pt-BR"
      )
  );

  const imagemGalinhaValida = caminhoImagemRegex.test(
    imagemGalinhaUrl.trim()
  );
  const imagemOvoValida = caminhoImagemRegex.test(imagemOvoUrl.trim());
  const tipoOvoSelecionado = tiposOvo.find(
    (tipoOvo) => String(tipoOvo.tov_id) === tipoOvoId
  );
  const identificacaoConcluida =
    nome.trim().length > 0 && tipoOvoId.length > 0;
  const imagensConcluidas = imagemGalinhaValida && imagemOvoValida;
  const cartilhasConcluidas =
    cartilhas.length > 0 &&
    cartilhas.every(
      (cartilha) =>
        cartilha.titulo.trim().length > 0 &&
        cartilha.fonte.trim().length > 0 &&
        cartilha.sistema !== "" &&
        cartilha.url.trim().startsWith("https://")
    );
  const metasConcluidas =
    metas.length > 0 &&
    metas.every(
      (meta) =>
        Number.isInteger(Number(meta.semana)) &&
        Number(meta.semana) > 0 &&
        (meta.pesoMetaGramas !== "" ||
          meta.consumoMetaGramas !== "" ||
          meta.produtividadeMetaPercentual !== "")
    );

  function adicionarMeta() {
    setMetas((atual) => [
      ...atual,
      {
        semana: String(proximaSemana(atual)),
        pesoMetaGramas: "",
        consumoMetaGramas: "",
        produtividadeMetaPercentual: "",
      },
    ]);
  }

  function removerMeta(indice: number) {
    setMetas((atual) => atual.filter((_, i) => i !== indice));
  }

  function atualizarMeta(
    indice: number,
    campo: keyof MetaLinha,
    valor: string
  ) {
    setMetas((atual) =>
      atual.map((meta, i) =>
        i === indice ? { ...meta, [campo]: valor } : meta
      )
    );
  }

  function adicionarCartilha() {
    setCartilhas((atual) => [
      ...atual,
      {
        titulo: "",
        fonte: "",
        sistema: "",
        edicao: "",
        url: "",
      },
    ]);
  }

  function removerCartilha(indice: number) {
    setCartilhas((atual) => atual.filter((_, i) => i !== indice));
  }

  function atualizarCartilha(
    indice: number,
    campo: keyof CartilhaLinha,
    valor: string
  ) {
    setCartilhas((atual) =>
      atual.map((cartilha, i) =>
        i === indice ? { ...cartilha, [campo]: valor } : cartilha
      )
    );
  }

  const metasParaEnvio = metas.map((meta) => ({
    semana: Number(meta.semana),
    pesoMetaGramas:
      meta.pesoMetaGramas === "" ? null : Number(meta.pesoMetaGramas),
    consumoMetaGramas:
      meta.consumoMetaGramas === ""
        ? null
        : Number(meta.consumoMetaGramas),
    produtividadeMetaPercentual:
      meta.produtividadeMetaPercentual === ""
        ? null
        : Number(meta.produtividadeMetaPercentual),
  }));

  return (
    <form
      action={formAction}
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(19rem,0.85fr)]"
    >
      {modo === "editar" && (
        <input type="hidden" name="id" value={props.linhagem.id} />
      )}

      <input
        type="hidden"
        name="metas"
        value={JSON.stringify(metasParaEnvio)}
      />
      <input
        type="hidden"
        name="cartilhas"
        value={JSON.stringify(cartilhas)}
      />

      {state.erro && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 xl:col-span-2"
        >
          {state.erro}
        </p>
      )}

      <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <section className="border-b border-gray-200 p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
              1
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Identificação
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Informações principais exibidas no catálogo de linhagens.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="nome"
                className="text-sm font-semibold text-gray-700"
              >
                Nome
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                maxLength={100}
                placeholder="Digite o nome da linhagem"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
              />
            </div>

            <div>
              <label
                htmlFor="tipoOvoId"
                className="text-sm font-semibold text-gray-700"
              >
                Tipo de ovo
              </label>
              <select
                id="tipoOvoId"
                name="tipoOvoId"
                required
                disabled={semTiposOvo}
                aria-describedby={
                  semTiposOvo ? "aviso-sem-tipos-ovo" : undefined
                }
                value={tipoOvoId}
                onChange={(event) => setTipoOvoId(event.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
              >
                <option value="" disabled>
                  {semTiposOvo
                    ? "Nenhum tipo de ovo disponível"
                    : "Selecione um tipo de ovo"}
                </option>
                {tiposOvoOrdenados.map((tipoOvo) => (
                  <option key={tipoOvo.tov_id} value={tipoOvo.tov_id}>
                    {tipoOvo.tov_nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="descricao"
                className="text-sm font-semibold text-gray-700"
              >
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                rows={3}
                maxLength={255}
                placeholder="Descreva aptidão, sistema de criação e características relevantes"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                className="mt-2 w-full resize-none rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
              />
              <p className="mt-1 text-right text-xs text-gray-400">
                {descricao.length}/255
              </p>
            </div>
          </div>

          {semTiposOvo && (
            <p
              id="aviso-sem-tipos-ovo"
              role="alert"
              className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
            >
              Nenhum tipo de ovo está cadastrado. Cadastre os tipos de ovo
              antes de criar uma linhagem.
            </p>
          )}
        </section>

        <section className="border-b border-gray-200 p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
              2
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Imagens representativas
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Informe os caminhos dos arquivos disponíveis na pasta pública.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="imagemGalinhaUrl"
                className="text-sm font-semibold text-gray-700"
              >
                Imagem da galinha
              </label>
              <input
                id="imagemGalinhaUrl"
                name="imagemGalinhaUrl"
                type="text"
                maxLength={500}
                placeholder="/linhagens/nome-galinha.webp"
                value={imagemGalinhaUrl}
                onChange={(event) =>
                  setImagemGalinhaUrl(event.target.value)
                }
                aria-invalid={
                  imagemGalinhaUrl.length > 0 && !imagemGalinhaValida
                }
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-200"
              />
            </div>

            <div>
              <label
                htmlFor="imagemOvoUrl"
                className="text-sm font-semibold text-gray-700"
              >
                Imagem dos ovos
              </label>
              <input
                id="imagemOvoUrl"
                name="imagemOvoUrl"
                type="text"
                maxLength={500}
                placeholder="/linhagens/nome-ovos.webp"
                value={imagemOvoUrl}
                onChange={(event) => setImagemOvoUrl(event.target.value)}
                aria-invalid={imagemOvoUrl.length > 0 && !imagemOvoValida}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-200"
              />
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-gray-500">
            Use caminhos iniciados por
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5">
              /linhagens/
            </code>
            e arquivos PNG, JPG, JPEG, WEBP ou AVIF. A prévia aparece no
            painel ao lado.
          </p>
        </section>

        <section className="border-b border-gray-200 p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
                3
              </span>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Cartilhas técnicas
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Referências oficiais para consulta dentro do sistema.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={adicionarCartilha}
              className="shrink-0 text-sm font-semibold text-[#1B3B32] transition hover:underline"
            >
              + Adicionar
            </button>
          </div>

          {cartilhas.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
              <BookOpen aria-hidden="true" className="h-5 w-5" />
              Nenhuma cartilha adicionada.
            </div>
          ) : (
            <div className="max-h-[34rem] space-y-4 overflow-y-auto pr-2">
              {cartilhas.map((cartilha, indice) => (
                <div
                  key={indice}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <p className="text-sm font-bold text-gray-800">
                      Cartilha {indice + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removerCartilha(indice)}
                      className="text-sm font-medium text-red-600 transition hover:underline"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`cartilha-titulo-${indice}`}
                        className="text-xs font-medium text-gray-500"
                      >
                        Título
                      </label>
                      <input
                        id={`cartilha-titulo-${indice}`}
                        type="text"
                        required
                        maxLength={150}
                        value={cartilha.titulo}
                        onChange={(event) =>
                          atualizarCartilha(
                            indice,
                            "titulo",
                            event.target.value
                          )
                        }
                        placeholder="Ex.: Guia de manejo"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`cartilha-fonte-${indice}`}
                        className="text-xs font-medium text-gray-500"
                      >
                        Fonte ou fabricante
                      </label>
                      <input
                        id={`cartilha-fonte-${indice}`}
                        type="text"
                        required
                        maxLength={150}
                        value={cartilha.fonte}
                        onChange={(event) =>
                          atualizarCartilha(
                            indice,
                            "fonte",
                            event.target.value
                          )
                        }
                        placeholder="Ex.: Hy-Line"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`cartilha-sistema-${indice}`}
                        className="text-xs font-medium text-gray-500"
                      >
                        Sistema de criação
                      </label>
                      <select
                        id={`cartilha-sistema-${indice}`}
                        required
                        value={cartilha.sistema}
                        onChange={(event) =>
                          atualizarCartilha(
                            indice,
                            "sistema",
                            event.target.value
                          )
                        }
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                      >
                        <option value="" disabled>
                          Selecione um sistema
                        </option>
                        {sistemasCartilhaOrdenados.map((sistema) => (
                          <option key={sistema} value={sistema}>
                            {sistemaCartilhaLabel[sistema]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={`cartilha-edicao-${indice}`}
                        className="text-xs font-medium text-gray-500"
                      >
                        Edição ou versão (opcional)
                      </label>
                      <input
                        id={`cartilha-edicao-${indice}`}
                        type="text"
                        maxLength={100}
                        value={cartilha.edicao}
                        onChange={(event) =>
                          atualizarCartilha(
                            indice,
                            "edicao",
                            event.target.value
                          )
                        }
                        placeholder="Ex.: 2024"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`cartilha-url-${indice}`}
                        className="text-xs font-medium text-gray-500"
                      >
                        URL oficial HTTPS
                      </label>
                      <input
                        id={`cartilha-url-${indice}`}
                        type="url"
                        required
                        maxLength={2048}
                        value={cartilha.url}
                        onChange={(event) =>
                          atualizarCartilha(
                            indice,
                            "url",
                            event.target.value
                          )
                        }
                        placeholder="https://..."
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
                4
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">
                    Metas semanais
                  </h2>
                  {metas.length > 0 && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                      {metas.length}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Peso, consumo e produtividade esperados por semana.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={adicionarMeta}
              className="shrink-0 text-sm font-semibold text-[#1B3B32] transition hover:underline"
            >
              + Adicionar
            </button>
          </div>

          {metas.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
              <TableProperties aria-hidden="true" className="h-5 w-5" />
              Nenhuma meta semanal adicionada.
            </div>
          ) : (
            <div className="max-h-[38rem] space-y-3 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 pr-2">
              {metas.map((meta, indice) => (
                <div
                  key={indice}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:grid-cols-2 2xl:grid-cols-4 2xl:items-end"
                >
                  <div>
                    <label
                      htmlFor={`meta-semana-${indice}`}
                      className="text-xs font-medium text-gray-500"
                    >
                      Semana
                    </label>
                    <input
                      id={`meta-semana-${indice}`}
                      type="number"
                      min={1}
                      required
                      value={meta.semana}
                      onChange={(event) =>
                        atualizarMeta(
                          indice,
                          "semana",
                          event.target.value
                        )
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`meta-peso-${indice}`}
                      className="text-xs font-medium text-gray-500"
                    >
                      Peso meta (g)
                    </label>
                    <input
                      id={`meta-peso-${indice}`}
                      type="number"
                      min={0.01}
                      step="0.01"
                      placeholder="—"
                      value={meta.pesoMetaGramas}
                      onChange={(event) =>
                        atualizarMeta(
                          indice,
                          "pesoMetaGramas",
                          event.target.value
                        )
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`meta-consumo-${indice}`}
                      className="text-xs font-medium text-gray-500"
                    >
                      Consumo (g/ave/dia)
                    </label>
                    <input
                      id={`meta-consumo-${indice}`}
                      type="number"
                      min={0.01}
                      step="0.01"
                      placeholder="—"
                      value={meta.consumoMetaGramas}
                      onChange={(event) =>
                        atualizarMeta(
                          indice,
                          "consumoMetaGramas",
                          event.target.value
                        )
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`meta-produtividade-${indice}`}
                      className="text-xs font-medium text-gray-500"
                    >
                      Produtividade (%)
                    </label>
                    <input
                      id={`meta-produtividade-${indice}`}
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      placeholder="—"
                      value={meta.produtividadeMetaPercentual}
                      onChange={(event) =>
                        atualizarMeta(
                          indice,
                          "produtividadeMetaPercentual",
                          event.target.value
                        )
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20"
                    />
                  </div>

                  <div className="sm:col-span-2 2xl:col-span-4">
                    <button
                      type="button"
                      onClick={() => removerMeta(indice)}
                      className="text-sm font-medium text-red-600 transition hover:underline"
                    >
                      Remover semana
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-white p-5 sm:flex-row sm:justify-end xl:hidden">
          <Link
            href="/admin/linhagens"
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pendente || semTiposOvo}
            className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pendente
              ? "Salvando..."
              : modo === "criar"
                ? "Cadastrar linhagem"
                : "Salvar alterações"}
          </button>
        </div>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Resumo da linhagem
              </p>
              <h2 className="mt-2 break-words text-lg font-bold text-gray-900">
                {nome.trim() || "Nova linhagem"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {tipoOvoSelecionado?.tov_nome ??
                  "Tipo de ovo não selecionado"}
              </p>
            </div>
            <Egg aria-hidden="true" className="h-6 w-6 text-[#1B3B32]" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="relative h-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {imagemGalinhaValida ? (
                <Image
                  src={imagemGalinhaUrl.trim()}
                  alt={`Galinha representante da linhagem ${nome.trim() || "cadastrada"}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-2 text-center text-xs text-gray-400">
                  <ImageIcon aria-hidden="true" className="h-6 w-6" />
                  Galinha
                </div>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1.5 text-center text-xs font-medium text-white">
                Galinha
              </span>
            </div>

            <div className="relative h-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {imagemOvoValida ? (
                <Image
                  src={imagemOvoUrl.trim()}
                  alt={`Ovos produzidos pela linhagem ${nome.trim() || "cadastrada"}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-2 text-center text-xs text-gray-400">
                  <Egg aria-hidden="true" className="h-6 w-6" />
                  Ovos
                </div>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1.5 text-center text-xs font-medium text-white">
                Ovos
              </span>
            </div>
          </div>

          <ul className="mt-5 divide-y divide-gray-100" aria-live="polite">
            <li className="flex items-start gap-3 py-3">
              {identificacaoConcluida ? (
                <Check
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                />
              ) : (
                <Circle
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-gray-300"
                />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Identificação
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Nome e tipo de ovo
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 py-3">
              {imagensConcluidas ? (
                <Check
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                />
              ) : (
                <Circle
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-gray-300"
                />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Imagens
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {[imagemGalinhaValida, imagemOvoValida].filter(Boolean)
                    .length}{" "}
                  de 2 caminhos válidos
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 py-3">
              {cartilhasConcluidas ? (
                <Check
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                />
              ) : (
                <Circle
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-gray-300"
                />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Cartilhas técnicas
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {cartilhas.length === 1
                    ? "1 cartilha adicionada"
                    : `${cartilhas.length} cartilhas adicionadas`}
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 py-3">
              {metasConcluidas ? (
                <Check
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                />
              ) : (
                <Circle
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-gray-300"
                />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Metas semanais
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {metas.length === 1
                    ? "1 semana adicionada"
                    : `${metas.length} semanas adicionadas`}
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm xl:block">
          <button
            type="submit"
            disabled={pendente || semTiposOvo}
            className="w-full rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pendente
              ? "Salvando..."
              : modo === "criar"
                ? "Cadastrar linhagem"
                : "Salvar alterações"}
          </button>
          <Link
            href="/admin/linhagens"
            className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </section>
      </aside>
    </form>
  );
}
