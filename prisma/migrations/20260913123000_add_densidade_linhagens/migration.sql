-- AlterTable
ALTER TABLE "linhagem"
ADD COLUMN "lin_densidade_maxima_aves_m2" DECIMAL(5, 2);

-- Preenche as referências técnicas das linhagens oficiais existentes.
UPDATE "linhagem"
SET "lin_densidade_maxima_aves_m2" =
  CASE
    WHEN LOWER(TRIM("lin_nome")) = 'hy-line brown' THEN 9.00
    WHEN LOWER(TRIM("lin_nome")) = 'embrapa 051' THEN 7.00
    WHEN LOWER(TRIM("lin_nome")) = 'lohmann brown-classic' THEN 8.00
    ELSE "lin_densidade_maxima_aves_m2"
  END
WHERE LOWER(TRIM("lin_nome")) IN (
  'hy-line brown',
  'embrapa 051',
  'lohmann brown-classic'
);

-- A densidade pode permanecer nula para linhagens antigas,
-- mas, quando informada, deve ser maior que zero.
ALTER TABLE "linhagem"
ADD CONSTRAINT "ck_linhagem_densidade_maxima_positiva"
CHECK (
  "lin_densidade_maxima_aves_m2" IS NULL
  OR "lin_densidade_maxima_aves_m2" > 0
);