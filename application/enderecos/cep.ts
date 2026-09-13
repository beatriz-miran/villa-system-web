export function somenteDigitosCep(valor: string) {
  return valor.replace(/\D/g, "");
}

export function formatarCepParcial(valor: string) {
  const digitos = somenteDigitosCep(valor).slice(0, 8);

  if (digitos.length <= 5) {
    return digitos;
  }

  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

export function cepValido(valor: string) {
  return /^\d{8}$/.test(somenteDigitosCep(valor));
}