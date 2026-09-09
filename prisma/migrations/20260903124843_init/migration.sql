-- CreateEnum
CREATE TYPE "receita_venda_rcv_categoria" AS ENUM ('VENDA_OVOS', 'VENDA_AVES_DESCARTE', 'ESTERCO', 'OUTROS');

-- CreateEnum
CREATE TYPE "tarefa_lote_tal_status" AS ENUM ('PENDENTE', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "categoria_insumo_cti_tipo" AS ENUM ('RACAO', 'MEDICAMENTO', 'VACINA', 'EMBALAGEM', 'OUTROS');

-- CreateEnum
CREATE TYPE "despesa_operacional_dpo_natureza" AS ENUM ('OPERACIONAL', 'COMPRA_INSUMO');

-- CreateEnum
CREATE TYPE "mortalidade_descarte_mor_tipo" AS ENUM ('MORTALIDADE', 'DESCARTE');

-- CreateEnum
CREATE TYPE "movimento_insumo_mvi_tipo_movimentacao" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "movimento_ovo_mvo_tipo_movimento" AS ENUM ('COLETA', 'VENDA', 'PERDA', 'DESCARTE');

-- CreateEnum
CREATE TYPE "usuario_usu_perfil_acesso" AS ENUM ('ADMIN', 'OPERADOR');

-- CreateEnum
CREATE TYPE "auditoria_alteracao_aud_operacao" AS ENUM ('CRIACAO', 'ALTERACAO');

-- CreateEnum
CREATE TYPE "galpao_gal_status" AS ENUM ('ATIVO', 'VAZIO_SANITARIO', 'MANUTENCAO', 'DESATIVADO');

-- CreateEnum
CREATE TYPE "insumo_ins_fase_aplicacao" AS ENUM ('CRIA', 'RECRIA', 'PRE_POSTURA', 'POSTURA', 'VAZIO_SANITARIO', 'USO_GERAL');

-- CreateEnum
CREATE TYPE "linhagem_lin_status" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "movimento_insumo_mvi_motivo_saida" AS ENUM ('CONSUMO_LOTE', 'VENDA', 'PERDA', 'DESCARTE', 'OUTROS');

-- CreateEnum
CREATE TYPE "insumo_ins_unidade_medida" AS ENUM ('KG', 'G', 'L', 'ML', 'UNIDADE', 'DOSE');

-- CreateEnum
CREATE TYPE "usuario_usu_status" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "lote_aves_lta_fase" AS ENUM ('CRIA', 'RECRIA', 'PRE_POSTURA', 'POSTURA');

-- CreateEnum
CREATE TYPE "lote_aves_lta_status" AS ENUM ('ATIVO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "auditoria_alteracao_aud_origem" AS ENUM ('USUARIO', 'SISTEMA');

-- CreateEnum
CREATE TYPE "insumo_ins_status" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "mortalidade_descarte_mor_status_registro" AS ENUM ('ATIVO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "receita_venda_rcv_status_registro" AS ENUM ('ATIVO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "movimento_ovo_mvo_status_registro" AS ENUM ('ATIVO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "despesa_operacional_dpo_status_registro" AS ENUM ('ATIVO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "movimento_insumo_mvi_status_registro" AS ENUM ('ATIVO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "fornecedor_for_status" AS ENUM ('ATIVO', 'INATIVO');

-- CreateTable
CREATE TABLE "auditoria_alteracao" (
    "aud_id" BIGSERIAL NOT NULL,
    "aud_entidade" VARCHAR(100) NOT NULL,
    "aud_registro_id" VARCHAR(100) NOT NULL,
    "aud_operacao" "auditoria_alteracao_aud_operacao" NOT NULL,
    "aud_valores_anteriores" JSONB,
    "aud_valores_novos" JSONB NOT NULL,
    "aud_motivo" VARCHAR(255),
    "aud_origem" "auditoria_alteracao_aud_origem" NOT NULL DEFAULT 'USUARIO',
    "usu_id" INTEGER,
    "aud_data_hora" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_alteracao_pkey" PRIMARY KEY ("aud_id")
);

-- CreateTable
CREATE TABLE "categoria_agenda" (
    "cta_id" SERIAL NOT NULL,
    "cta_descricao" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categoria_agenda_pkey" PRIMARY KEY ("cta_id")
);

-- CreateTable
CREATE TABLE "categoria_fornecedor" (
    "ctf_id" SERIAL NOT NULL,
    "ctf_descricao" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categoria_fornecedor_pkey" PRIMARY KEY ("ctf_id")
);

-- CreateTable
CREATE TABLE "categoria_insumo" (
    "cti_id" SERIAL NOT NULL,
    "cti_descricao" VARCHAR(100) NOT NULL,
    "cti_tipo" "categoria_insumo_cti_tipo" NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categoria_insumo_pkey" PRIMARY KEY ("cti_id")
);

-- CreateTable
CREATE TABLE "cronograma_padrao_insumo" (
    "cpi_id" SERIAL NOT NULL,
    "cpm_id" INTEGER NOT NULL,
    "ins_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cronograma_padrao_insumo_pkey" PRIMARY KEY ("cpi_id")
);

-- CreateTable
CREATE TABLE "cronograma_padrao_manejo" (
    "cpm_id" SERIAL NOT NULL,
    "cpm_dia_execucao" INTEGER NOT NULL,
    "cpm_descricao_tarefa" VARCHAR(255) NOT NULL,
    "lin_id" INTEGER NOT NULL,
    "cta_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cronograma_padrao_manejo_pkey" PRIMARY KEY ("cpm_id")
);

-- CreateTable
CREATE TABLE "despesa_operacional" (
    "dpo_id" SERIAL NOT NULL,
    "dpo_categoria" VARCHAR(100) NOT NULL,
    "dpo_natureza" "despesa_operacional_dpo_natureza" NOT NULL DEFAULT 'OPERACIONAL',
    "dpo_descricao" VARCHAR(255) NOT NULL,
    "dpo_valor" DECIMAL(10,2) NOT NULL,
    "dpo_data" DATE NOT NULL,
    "lta_id" INTEGER,
    "usu_id" INTEGER NOT NULL,
    "for_id" INTEGER,
    "dpo_status_registro" "despesa_operacional_dpo_status_registro" NOT NULL DEFAULT 'ATIVO',
    "dpo_estornado_em" TIMESTAMP(0),
    "dpo_estornado_por" INTEGER,
    "dpo_motivo_estorno" VARCHAR(255),
    "dpo_correcao_de_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "despesa_operacional_pkey" PRIMARY KEY ("dpo_id")
);

-- CreateTable
CREATE TABLE "fornecedor" (
    "for_id" SERIAL NOT NULL,
    "for_razao_social" VARCHAR(200) NOT NULL,
    "for_nome_fantasia" VARCHAR(200),
    "for_cnpj" CHAR(18) NOT NULL,
    "for_email" VARCHAR(150) NOT NULL,
    "for_telefone_principal" VARCHAR(20) NOT NULL,
    "for_telefone_secundario" VARCHAR(20),
    "for_cep" VARCHAR(10),
    "for_logradouro" VARCHAR(200),
    "for_numero" VARCHAR(20),
    "for_bairro" VARCHAR(100),
    "for_cidade" VARCHAR(100),
    "for_estado" CHAR(2),
    "for_status" "fornecedor_for_status" NOT NULL DEFAULT 'ATIVO',
    "ctf_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fornecedor_pkey" PRIMARY KEY ("for_id")
);

-- CreateTable
CREATE TABLE "galpao" (
    "gal_id" SERIAL NOT NULL,
    "gal_nome" VARCHAR(100) NOT NULL,
    "gal_area_m2" DECIMAL(6,2) NOT NULL,
    "gal_status" "galpao_gal_status" DEFAULT 'ATIVO',
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "galpao_pkey" PRIMARY KEY ("gal_id")
);

-- CreateTable
CREATE TABLE "insumo" (
    "ins_id" SERIAL NOT NULL,
    "ins_nome" VARCHAR(100) NOT NULL,
    "ins_composicao" VARCHAR(255),
    "ins_fase_aplicacao" "insumo_ins_fase_aplicacao" NOT NULL,
    "ins_unidade_medida" "insumo_ins_unidade_medida" NOT NULL,
    "ins_ponto_ressuprimento" DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    "ins_dias_carencia" INTEGER NOT NULL DEFAULT 0,
    "ins_status" "insumo_ins_status" NOT NULL DEFAULT 'ATIVO',
    "cti_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insumo_pkey" PRIMARY KEY ("ins_id")
);

-- CreateTable
CREATE TABLE "linhagem" (
    "lin_id" SERIAL NOT NULL,
    "lin_nome" VARCHAR(100) NOT NULL,
    "lin_descricao" VARCHAR(255),
    "lin_status" "linhagem_lin_status" DEFAULT 'ATIVO',
    "tov_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linhagem_pkey" PRIMARY KEY ("lin_id")
);

-- CreateTable
CREATE TABLE "lote_aves" (
    "lta_id" SERIAL NOT NULL,
    "lta_codigo_qr_code" VARCHAR(255) NOT NULL,
    "lta_quant_inicial" INTEGER NOT NULL,
    "lta_data_alojamento" DATE NOT NULL,
    "lta_idade_inicial" INTEGER NOT NULL DEFAULT 1,
    "lta_fase" "lote_aves_lta_fase" NOT NULL DEFAULT 'CRIA',
    "lta_status" "lote_aves_lta_status" NOT NULL DEFAULT 'ATIVO',
    "lta_data_encerramento" DATE,
    "lta_motivo_encerramento" VARCHAR(255),
    "lta_destino_descarte" VARCHAR(255),
    "lta_data_liberacao_ovos" DATE,
    "lin_id" INTEGER NOT NULL,
    "gal_id" INTEGER NOT NULL,
    "for_id" INTEGER NOT NULL,
    "usu_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lote_aves_pkey" PRIMARY KEY ("lta_id")
);

-- CreateTable
CREATE TABLE "lote_estoque_insumo" (
    "lei_id" SERIAL NOT NULL,
    "lei_lote_fabricante" VARCHAR(100),
    "lei_data_validade" DATE,
    "lei_data_entrada" DATE NOT NULL,
    "ins_id" INTEGER NOT NULL,
    "for_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lote_estoque_insumo_pkey" PRIMARY KEY ("lei_id")
);

-- CreateTable
CREATE TABLE "lote_estoque_ovo" (
    "leo_id" SERIAL NOT NULL,
    "leo_data_coleta" DATE NOT NULL,
    "leo_data_validade" DATE NOT NULL,
    "lta_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lote_estoque_ovo_pkey" PRIMARY KEY ("leo_id")
);

-- CreateTable
CREATE TABLE "meta_linhagem_semanal" (
    "mls_id" SERIAL NOT NULL,
    "mls_semana" INTEGER NOT NULL,
    "mls_peso_meta_gramas" DECIMAL(10,2),
    "mls_consumo_meta_gramas" DECIMAL(10,2),
    "mls_produtividade_meta_percentual" DECIMAL(5,2),
    "mls_temperatura_ideal" DECIMAL(5,2),
    "mls_horas_luz_dia" DECIMAL(4,2),
    "lin_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meta_linhagem_semanal_pkey" PRIMARY KEY ("mls_id")
);

-- CreateTable
CREATE TABLE "monitoramento_ambiencia" (
    "mna_id" SERIAL NOT NULL,
    "mna_data" DATE NOT NULL,
    "mna_hora" TIME(0) NOT NULL,
    "mna_temperatura_medida" DECIMAL(5,2) NOT NULL,
    "mna_horas_luz_reais" DECIMAL(5,2) NOT NULL,
    "lta_id" INTEGER NOT NULL,
    "usu_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitoramento_ambiencia_pkey" PRIMARY KEY ("mna_id")
);

-- CreateTable
CREATE TABLE "monitoramento_semanal" (
    "mns_id" SERIAL NOT NULL,
    "mns_semana" INTEGER NOT NULL,
    "mns_data_registro" DATE NOT NULL,
    "mns_peso_medio_real" DECIMAL(10,3) NOT NULL,
    "lta_id" INTEGER NOT NULL,
    "usu_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitoramento_semanal_pkey" PRIMARY KEY ("mns_id")
);

-- CreateTable
CREATE TABLE "mortalidade_descarte" (
    "mor_id" SERIAL NOT NULL,
    "mor_data" DATE NOT NULL,
    "mor_tipo" "mortalidade_descarte_mor_tipo" NOT NULL,
    "mor_quantidade" INTEGER NOT NULL,
    "mor_motivo" VARCHAR(255) NOT NULL,
    "lta_id" INTEGER NOT NULL,
    "usu_id" INTEGER NOT NULL,
    "mor_status_registro" "mortalidade_descarte_mor_status_registro" NOT NULL DEFAULT 'ATIVO',
    "mor_estornado_em" TIMESTAMP(0),
    "mor_estornado_por" INTEGER,
    "mor_motivo_estorno" VARCHAR(255),
    "mor_correcao_de_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mortalidade_descarte_pkey" PRIMARY KEY ("mor_id")
);

-- CreateTable
CREATE TABLE "movimento_insumo" (
    "mvi_id" SERIAL NOT NULL,
    "mvi_data_movimentacao" DATE NOT NULL,
    "mvi_tipo_movimentacao" "movimento_insumo_mvi_tipo_movimentacao" NOT NULL,
    "mvi_motivo_saida" "movimento_insumo_mvi_motivo_saida",
    "mvi_quantidade" DECIMAL(12,3) NOT NULL,
    "mvi_valor_unitario" DECIMAL(12,4) NOT NULL,
    "lei_id" INTEGER NOT NULL,
    "lta_id" INTEGER,
    "tal_id" INTEGER,
    "usu_id" INTEGER NOT NULL,
    "mvi_status_registro" "movimento_insumo_mvi_status_registro" NOT NULL DEFAULT 'ATIVO',
    "mvi_estornado_em" TIMESTAMP(0),
    "mvi_estornado_por" INTEGER,
    "mvi_motivo_estorno" VARCHAR(255),
    "mvi_correcao_de_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimento_insumo_pkey" PRIMARY KEY ("mvi_id")
);

-- CreateTable
CREATE TABLE "movimento_ovo" (
    "mvo_id" SERIAL NOT NULL,
    "mvo_data_movimento" DATE NOT NULL,
    "mvo_tipo_movimento" "movimento_ovo_mvo_tipo_movimento" NOT NULL,
    "mvo_quantidade" INTEGER NOT NULL,
    "mvo_observacao" TEXT,
    "leo_id" INTEGER NOT NULL,
    "rcv_id" INTEGER,
    "usu_id" INTEGER NOT NULL,
    "mvo_status_registro" "movimento_ovo_mvo_status_registro" NOT NULL DEFAULT 'ATIVO',
    "mvo_estornado_em" TIMESTAMP(0),
    "mvo_estornado_por" INTEGER,
    "mvo_motivo_estorno" VARCHAR(255),
    "mvo_correcao_de_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimento_ovo_pkey" PRIMARY KEY ("mvo_id")
);

-- CreateTable
CREATE TABLE "ocorrencia_saude" (
    "oco_id" SERIAL NOT NULL,
    "oco_data" DATE NOT NULL,
    "oco_hora" TIME(0),
    "oco_descricao" VARCHAR(255) NOT NULL,
    "oco_sintomas_observados" TEXT,
    "oco_num_aves_afetadas" INTEGER,
    "lta_id" INTEGER NOT NULL,
    "usu_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ocorrencia_saude_pkey" PRIMARY KEY ("oco_id")
);

-- CreateTable
CREATE TABLE "receita_venda" (
    "rcv_id" SERIAL NOT NULL,
    "rcv_categoria" "receita_venda_rcv_categoria" NOT NULL,
    "rcv_descricao" VARCHAR(255) NOT NULL,
    "rcv_valor_total" DECIMAL(10,2) NOT NULL,
    "rcv_data" DATE NOT NULL,
    "lta_id" INTEGER,
    "usu_id" INTEGER NOT NULL,
    "rcv_status_registro" "receita_venda_rcv_status_registro" NOT NULL DEFAULT 'ATIVO',
    "rcv_estornado_em" TIMESTAMP(0),
    "rcv_estornado_por" INTEGER,
    "rcv_motivo_estorno" VARCHAR(255),
    "rcv_correcao_de_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receita_venda_pkey" PRIMARY KEY ("rcv_id")
);

-- CreateTable
CREATE TABLE "tarefa_lote" (
    "tal_id" SERIAL NOT NULL,
    "tal_status" "tarefa_lote_tal_status" NOT NULL DEFAULT 'PENDENTE',
    "tal_data_prevista" DATE NOT NULL,
    "tal_data_realizacao" DATE,
    "tal_observacao" TEXT,
    "tal_tarefa" VARCHAR(255) NOT NULL,
    "cpm_id" INTEGER,
    "cta_id" INTEGER NOT NULL,
    "lta_id" INTEGER NOT NULL,
    "usu_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarefa_lote_pkey" PRIMARY KEY ("tal_id")
);

-- CreateTable
CREATE TABLE "tarefa_lote_insumo" (
    "tli_id" SERIAL NOT NULL,
    "tal_id" INTEGER NOT NULL,
    "ins_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarefa_lote_insumo_pkey" PRIMARY KEY ("tli_id")
);

-- CreateTable
CREATE TABLE "tipo_ovo" (
    "tov_id" SERIAL NOT NULL,
    "tov_nome" VARCHAR(50) NOT NULL,
    "tov_descricao" VARCHAR(255),
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipo_ovo_pkey" PRIMARY KEY ("tov_id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "usu_id" SERIAL NOT NULL,
    "usu_nome" VARCHAR(100) NOT NULL,
    "usu_perfil_acesso" "usuario_usu_perfil_acesso" NOT NULL,
    "usu_senha" VARCHAR(255) NOT NULL,
    "usu_status" "usuario_usu_status" DEFAULT 'ATIVO',
    "usu_email" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("usu_id")
);

-- CreateIndex
CREATE INDEX "idx_aud_data" ON "auditoria_alteracao"("aud_data_hora");

-- CreateIndex
CREATE INDEX "idx_aud_entidade_registro" ON "auditoria_alteracao"("aud_entidade", "aud_registro_id", "aud_data_hora");

-- CreateIndex
CREATE INDEX "idx_aud_usuario_data" ON "auditoria_alteracao"("usu_id", "aud_data_hora");

-- CreateIndex
CREATE UNIQUE INDEX "cta_descricao" ON "categoria_agenda"("cta_descricao");

-- CreateIndex
CREATE UNIQUE INDEX "ctf_descricao" ON "categoria_fornecedor"("ctf_descricao");

-- CreateIndex
CREATE UNIQUE INDEX "cti_descricao" ON "categoria_insumo"("cti_descricao");

-- CreateIndex
CREATE INDEX "idx_fk_cpi_insumo" ON "cronograma_padrao_insumo"("ins_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_cronograma_padrao_insumo" ON "cronograma_padrao_insumo"("cpm_id", "ins_id");

-- CreateIndex
CREATE INDEX "idx_fk_cpm_categoria" ON "cronograma_padrao_manejo"("cta_id");

-- CreateIndex
CREATE INDEX "idx_fk_cpm_linhagem" ON "cronograma_padrao_manejo"("lin_id");

-- CreateIndex
CREATE INDEX "idx_fk_dpo_correcao" ON "despesa_operacional"("dpo_correcao_de_id");

-- CreateIndex
CREATE INDEX "idx_fk_dpo_fornecedor" ON "despesa_operacional"("for_id");

-- CreateIndex
CREATE INDEX "idx_fk_dpo_usuario" ON "despesa_operacional"("usu_id");

-- CreateIndex
CREATE INDEX "idx_fk_dpo_usuario_estorno" ON "despesa_operacional"("dpo_estornado_por");

-- CreateIndex
CREATE INDEX "idx_dpo_lote_status" ON "despesa_operacional"("lta_id", "dpo_status_registro");

-- CreateIndex
CREATE INDEX "idx_dpo_natureza_data" ON "despesa_operacional"("dpo_natureza", "dpo_data");

-- CreateIndex
CREATE INDEX "idx_dpo_status_data" ON "despesa_operacional"("dpo_status_registro", "dpo_data");

-- CreateIndex
CREATE UNIQUE INDEX "for_cnpj" ON "fornecedor"("for_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "for_email" ON "fornecedor"("for_email");

-- CreateIndex
CREATE INDEX "idx_fk_fornecedor_categoria" ON "fornecedor"("ctf_id");

-- CreateIndex
CREATE INDEX "idx_fornecedor_status" ON "fornecedor"("for_status");

-- CreateIndex
CREATE UNIQUE INDEX "gal_nome" ON "galpao"("gal_nome");

-- CreateIndex
CREATE UNIQUE INDEX "ins_nome" ON "insumo"("ins_nome");

-- CreateIndex
CREATE INDEX "idx_fk_insumo_categoria" ON "insumo"("cti_id");

-- CreateIndex
CREATE INDEX "idx_insumo_status" ON "insumo"("ins_status");

-- CreateIndex
CREATE UNIQUE INDEX "lin_nome" ON "linhagem"("lin_nome");

-- CreateIndex
CREATE INDEX "idx_fk_linhagem_tipo_ovo" ON "linhagem"("tov_id");

-- CreateIndex
CREATE UNIQUE INDEX "lta_codigo_qr_code" ON "lote_aves"("lta_codigo_qr_code");

-- CreateIndex
CREATE INDEX "idx_fk_lote_fornecedor" ON "lote_aves"("for_id");

-- CreateIndex
CREATE INDEX "idx_fk_lote_galpao" ON "lote_aves"("gal_id");

-- CreateIndex
CREATE INDEX "idx_fk_lote_linhagem" ON "lote_aves"("lin_id");

-- CreateIndex
CREATE INDEX "idx_fk_lote_usuario" ON "lote_aves"("usu_id");

-- CreateIndex
CREATE INDEX "idx_fk_lei_fornecedor" ON "lote_estoque_insumo"("for_id");

-- CreateIndex
CREATE INDEX "idx_fk_lei_insumo" ON "lote_estoque_insumo"("ins_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_lote_estoque_ovo" ON "lote_estoque_ovo"("lta_id", "leo_data_coleta", "leo_data_validade");

-- CreateIndex
CREATE UNIQUE INDEX "uq_meta_linhagem_semana" ON "meta_linhagem_semanal"("lin_id", "mls_semana");

-- CreateIndex
CREATE INDEX "idx_fk_mna_lote" ON "monitoramento_ambiencia"("lta_id");

-- CreateIndex
CREATE INDEX "idx_fk_mna_usuario" ON "monitoramento_ambiencia"("usu_id");

-- CreateIndex
CREATE INDEX "idx_fk_mns_usuario" ON "monitoramento_semanal"("usu_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_monitoramento_lote_semana" ON "monitoramento_semanal"("lta_id", "mns_semana");

-- CreateIndex
CREATE INDEX "idx_fk_mor_correcao" ON "mortalidade_descarte"("mor_correcao_de_id");

-- CreateIndex
CREATE INDEX "idx_fk_mor_usuario" ON "mortalidade_descarte"("usu_id");

-- CreateIndex
CREATE INDEX "idx_fk_mor_usuario_estorno" ON "mortalidade_descarte"("mor_estornado_por");

-- CreateIndex
CREATE INDEX "idx_mor_lote_status" ON "mortalidade_descarte"("lta_id", "mor_status_registro", "mor_tipo");

-- CreateIndex
CREATE INDEX "idx_fk_mvi_correcao" ON "movimento_insumo"("mvi_correcao_de_id");

-- CreateIndex
CREATE INDEX "idx_fk_mvi_tarefa" ON "movimento_insumo"("tal_id");

-- CreateIndex
CREATE INDEX "idx_fk_mvi_usuario" ON "movimento_insumo"("usu_id");

-- CreateIndex
CREATE INDEX "idx_fk_mvi_usuario_estorno" ON "movimento_insumo"("mvi_estornado_por");

-- CreateIndex
CREATE INDEX "idx_mvi_estoque_status" ON "movimento_insumo"("lei_id", "mvi_status_registro", "mvi_tipo_movimentacao");

-- CreateIndex
CREATE INDEX "idx_mvi_lote_status" ON "movimento_insumo"("lta_id", "mvi_status_registro", "mvi_tipo_movimentacao");

-- CreateIndex
CREATE INDEX "idx_mvi_motivo_status" ON "movimento_insumo"("mvi_motivo_saida", "mvi_status_registro");

-- CreateIndex
CREATE INDEX "idx_fk_mvo_correcao" ON "movimento_ovo"("mvo_correcao_de_id");

-- CreateIndex
CREATE INDEX "idx_fk_mvo_usuario" ON "movimento_ovo"("usu_id");

-- CreateIndex
CREATE INDEX "idx_fk_mvo_usuario_estorno" ON "movimento_ovo"("mvo_estornado_por");

-- CreateIndex
CREATE INDEX "idx_mvo_estoque_status" ON "movimento_ovo"("leo_id", "mvo_status_registro", "mvo_tipo_movimento");

-- CreateIndex
CREATE INDEX "idx_mvo_receita" ON "movimento_ovo"("rcv_id");

-- CreateIndex
CREATE INDEX "idx_fk_oco_lote" ON "ocorrencia_saude"("lta_id");

-- CreateIndex
CREATE INDEX "idx_fk_oco_usuario" ON "ocorrencia_saude"("usu_id");

-- CreateIndex
CREATE INDEX "idx_fk_rcv_correcao" ON "receita_venda"("rcv_correcao_de_id");

-- CreateIndex
CREATE INDEX "idx_fk_rcv_lote" ON "receita_venda"("lta_id");

-- CreateIndex
CREATE INDEX "idx_fk_rcv_usuario" ON "receita_venda"("usu_id");

-- CreateIndex
CREATE INDEX "idx_fk_rcv_usuario_estorno" ON "receita_venda"("rcv_estornado_por");

-- CreateIndex
CREATE INDEX "idx_rcv_categoria_data" ON "receita_venda"("rcv_categoria", "rcv_data");

-- CreateIndex
CREATE INDEX "idx_rcv_status_data" ON "receita_venda"("rcv_status_registro", "rcv_data");

-- CreateIndex
CREATE INDEX "idx_fk_tal_categoria" ON "tarefa_lote"("cta_id");

-- CreateIndex
CREATE INDEX "idx_fk_tal_cronograma" ON "tarefa_lote"("cpm_id");

-- CreateIndex
CREATE INDEX "idx_fk_tal_usuario" ON "tarefa_lote"("usu_id");

-- CreateIndex
CREATE INDEX "idx_tarefa_lote_status" ON "tarefa_lote"("lta_id", "tal_status");

-- CreateIndex
CREATE INDEX "idx_tarefa_status_data" ON "tarefa_lote"("tal_status", "tal_data_prevista");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tarefa_lote_cronograma" ON "tarefa_lote"("lta_id", "cpm_id", "tal_data_prevista");

-- CreateIndex
CREATE INDEX "idx_fk_tli_insumo" ON "tarefa_lote_insumo"("ins_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tarefa_lote_insumo" ON "tarefa_lote_insumo"("tal_id", "ins_id");

-- CreateIndex
CREATE UNIQUE INDEX "tov_nome" ON "tipo_ovo"("tov_nome");

-- CreateIndex
CREATE UNIQUE INDEX "usu_email" ON "usuario"("usu_email");

-- AddForeignKey
ALTER TABLE "auditoria_alteracao" ADD CONSTRAINT "fk_aud_usuario" FOREIGN KEY ("usu_id") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cronograma_padrao_insumo" ADD CONSTRAINT "fk_cpi_cronograma" FOREIGN KEY ("cpm_id") REFERENCES "cronograma_padrao_manejo"("cpm_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cronograma_padrao_insumo" ADD CONSTRAINT "fk_cpi_insumo" FOREIGN KEY ("ins_id") REFERENCES "insumo"("ins_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cronograma_padrao_manejo" ADD CONSTRAINT "fk_cpm_categoria" FOREIGN KEY ("cta_id") REFERENCES "categoria_agenda"("cta_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cronograma_padrao_manejo" ADD CONSTRAINT "fk_cpm_linhagem" FOREIGN KEY ("lin_id") REFERENCES "linhagem"("lin_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "despesa_operacional" ADD CONSTRAINT "fk_dpo_correcao" FOREIGN KEY ("dpo_correcao_de_id") REFERENCES "despesa_operacional"("dpo_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "despesa_operacional" ADD CONSTRAINT "fk_dpo_fornecedor" FOREIGN KEY ("for_id") REFERENCES "fornecedor"("for_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "despesa_operacional" ADD CONSTRAINT "fk_dpo_lote" FOREIGN KEY ("lta_id") REFERENCES "lote_aves"("lta_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "despesa_operacional" ADD CONSTRAINT "fk_dpo_usuario" FOREIGN KEY ("usu_id") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "despesa_operacional" ADD CONSTRAINT "fk_dpo_usuario_estorno" FOREIGN KEY ("dpo_estornado_por") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fornecedor" ADD CONSTRAINT "fk_fornecedor_categoria" FOREIGN KEY ("ctf_id") REFERENCES "categoria_fornecedor"("ctf_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "insumo" ADD CONSTRAINT "fk_insumo_categoria" FOREIGN KEY ("cti_id") REFERENCES "categoria_insumo"("cti_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "linhagem" ADD CONSTRAINT "fk_linhagem_tipo_ovo" FOREIGN KEY ("tov_id") REFERENCES "tipo_ovo"("tov_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lote_aves" ADD CONSTRAINT "fk_lote_fornecedor" FOREIGN KEY ("for_id") REFERENCES "fornecedor"("for_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lote_aves" ADD CONSTRAINT "fk_lote_galpao" FOREIGN KEY ("gal_id") REFERENCES "galpao"("gal_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lote_aves" ADD CONSTRAINT "fk_lote_linhagem" FOREIGN KEY ("lin_id") REFERENCES "linhagem"("lin_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lote_aves" ADD CONSTRAINT "fk_lote_usuario" FOREIGN KEY ("usu_id") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lote_estoque_insumo" ADD CONSTRAINT "fk_lei_fornecedor" FOREIGN KEY ("for_id") REFERENCES "fornecedor"("for_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lote_estoque_insumo" ADD CONSTRAINT "fk_lei_insumo" FOREIGN KEY ("ins_id") REFERENCES "insumo"("ins_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lote_estoque_ovo" ADD CONSTRAINT "fk_leo_lote_aves" FOREIGN KEY ("lta_id") REFERENCES "lote_aves"("lta_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meta_linhagem_semanal" ADD CONSTRAINT "fk_mls_linhagem" FOREIGN KEY ("lin_id") REFERENCES "linhagem"("lin_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "monitoramento_ambiencia" ADD CONSTRAINT "fk_mna_lote" FOREIGN KEY ("lta_id") REFERENCES "lote_aves"("lta_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "monitoramento_ambiencia" ADD CONSTRAINT "fk_mna_usuario" FOREIGN KEY ("usu_id") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "monitoramento_semanal" ADD CONSTRAINT "fk_mns_lote" FOREIGN KEY ("lta_id") REFERENCES "lote_aves"("lta_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "monitoramento_semanal" ADD CONSTRAINT "fk_mns_usuario" FOREIGN KEY ("usu_id") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mortalidade_descarte" ADD CONSTRAINT "fk_mor_correcao" FOREIGN KEY ("mor_correcao_de_id") REFERENCES "mortalidade_descarte"("mor_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mortalidade_descarte" ADD CONSTRAINT "fk_mor_lote" FOREIGN KEY ("lta_id") REFERENCES "lote_aves"("lta_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mortalidade_descarte" ADD CONSTRAINT "fk_mor_usuario" FOREIGN KEY ("usu_id") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mortalidade_descarte" ADD CONSTRAINT "fk_mor_usuario_estorno" FOREIGN KEY ("mor_estornado_por") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimento_insumo" ADD CONSTRAINT "fk_mvi_correcao" FOREIGN KEY ("mvi_correcao_de_id") REFERENCES "movimento_insumo"("mvi_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimento_insumo" ADD CONSTRAINT "fk_mvi_lote_aves" FOREIGN KEY ("lta_id") REFERENCES "lote_aves"("lta_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimento_insumo" ADD CONSTRAINT "fk_mvi_lote_estoque" FOREIGN KEY ("lei_id") REFERENCES "lote_estoque_insumo"("lei_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimento_insumo" ADD CONSTRAINT "fk_mvi_tarefa" FOREIGN KEY ("tal_id") REFERENCES "tarefa_lote"("tal_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimento_insumo" ADD CONSTRAINT "fk_mvi_usuario" FOREIGN KEY ("usu_id") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimento_insumo" ADD CONSTRAINT "fk_mvi_usuario_estorno" FOREIGN KEY ("mvi_estornado_por") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimento_ovo" ADD CONSTRAINT "fk_mvo_correcao" FOREIGN KEY ("mvo_correcao_de_id") REFERENCES "movimento_ovo"("mvo_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimento_ovo" ADD CONSTRAINT "fk_mvo_lote_estoque_ovo" FOREIGN KEY ("leo_id") REFERENCES "lote_estoque_ovo"("leo_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimento_ovo" ADD CONSTRAINT "fk_mvo_receita" FOREIGN KEY ("rcv_id") REFERENCES "receita_venda"("rcv_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimento_ovo" ADD CONSTRAINT "fk_mvo_usuario" FOREIGN KEY ("usu_id") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimento_ovo" ADD CONSTRAINT "fk_mvo_usuario_estorno" FOREIGN KEY ("mvo_estornado_por") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ocorrencia_saude" ADD CONSTRAINT "fk_oco_lote" FOREIGN KEY ("lta_id") REFERENCES "lote_aves"("lta_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ocorrencia_saude" ADD CONSTRAINT "fk_oco_usuario" FOREIGN KEY ("usu_id") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "receita_venda" ADD CONSTRAINT "fk_rcv_correcao" FOREIGN KEY ("rcv_correcao_de_id") REFERENCES "receita_venda"("rcv_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "receita_venda" ADD CONSTRAINT "fk_rcv_lote" FOREIGN KEY ("lta_id") REFERENCES "lote_aves"("lta_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "receita_venda" ADD CONSTRAINT "fk_rcv_usuario" FOREIGN KEY ("usu_id") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "receita_venda" ADD CONSTRAINT "fk_rcv_usuario_estorno" FOREIGN KEY ("rcv_estornado_por") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tarefa_lote" ADD CONSTRAINT "fk_tal_categoria" FOREIGN KEY ("cta_id") REFERENCES "categoria_agenda"("cta_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tarefa_lote" ADD CONSTRAINT "fk_tal_cronograma" FOREIGN KEY ("cpm_id") REFERENCES "cronograma_padrao_manejo"("cpm_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tarefa_lote" ADD CONSTRAINT "fk_tal_lote" FOREIGN KEY ("lta_id") REFERENCES "lote_aves"("lta_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tarefa_lote" ADD CONSTRAINT "fk_tal_usuario" FOREIGN KEY ("usu_id") REFERENCES "usuario"("usu_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tarefa_lote_insumo" ADD CONSTRAINT "fk_tli_insumo" FOREIGN KEY ("ins_id") REFERENCES "insumo"("ins_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tarefa_lote_insumo" ADD CONSTRAINT "fk_tli_tarefa" FOREIGN KEY ("tal_id") REFERENCES "tarefa_lote"("tal_id") ON DELETE CASCADE ON UPDATE NO ACTION;
