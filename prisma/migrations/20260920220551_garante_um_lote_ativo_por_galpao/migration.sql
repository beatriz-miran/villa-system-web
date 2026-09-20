-- Garante que cada galpão possua no máximo um lote ativo.
CREATE UNIQUE INDEX "uq_lote_ativo_por_galpao"
ON "lote_aves" ("gal_id")
WHERE "lta_status" = 'ATIVO';