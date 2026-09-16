-- CreateEnum
CREATE TYPE "ocorrencia_saude_oco_tipo" AS ENUM ('SINTOMA', 'DOENCA_SUSPEITA', 'DOENCA_CONFIRMADA', 'LESAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "ocorrencia_saude_oco_status" AS ENUM ('EM_OBSERVACAO', 'EM_QUARENTENA', 'EM_TRATAMENTO', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "ocorrencia_saude_oco_gravidade" AS ENUM ('BAIXA', 'MODERADA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "ocorrencia_saude_oco_desfecho" AS ENUM ('RECUPERACAO', 'MORTALIDADE', 'DESCARTE', 'OUTRO');

-- AlterTable
ALTER TABLE "ocorrencia_saude" ADD COLUMN     "oco_conduta_inicial" TEXT,
ADD COLUMN     "oco_data_encerramento" DATE,
ADD COLUMN     "oco_desfecho" "ocorrencia_saude_oco_desfecho",
ADD COLUMN     "oco_gravidade" "ocorrencia_saude_oco_gravidade" NOT NULL DEFAULT 'BAIXA',
ADD COLUMN     "oco_observacao_desfecho" TEXT,
ADD COLUMN     "oco_status" "ocorrencia_saude_oco_status" NOT NULL DEFAULT 'EM_OBSERVACAO',
ADD COLUMN     "oco_tipo" "ocorrencia_saude_oco_tipo" NOT NULL DEFAULT 'SINTOMA';

-- CreateTable
CREATE TABLE "acompanhamento_saude" (
    "acs_id" SERIAL NOT NULL,
    "acs_data" DATE NOT NULL,
    "acs_status" "ocorrencia_saude_oco_status" NOT NULL,
    "acs_num_aves_afetadas" INTEGER,
    "acs_observacao" TEXT NOT NULL,
    "acs_tratamento" TEXT,
    "oco_id" INTEGER NOT NULL,
    "usu_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acompanhamento_saude_pkey" PRIMARY KEY ("acs_id")
);

-- CreateIndex
CREATE INDEX "idx_acs_ocorrencia_data" ON "acompanhamento_saude"("oco_id", "acs_data");

-- CreateIndex
CREATE INDEX "idx_fk_acs_usuario" ON "acompanhamento_saude"("usu_id");

-- CreateIndex
CREATE INDEX "idx_oco_lote_status" ON "ocorrencia_saude"("lta_id", "oco_status");

-- AddForeignKey
ALTER TABLE "acompanhamento_saude" ADD CONSTRAINT "fk_acs_ocorrencia" FOREIGN KEY ("oco_id") REFERENCES "ocorrencia_saude"("oco_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "acompanhamento_saude" ADD CONSTRAINT "fk_acs_usuario" FOREIGN KEY ("usu_id") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;
