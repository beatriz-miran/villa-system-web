export function somenteDigitosTelefone(valor: string) {
  return valor.replace(/\D/g, "");
}

export function telefoneValido(valor: string) {
  const digitos = somenteDigitosTelefone(valor);

  return digitos.length === 10 || digitos.length === 11;
}

export function formatarTelefoneParcial(valor: string) {
  const digitos = somenteDigitosTelefone(valor).slice(0, 11);

  if (digitos.length === 0) {
    return "";
  }

  if (digitos.length <= 2) {
    return `(${digitos}`;
  }

  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);

  if (digitos.length <= 10) {
    if (numero.length <= 4) {
      return `(${ddd}) ${numero}`;
    }

    return `(${ddd}) ${numero.slice(0, 4)}-${numero.slice(4)}`;
  }

  return `(${ddd}) ${numero.slice(0, 5)}-${numero.slice(5)}`;
}