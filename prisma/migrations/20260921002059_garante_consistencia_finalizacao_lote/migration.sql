-- This is an empty migration.-- Garante que lotes ativos não possuam dados de encerramento
-- e que lotes finalizados possuam todos os dados obrigatórios.
ALTER TABLE "lote_aves"
ADD CONSTRAINT "chk_lote_finalizacao_consistente"
CHECK (
  (
    "lta_status" = 'ATIVO'
    AND "lta_data_encerramento" IS NULL
    AND "lta_motivo_encerramento" IS NULL
    AND "lta_destino_descarte" IS NULL
  )
  OR
  (
    "lta_status" = 'FINALIZADO'
    AND "lta_data_encerramento" IS NOT NULL
    AND NULLIF(
      BTRIM("lta_motivo_encerramento"),
      ''
    ) IS NOT NULL
    AND NULLIF(
      BTRIM("lta_destino_descarte"),
      ''
    ) IS NOT NULL
  )
);

-- Impede que o encerramento seja anterior ao alojamento.
ALTER TABLE "lote_aves"
ADD CONSTRAINT "chk_lote_data_encerramento"
CHECK (
  "lta_data_encerramento" IS NULL
  OR "lta_data_encerramento" >= "lta_data_alojamento"
);