-- CreateEnum
CREATE TYPE "cartilha_linhagem_ctl_sistema" AS ENUM ('CAGE_FREE', 'CONVENCIONAL', 'FREE_RANGE', 'GERAL', 'SISTEMAS_ALTERNATIVOS');

-- CreateTable
CREATE TABLE "cartilha_linhagem" (
    "ctl_id" SERIAL NOT NULL,
    "ctl_titulo" VARCHAR(150) NOT NULL,
    "ctl_fonte" VARCHAR(150) NOT NULL,
    "ctl_sistema" "cartilha_linhagem_ctl_sistema" NOT NULL DEFAULT 'GERAL',
    "ctl_edicao" VARCHAR(100),
    "ctl_url" VARCHAR(2048) NOT NULL,
    "lin_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cartilha_linhagem_pkey" PRIMARY KEY ("ctl_id")
);

-- CreateIndex
CREATE INDEX "idx_cartilha_linhagem" ON "cartilha_linhagem"("lin_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_cartilha_linhagem_url" ON "cartilha_linhagem"("lin_id", "ctl_url");

-- AddForeignKey
ALTER TABLE "cartilha_linhagem" ADD CONSTRAINT "fk_cartilha_linhagem" FOREIGN KEY ("lin_id") REFERENCES "linhagem"("lin_id") ON DELETE CASCADE ON UPDATE NO ACTION;
