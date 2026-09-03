export function somenteDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

export function formatarCnpj(cnpj: string) {
  const digitos = somenteDigitos(cnpj);

  return digitos.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

export function formatarCnpjParcial(valor: string) {
  const digitos = somenteDigitos(valor).slice(0, 14);

  const partes = [
    digitos.slice(0, 2),
    digitos.slice(2, 5),
    digitos.slice(5, 8),
    digitos.slice(8, 12),
    digitos.slice(12, 14),
  ];

  let resultado = partes[0];

  if (partes[1]) resultado += `.${partes[1]}`;
  if (partes[2]) resultado += `.${partes[2]}`;
  if (partes[3]) resultado += `/${partes[3]}`;
  if (partes[4]) resultado += `-${partes[4]}`;

  return resultado;
}

function calcularDigitoVerificador(base: string, pesos: number[]) {
  const soma = base
    .split("")
    .reduce(
      (acumulado, digito, indice) =>
        acumulado + Number(digito) * pesos[indice],
      0
    );

  const resto = soma % 11;

  return resto < 2 ? 0 : 11 - resto;
}

export function cnpjValido(cnpj: string) {
  const digitos = somenteDigitos(cnpj);

  if (digitos.length !== 14) {
    return false;
  }

  if (/^(\d)\1{13}$/.test(digitos)) {
    return false;
  }

  const pesosPrimeiroDigito = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesosSegundoDigito = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const primeiroDigito = calcularDigitoVerificador(
    digitos.slice(0, 12),
    pesosPrimeiroDigito
  );

  const segundoDigito = calcularDigitoVerificador(
    digitos.slice(0, 12) + primeiroDigito,
    pesosSegundoDigito
  );

  return digitos.slice(12) === `${primeiroDigito}${segundoDigito}`;
}
