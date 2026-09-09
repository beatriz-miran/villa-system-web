// Datas de alojamento chegam tipicamente como "YYYY-MM-DD" (via
// z.coerce.date), que o JavaScript interpreta como meia-noite UTC. Ambas as
// datas são normalizadas para o dia calendário em UTC antes de comparar,
// para funcionar também com um Date que já contenha um horário (ex.: um
// valor vindo diretamente de `new Date()`) e para não haver divergência de
// um dia conforme o fuso horário do servidor.
function inicioDoDiaUtc(data: Date) {
  return Date.UTC(
    data.getUTCFullYear(),
    data.getUTCMonth(),
    data.getUTCDate()
  );
}

export function dataAlojamentoEhFutura(
  dataAlojamento: Date,
  agora = new Date()
) {
  return inicioDoDiaUtc(dataAlojamento) > inicioDoDiaUtc(agora);
}
