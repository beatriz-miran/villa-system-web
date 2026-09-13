"use client";

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
    categoriaId: number;
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
    formatarCnpjParcial(valoresIniciais?.cnpj ?? "")
  );
  const [cep, setCep] = useState(
    formatarCepParcial(valoresIniciais?.cep ?? "")
  );

  const [consultandoCnpj, setConsultandoCnpj] = useState(false);
  const [consultandoCep, setConsultandoCep] = useState(false);

  const [avisoCnpj, setAvisoCnpj] =
    useState<AvisoConsulta | null>(null);
  const [avisoCep, setAvisoCep] =
    useState<AvisoConsulta | null>(null);

  const ultimoCnpjConsultadoRef = useRef<string | null>(null);
  const ultimoCepConsultadoRef = useRef<string | null>(null);

  const consultaCnpjIdRef = useRef(0);
  const consultaCepIdRef = useRef(0);

  const razaoSocialRef = useRef<HTMLInputElement>(null);
  const nomeFantasiaRef = useRef<HTMLInputElement>(null);
  const telefonePrincipalRef = useRef<HTMLInputElement>(null);
  const logradouroRef = useRef<HTMLInputElement>(null);
  const numeroRef = useRef<HTMLInputElement>(null);
  const bairroRef = useRef<HTMLInputElement>(null);
  const cidadeRef = useRef<HTMLInputElement>(null);
  const estadoRef = useRef<HTMLSelectElement>(null);

  function preencherEnderecoDoCep(dados: {
    cep: string;
    logradouro: string | null;
    bairro: string | null;
    cidade: string;
    estado: string;
  }) {
    setCep(formatarCepParcial(dados.cep));

    if (logradouroRef.current) {
      logradouroRef.current.value = dados.logradouro ?? "";
    }

    if (bairroRef.current) {
      bairroRef.current.value = dados.bairro ?? "";
    }

    if (cidadeRef.current) {
      cidadeRef.current.value = dados.cidade;
    }

    if (estadoRef.current) {
      estadoRef.current.value = dados.estado;
    }
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

    if (razaoSocialRef.current) {
      razaoSocialRef.current.value = dados.razaoSocial;
    }

    if (nomeFantasiaRef.current) {
      nomeFantasiaRef.current.value = dados.nomeFantasia ?? "";
    }

    if (dados.telefonePrincipal && telefonePrincipalRef.current) {
      telefonePrincipalRef.current.value = formatarTelefoneParcial(
        dados.telefonePrincipal
      );
    }

    if (dados.cep) {
      setCep(formatarCepParcial(dados.cep));
    }

    if (dados.logradouro && logradouroRef.current) {
      logradouroRef.current.value = dados.logradouro;
    }

    if (dados.numero && numeroRef.current) {
      numeroRef.current.value = dados.numero;
    }

    if (dados.bairro && bairroRef.current) {
      bairroRef.current.value = dados.bairro;
    }

    if (dados.cidade && cidadeRef.current) {
      cidadeRef.current.value = dados.cidade;
    }

    if (dados.estado && estadoRef.current) {
      estadoRef.current.value = dados.estado;
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

  function handleTelefoneChange(event: ChangeEvent<HTMLInputElement>) {
    event.currentTarget.value = formatarTelefoneParcial(
      event.currentTarget.value
    );
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
    <form action={formAction} className="space-y-5">
      {fornecedorId && (
        <input type="hidden" name="id" value={fornecedorId} />
      )}

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
            {consultandoCnpj && (
              <p className="mt-1.5 text-xs text-gray-500">
                Consultando dados do CNPJ...
              </p>
            )}

            {!consultandoCnpj && avisoCnpj && (
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

                {avisoCnpj.tipo === "erro" && (
                  <button
                    type="button"
                    onClick={tentarNovamenteCnpj}
                    className="mt-1 text-xs font-medium text-[#1B3B32] underline"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="categoriaId" className={labelClassName}>
            Categoria de fornecimento
          </label>

          <select
            id="categoriaId"
            name="categoriaId"
            required
            defaultValue={valoresIniciais?.categoriaId ?? ""}
            className={`${inputClassName} bg-white`}
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>

            {categorias.map((categoria) => (
              <option key={categoria.ctf_id} value={categoria.ctf_id}>
                {categoria.ctf_descricao}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
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
            defaultValue={valoresIniciais?.razaoSocial}
            ref={razaoSocialRef}
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
            defaultValue={valoresIniciais?.nomeFantasia ?? undefined}
            ref={nomeFantasiaRef}
            className={inputClassName}
          />
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
            placeholder="Digite o e-mail"
            autoComplete="email"
            defaultValue={valoresIniciais?.email}
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
            defaultValue={formatarTelefoneParcial(
              valoresIniciais?.telefonePrincipal ?? ""
            )}
            onChange={handleTelefoneChange}
            ref={telefonePrincipalRef}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
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
            defaultValue={formatarTelefoneParcial(
              valoresIniciais?.telefoneSecundario ?? ""
            )}
            onChange={handleTelefoneChange}
            className={inputClassName}
          />
        </div>

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
            placeholder="00000-000"
            value={cep}
            onChange={handleCepChange}
            className={inputClassName}
          />

          <div aria-live="polite">
            {consultandoCep && (
              <p className="mt-1.5 text-xs text-gray-500">
                Consultando endereço...
              </p>
            )}

            {!consultandoCep && avisoCep && (
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

                {avisoCep.tipo === "erro" && (
                  <button
                    type="button"
                    onClick={tentarNovamenteCep}
                    className="mt-1 text-xs font-medium text-[#1B3B32] underline"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Localização
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="logradouro" className={labelClassName}>
            Logradouro
          </label>

          <input
            id="logradouro"
            name="logradouro"
            type="text"
            maxLength={200}
            placeholder="Rua, avenida, estrada..."
            defaultValue={valoresIniciais?.logradouro ?? undefined}
            ref={logradouroRef}
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
            placeholder="Nº"
            defaultValue={valoresIniciais?.numero ?? undefined}
            ref={numeroRef}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
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
            defaultValue={valoresIniciais?.bairro ?? undefined}
            ref={bairroRef}
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
            placeholder="Digite a cidade"
            defaultValue={valoresIniciais?.cidade ?? undefined}
            ref={cidadeRef}
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
            defaultValue={valoresIniciais?.estado ?? ""}
            ref={estadoRef}
            className={`${inputClassName} bg-white`}
          >
            <option value="">Selecione a UF</option>

            {ufsBrasil.map((uf) => (
              <option key={uf.sigla} value={uf.sigla}>
                {uf.nome} ({uf.sigla})
              </option>
            ))}
          </select>
        </div>
      </div>

      {erro && (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          {erro}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
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
    </form>
  );
}