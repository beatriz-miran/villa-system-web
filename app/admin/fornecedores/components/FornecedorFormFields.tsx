"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";

import { buscarDadosCnpjAction } from "@/app/admin/fornecedores/actions";
import {
  cnpjValido,
  formatarCnpjParcial,
  somenteDigitos,
} from "@/application/fornecedores/cnpj";

type Categoria = {
  ctf_id: number;
  ctf_descricao: string;
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
  const [cnpj, setCnpj] = useState(valoresIniciais?.cnpj ?? "");
  const [consultandoCnpj, setConsultandoCnpj] = useState(false);
  const [avisoCnpj, setAvisoCnpj] = useState<{
    tipo: "sucesso" | "erro";
    mensagem: string;
  } | null>(null);

  const ultimoCnpjConsultadoRef = useRef<string | null>(null);
  const consultaIdRef = useRef(0);

  const razaoSocialRef = useRef<HTMLInputElement>(null);
  const nomeFantasiaRef = useRef<HTMLInputElement>(null);
  const telefonePrincipalRef = useRef<HTMLInputElement>(null);
  const cepRef = useRef<HTMLInputElement>(null);
  const logradouroRef = useRef<HTMLInputElement>(null);
  const numeroRef = useRef<HTMLInputElement>(null);
  const bairroRef = useRef<HTMLInputElement>(null);
  const cidadeRef = useRef<HTMLInputElement>(null);
  const estadoRef = useRef<HTMLInputElement>(null);

  async function handleCnpjChange(event: ChangeEvent<HTMLInputElement>) {
    const valorFormatado = formatarCnpjParcial(event.target.value);
    setCnpj(valorFormatado);

    const digitos = somenteDigitos(valorFormatado);

    if (
      digitos.length !== 14 ||
      digitos === ultimoCnpjConsultadoRef.current ||
      !cnpjValido(digitos)
    ) {
      return;
    }

    ultimoCnpjConsultadoRef.current = digitos;

    const idConsulta = ++consultaIdRef.current;

    setConsultandoCnpj(true);
    setAvisoCnpj(null);

    const resultado = await buscarDadosCnpjAction(digitos);

    if (idConsulta !== consultaIdRef.current) {
      return;
    }

    setConsultandoCnpj(false);

    if (!resultado.sucesso) {
      setAvisoCnpj({ tipo: "erro", mensagem: resultado.mensagem });
      return;
    }

    const { dados } = resultado;

    if (dados.razaoSocial && razaoSocialRef.current) {
      razaoSocialRef.current.value = dados.razaoSocial;
    }

    if (nomeFantasiaRef.current) {
      nomeFantasiaRef.current.value = dados.nomeFantasia ?? "";
    }

    if (dados.telefonePrincipal && telefonePrincipalRef.current) {
      telefonePrincipalRef.current.value = dados.telefonePrincipal;
    }

    if (cepRef.current) cepRef.current.value = dados.cep ?? "";
    if (logradouroRef.current) {
      logradouroRef.current.value = dados.logradouro ?? "";
    }
    if (numeroRef.current) numeroRef.current.value = dados.numero ?? "";
    if (bairroRef.current) bairroRef.current.value = dados.bairro ?? "";
    if (cidadeRef.current) cidadeRef.current.value = dados.cidade ?? "";
    if (estadoRef.current) estadoRef.current.value = dados.estado ?? "";

    setAvisoCnpj({
      tipo: "sucesso",
      mensagem: "Dados preenchidos automaticamente a partir do CNPJ.",
    });
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
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={handleCnpjChange}
            className={inputClassName}
          />

          {consultandoCnpj && (
            <p className="mt-1.5 text-xs text-gray-500">
              Consultando dados do CNPJ...
            </p>
          )}

          {!consultandoCnpj && avisoCnpj && (
            <p
              className={`mt-1.5 text-xs ${
                avisoCnpj.tipo === "sucesso"
                  ? "text-green-700"
                  : "text-amber-600"
              }`}
            >
              {avisoCnpj.mensagem}
            </p>
          )}
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
            placeholder="(00) 00000-0000"
            defaultValue={valoresIniciais?.telefonePrincipal}
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
            placeholder="(00) 00000-0000"
            defaultValue={
              valoresIniciais?.telefoneSecundario ?? undefined
            }
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
            placeholder="00000-000"
            defaultValue={valoresIniciais?.cep ?? undefined}
            ref={cepRef}
            className={inputClassName}
          />
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

          <input
            id="estado"
            name="estado"
            type="text"
            maxLength={2}
            placeholder="UF"
            defaultValue={valoresIniciais?.estado ?? undefined}
            ref={estadoRef}
            className={`${inputClassName} uppercase`}
          />
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
