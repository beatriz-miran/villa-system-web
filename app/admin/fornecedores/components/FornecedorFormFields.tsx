"use client";

import {
  Building2,
  Check,
  Circle,
  Mail,
  MapPin,
  Phone,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";

import {
  buscarDadosCnpjAction,
  buscarEnderecoPorCepAction,
} from "@/app/admin/fornecedores/actions";
import {
  cepValido,
  formatarCepParcial,
  somenteDigitosCep,
} from "@/application/enderecos/cep";
import { ufsBrasil } from "@/application/enderecos/ufs";
import {
  cnpjValido,
  formatarCnpjParcial,
  somenteDigitos,
} from "@/application/fornecedores/cnpj";
import { formatarTelefoneParcial } from "@/application/fornecedores/telefone";

type Categoria = {
  ctf_id: number;
  ctf_descricao: string;
};

type AvisoConsulta = {
  tipo: "sucesso" | "erro";
  mensagem: string;
};

type FornecedorFormFieldsProps = {
  formAction: (formData: FormData) => void;
  pendente: boolean;
  erro?: string;
  categorias: Categoria[];
  submitLabel: string;
  fornecedorId?: number;
  valoresIniciais?: {
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
    categoriaIds: number[];
  };
};

const inputClassName =
  "mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#1B3B32] focus:ring-2 focus:ring-[#1B3B32]/20";

const labelClassName = "text-sm font-semibold text-gray-700";

export default function FornecedorFormFields({
  formAction,
  pendente,
  erro,
  categorias,
  submitLabel,
  fornecedorId,
  valoresIniciais,
}: FornecedorFormFieldsProps) {
  const [cnpj, setCnpj] = useState(
    formatarCnpjParcial(valoresIniciais?.cnpj ?? ""),
  );
  const [categoriaIds, setCategoriaIds] = useState<string[]>(
    valoresIniciais?.categoriaIds?.map(String) ?? [],
  );
  const [razaoSocial, setRazaoSocial] = useState(
    valoresIniciais?.razaoSocial ?? "",
  );
  const [nomeFantasia, setNomeFantasia] = useState(
    valoresIniciais?.nomeFantasia ?? "",
  );
  const [email, setEmail] = useState(valoresIniciais?.email ?? "");
  const [telefonePrincipal, setTelefonePrincipal] = useState(
    formatarTelefoneParcial(valoresIniciais?.telefonePrincipal ?? ""),
  );
  const [telefoneSecundario, setTelefoneSecundario] = useState(
    formatarTelefoneParcial(valoresIniciais?.telefoneSecundario ?? ""),
  );
  const [cep, setCep] = useState(
    formatarCepParcial(valoresIniciais?.cep ?? ""),
  );
  const [logradouro, setLogradouro] = useState(
    valoresIniciais?.logradouro ?? "",
  );
  const [numero, setNumero] = useState(valoresIniciais?.numero ?? "");
  const [bairro, setBairro] = useState(valoresIniciais?.bairro ?? "");
  const [cidade, setCidade] = useState(valoresIniciais?.cidade ?? "");
  const [estado, setEstado] = useState(valoresIniciais?.estado ?? "");

  const [consultandoCnpj, setConsultandoCnpj] = useState(false);
  const [consultandoCep, setConsultandoCep] = useState(false);
  const [avisoCnpj, setAvisoCnpj] = useState<AvisoConsulta | null>(null);
  const [avisoCep, setAvisoCep] = useState<AvisoConsulta | null>(null);

  const ultimoCnpjConsultadoRef = useRef<string | null>(null);
  const ultimoCepConsultadoRef = useRef<string | null>(null);
  const consultaCnpjIdRef = useRef(0);
  const consultaCepIdRef = useRef(0);

  const categoriasOrdenadas = [...categorias].sort((a, b) =>
    a.ctf_descricao.localeCompare(b.ctf_descricao, "pt-BR"),
  );

  const ufsOrdenadas = [...ufsBrasil].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );

  const categoriasSelecionadas = categoriasOrdenadas.filter((categoria) =>
    categoriaIds.includes(String(categoria.ctf_id)),
  );

  const cnpjEstaValido = cnpjValido(somenteDigitos(cnpj));

  const identificacaoCompleta =
    cnpjEstaValido &&
    razaoSocial.trim().length > 0 &&
    categoriaIds.length > 0;

  const telefonePrincipalValido =
    telefonePrincipal.replace(/\D/g, "").length >= 10;

  const contatoCompleto =
    email.trim().length > 0 && telefonePrincipalValido;

  const localizacaoCompleta =
    logradouro.trim().length > 0 &&
    bairro.trim().length > 0 &&
    cidade.trim().length > 0 &&
    estado.trim().length === 2;

  const nomeExibido =
    nomeFantasia.trim() ||
    razaoSocial.trim() ||
    "Novo fornecedor";

  function alternarCategoria(categoriaId: string) {
    setCategoriaIds((categoriasAtuais) =>
      categoriasAtuais.includes(categoriaId)
        ? categoriasAtuais.filter((id) => id !== categoriaId)
        : [...categoriasAtuais, categoriaId],
    );
  }

  function preencherEnderecoDoCep(dados: {
    cep: string;
    logradouro: string | null;
    bairro: string | null;
    cidade: string;
    estado: string;
  }) {
    setCep(formatarCepParcial(dados.cep));
    setLogradouro(dados.logradouro ?? "");
    setBairro(dados.bairro ?? "");
    setCidade(dados.cidade);
    setEstado(dados.estado);
  }

  async function consultarEPreencherCep(cepInformado: string) {
    const digitos = somenteDigitosCep(cepInformado);

    if (
      !cepValido(digitos) ||
      digitos === ultimoCepConsultadoRef.current
    ) {
      return;
    }

    ultimoCepConsultadoRef.current = digitos;

    const idConsulta = ++consultaCepIdRef.current;

    setConsultandoCep(true);
    setAvisoCep(null);

    const resultado = await buscarEnderecoPorCepAction(digitos);

    if (idConsulta !== consultaCepIdRef.current) {
      return;
    }

    setConsultandoCep(false);

    if (!resultado.sucesso) {
      ultimoCepConsultadoRef.current = null;
      setAvisoCep({
        tipo: "erro",
        mensagem: resultado.mensagem,
      });
      return;
    }

    preencherEnderecoDoCep(resultado.dados);

    setAvisoCep({
      tipo: "sucesso",
      mensagem: "Endereço preenchido automaticamente a partir do CEP.",
    });
  }

  async function consultarEPreencherCnpj(cnpjInformado: string) {
    const digitos = somenteDigitos(cnpjInformado);

    if (
      !cnpjValido(digitos) ||
      digitos === ultimoCnpjConsultadoRef.current
    ) {
      return;
    }

    ultimoCnpjConsultadoRef.current = digitos;

    const idConsulta = ++consultaCnpjIdRef.current;

    setConsultandoCnpj(true);
    setAvisoCnpj(null);

    const resultado = await buscarDadosCnpjAction(digitos);

    if (idConsulta !== consultaCnpjIdRef.current) {
      return;
    }

    setConsultandoCnpj(false);

    if (!resultado.sucesso) {
      ultimoCnpjConsultadoRef.current = null;
      setAvisoCnpj({
        tipo: "erro",
        mensagem: resultado.mensagem,
      });
      return;
    }

    const { dados } = resultado;

    setRazaoSocial(dados.razaoSocial);
    setNomeFantasia(dados.nomeFantasia ?? "");

    if (dados.telefonePrincipal) {
      setTelefonePrincipal(
        formatarTelefoneParcial(dados.telefonePrincipal),
      );
    }

    if (dados.cep) {
      setCep(formatarCepParcial(dados.cep));
    }

    if (dados.logradouro) {
      setLogradouro(dados.logradouro);
    }

    if (dados.numero) {
      setNumero(dados.numero);
    }

    if (dados.bairro) {
      setBairro(dados.bairro);
    }

    if (dados.cidade) {
      setCidade(dados.cidade);
    }

    if (dados.estado) {
      setEstado(dados.estado);
    }

    setAvisoCnpj({
      tipo: "sucesso",
      mensagem: "Dados empresariais preenchidos a partir do CNPJ.",
    });

    if (dados.cep) {
      await consultarEPreencherCep(dados.cep);
    }
  }

  function handleCnpjChange(event: ChangeEvent<HTMLInputElement>) {
    const valorFormatado = formatarCnpjParcial(event.target.value);
    const digitos = somenteDigitos(valorFormatado);

    setCnpj(valorFormatado);
    setAvisoCnpj(null);
    setAvisoCep(null);

    consultaCnpjIdRef.current += 1;
    setConsultandoCnpj(false);

    consultaCepIdRef.current += 1;
    setConsultandoCep(false);

    if (digitos.length !== 14 || !cnpjValido(digitos)) {
      ultimoCnpjConsultadoRef.current = null;
      return;
    }

    void consultarEPreencherCnpj(digitos);
  }

  function handleCepChange(event: ChangeEvent<HTMLInputElement>) {
    const valorFormatado = formatarCepParcial(event.target.value);
    const digitos = somenteDigitosCep(valorFormatado);

    setCep(valorFormatado);
    setAvisoCep(null);

    consultaCepIdRef.current += 1;
    setConsultandoCep(false);

    if (digitos.length !== 8 || !cepValido(digitos)) {
      ultimoCepConsultadoRef.current = null;
      return;
    }

    void consultarEPreencherCep(digitos);
  }

  function tentarNovamenteCnpj() {
    ultimoCnpjConsultadoRef.current = null;
    void consultarEPreencherCnpj(cnpj);
  }

  function tentarNovamenteCep() {
    ultimoCepConsultadoRef.current = null;
    void consultarEPreencherCep(cep);
  }

  return (
    <form
      action={formAction}
      className="grid items-start gap-6 2xl:grid-cols-[minmax(0,2fr)_minmax(20rem,0.85fr)]"
    >
      {fornecedorId ? (
        <input type="hidden" name="id" value={fornecedorId} />
      ) : null}

      {erro ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 xl:col-span-2"
        >
          {erro}
        </p>
      ) : null}

      <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <section className="border-b border-gray-200 p-5 sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
              1
            </span>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Identificação empresarial
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Consulte o CNPJ e informe os dados principais do fornecedor.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="cnpj" className={labelClassName}>
                CNPJ
              </label>

              <input
                id="cnpj"
                name="cnpj"
                type="text"
                required
                inputMode="numeric"
                maxLength={18}
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={handleCnpjChange}
                className={inputClassName}
              />

              <div aria-live="polite">
                {consultandoCnpj ? (
                  <p className="mt-1.5 text-xs text-gray-500">
                    Consultando dados do CNPJ...
                  </p>
                ) : null}

                {!consultandoCnpj && avisoCnpj ? (
                  <div className="mt-1.5">
                    <p
                      className={`text-xs ${
                        avisoCnpj.tipo === "sucesso"
                          ? "text-green-700"
                          : "text-amber-600"
                      }`}
                    >
                      {avisoCnpj.mensagem}
                    </p>

                    {avisoCnpj.tipo === "erro" ? (
                      <button
                        type="button"
                        onClick={tentarNovamenteCnpj}
                        className="mt-1 text-xs font-medium text-[#1B3B32] underline"
                      >
                        Tentar novamente
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor="razaoSocial" className={labelClassName}>
                Razão social
              </label>

              <input
                id="razaoSocial"
                name="razaoSocial"
                type="text"
                required
                maxLength={200}
                placeholder="Digite a razão social"
                value={razaoSocial}
                onChange={(event) => setRazaoSocial(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="nomeFantasia" className={labelClassName}>
                Nome fantasia
              </label>

              <input
                id="nomeFantasia"
                name="nomeFantasia"
                type="text"
                maxLength={200}
                placeholder="Digite o nome fantasia"
                value={nomeFantasia}
                onChange={(event) => setNomeFantasia(event.target.value)}
                className={inputClassName}
              />
            </div>

                <fieldset className="sm:col-span-2">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <legend className={labelClassName}>
                        Categorias de fornecimento
                      </legend>

                      <span className="text-xs text-gray-500">
                        {categoriaIds.length === 0
                          ? "Nenhuma selecionada"
                          : `${categoriaIds.length} selecionada(s)`}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      Selecione todas as categorias que este fornecedor atende.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {categoriasOrdenadas.map((categoria) => {
                        const categoriaId = String(categoria.ctf_id);
                        const selecionada = categoriaIds.includes(categoriaId);

                        return (
                          <label
                            key={categoria.ctf_id}
                            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                              selecionada
                                ? "border-[#1B3B32] bg-[#EAF4EF] font-semibold text-[#1B3B32]"
                                : "border-gray-300 bg-white text-gray-700 hover:border-[#1B3B32]/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              name="categoriaIds"
                              value={categoria.ctf_id}
                              checked={selecionada}
                              onChange={() => alternarCategoria(categoriaId)}
                              className="h-4 w-4 accent-[#1B3B32]"
                            />

                            <span>{categoria.ctf_descricao}</span>
                          </label>
                        );
                      })}
                    </div>
                </fieldset>
          </div>
        </section>

        <section className="border-b border-gray-200 p-5 sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
              2
            </span>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Contato
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Informe os canais utilizados para comunicação com o fornecedor.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className={labelClassName}>
                E-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={150}
                placeholder="fornecedor@empresa.com.br"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="telefonePrincipal" className={labelClassName}>
                Telefone principal
              </label>

              <input
                id="telefonePrincipal"
                name="telefonePrincipal"
                type="text"
                required
                inputMode="tel"
                maxLength={15}
                placeholder="(00) 00000-0000"
                value={telefonePrincipal}
                onChange={(event) =>
                  setTelefonePrincipal(
                    formatarTelefoneParcial(event.target.value),
                  )
                }
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="telefoneSecundario" className={labelClassName}>
                Telefone secundário
              </label>

              <input
                id="telefoneSecundario"
                name="telefoneSecundario"
                type="text"
                inputMode="tel"
                maxLength={15}
                placeholder="(00) 00000-0000"
                value={telefoneSecundario}
                onChange={(event) =>
                  setTelefoneSecundario(
                    formatarTelefoneParcial(event.target.value),
                  )
                }
                className={inputClassName}
              />

              <p className="mt-2 text-xs text-gray-500">
                Campo opcional.
              </p>
            </div>
          </div>
        </section>

        <section className="p-5 sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF4EF] text-sm font-bold text-[#1B3B32]">
              3
            </span>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Localização
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Consulte o CEP ou preencha o endereço manualmente.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="cep" className={labelClassName}>
                CEP
              </label>

              <input
                id="cep"
                name="cep"
                type="text"
                inputMode="numeric"
                maxLength={9}
                autoComplete="postal-code"
                placeholder="00000-000"
                value={cep}
                onChange={handleCepChange}
                className={inputClassName}
              />

              <div aria-live="polite">
                {consultandoCep ? (
                  <p className="mt-1.5 text-xs text-gray-500">
                    Consultando endereço...
                  </p>
                ) : null}

                {!consultandoCep && avisoCep ? (
                  <div className="mt-1.5">
                    <p
                      className={`text-xs ${
                        avisoCep.tipo === "sucesso"
                          ? "text-green-700"
                          : "text-amber-600"
                      }`}
                    >
                      {avisoCep.mensagem}
                    </p>

                    {avisoCep.tipo === "erro" ? (
                      <button
                        type="button"
                        onClick={tentarNovamenteCep}
                        className="mt-1 text-xs font-medium text-[#1B3B32] underline"
                      >
                        Tentar novamente
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="hidden sm:block" />

            <div className="sm:col-span-2">
              <label htmlFor="logradouro" className={labelClassName}>
                Logradouro
              </label>

              <input
                id="logradouro"
                name="logradouro"
                type="text"
                maxLength={200}
                autoComplete="address-line1"
                placeholder="Rua, avenida, estrada..."
                value={logradouro}
                onChange={(event) => setLogradouro(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="numero" className={labelClassName}>
                Número
              </label>

              <input
                id="numero"
                name="numero"
                type="text"
                maxLength={20}
                autoComplete="address-line2"
                placeholder="Nº ou S/N"
                value={numero}
                onChange={(event) => setNumero(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="bairro" className={labelClassName}>
                Bairro
              </label>

              <input
                id="bairro"
                name="bairro"
                type="text"
                maxLength={100}
                placeholder="Digite o bairro"
                value={bairro}
                onChange={(event) => setBairro(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="cidade" className={labelClassName}>
                Cidade
              </label>

              <input
                id="cidade"
                name="cidade"
                type="text"
                maxLength={100}
                autoComplete="address-level2"
                placeholder="Digite a cidade"
                value={cidade}
                onChange={(event) => setCidade(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="estado" className={labelClassName}>
                UF
              </label>

              <select
                id="estado"
                name="estado"
                autoComplete="address-level1"
                value={estado}
                onChange={(event) => setEstado(event.target.value)}
                className={`${inputClassName} bg-white`}
              >
                <option value="">Selecione a UF</option>

                {ufsOrdenadas.map((uf) => (
                  <option key={uf.sigla} value={uf.sigla}>
                    {uf.nome} ({uf.sigla})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-white p-5 sm:flex-row sm:justify-end 2xl:hidden">
          <Link
            href="/admin/fornecedores"
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={pendente}
            className="rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pendente ? "Salvando..." : submitLabel}
          </button>
        </div>
      </div>

      <aside className="space-y-4 2xl:sticky 2xl:top-6">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Resumo do fornecedor
              </p>

              <h2 className="mt-2 break-words text-lg font-bold text-gray-900">
                {nomeExibido}
              </h2>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {categoriasSelecionadas.length > 0 ? (
                  categoriasSelecionadas.map((categoria) => (
                    <span
                      key={categoria.ctf_id}
                      className="rounded-full bg-[#EAF4EF] px-2.5 py-1 text-xs font-medium text-[#1B3B32]"
                    >
                      {categoria.ctf_descricao}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">
                    Nenhuma categoria selecionada
                  </span>
                )}
              </div>
            </div>

            <Building2
              aria-hidden="true"
              className="h-6 w-6 shrink-0 text-[#1B3B32]"
            />
          </div>

          <div className="mt-5 rounded-lg bg-[#F2F7F5] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              CNPJ
            </p>

            <p className="mt-2 break-words text-base font-bold text-[#1B3B32]">
              {cnpj || "Não informado"}
            </p>
          </div>

          <ul className="mt-5 divide-y divide-gray-100" aria-live="polite">
            <li className="flex items-start gap-3 py-3">
              {identificacaoCompleta ? (
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
                  Identificação empresarial
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  {identificacaoCompleta
                    ? "Dados principais preenchidos"
                    : "CNPJ, razão social e categorias"}
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 py-3">
              {contatoCompleto ? (
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
                  Contato principal
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  {contatoCompleto
                    ? "E-mail e telefone preenchidos"
                    : "Informe e-mail e telefone"}
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 py-3">
              {localizacaoCompleta ? (
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
                  Localização
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  {localizacaoCompleta
                    ? `${cidade} — ${estado}`
                    : "Endereço ainda não preenchido"}
                </p>
              </div>
            </li>
          </ul>

          {email.trim() || telefonePrincipal.trim() ? (
            <div className="mt-4 space-y-2 rounded-lg border border-gray-200 p-3">
              {email.trim() ? (
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <Mail
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#1B3B32]"
                  />

                  <span className="break-all">{email}</span>
                </div>
              ) : null}

              {telefonePrincipal.trim() ? (
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <Phone
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#1B3B32]"
                  />

                  <span>{telefonePrincipal}</span>
                </div>
              ) : null}

              {cidade.trim() || estado.trim() ? (
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <MapPin
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#1B3B32]"
                  />

                  <span>
                    {[cidade.trim(), estado.trim()]
                      .filter(Boolean)
                      .join(" — ")}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Search
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-blue-700"
            />

            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                Consultas automáticas
              </h3>

              <p className="mt-1 text-xs leading-5 text-blue-800">
                CNPJ e CEP preenchem os dados disponíveis automaticamente.
                Se algum serviço estiver indisponível, todos os campos
                continuam disponíveis para preenchimento manual.
              </p>
            </div>
          </div>
        </section>

        <section className="hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm 2xl:block">
          <button
            type="submit"
            disabled={pendente}
            className="w-full rounded-md bg-[#1B3B32] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#142d26] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pendente ? "Salvando..." : submitLabel}
          </button>

          <Link
            href="/admin/fornecedores"
            className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </section>
      </aside>
    </form>
  );
}