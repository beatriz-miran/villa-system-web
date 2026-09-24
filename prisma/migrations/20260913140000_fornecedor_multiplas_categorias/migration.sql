CREATE TABLE "fornecedor_categoria" (
  "for_id" INTEGER NOT NULL,
  "ctf_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "fornecedor_categoria_pkey"
    PRIMARY KEY ("for_id", "ctf_id")
);

INSERT INTO "fornecedor_categoria" ("for_id", "ctf_id")
SELECT "for_id", "ctf_id"
FROM "fornecedor";

ALTER TABLE "fornecedor_categoria"
  ADD CONSTRAINT "fk_fornecedor_categoria_fornecedor"
  FOREIGN KEY ("for_id")
  REFERENCES "fornecedor"("for_id")
  ON DELETE CASCADE
  ON UPDATE NO ACTION;

ALTER TABLE "fornecedor_categoria"
  ADD CONSTRAINT "fk_fornecedor_categoria_categoria"
  FOREIGN KEY ("ctf_id")
  REFERENCES "categoria_fornecedor"("ctf_id")
  ON DELETE CASCADE
  ON UPDATE NO ACTION;

CREATE INDEX "idx_fornecedor_categoria_ctf"
  ON "fornecedor_categoria"("ctf_id");

ALTER TABLE "fornecedor"
  DROP CONSTRAINT "fk_fornecedor_categoria";

DROP INDEX "idx_fk_fornecedor_categoria";

ALTER TABLE "fornecedor"
  DROP COLUMN "ctf_id";