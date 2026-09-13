-- CHECK constraints migrated from the legacy MySQL schema (not representable
-- in schema.prisma, see https://pris.ly/d/check-constraints).

ALTER TABLE "galpao" ADD CONSTRAINT "galpao_chk_1" CHECK ("gal_area_m2" > 0);

ALTER TABLE "insumo" ADD CONSTRAINT "insumo_chk_1" CHECK ("ins_ponto_ressuprimento" >= 0);
ALTER TABLE "insumo" ADD CONSTRAINT "insumo_chk_2" CHECK ("ins_dias_carencia" >= 0);

ALTER TABLE "lote_aves" ADD CONSTRAINT "lote_aves_chk_1" CHECK ("lta_quant_inicial" > 0);
ALTER TABLE "lote_aves" ADD CONSTRAINT "lote_aves_chk_2" CHECK ("lta_idade_inicial" >= 1);

ALTER TABLE "lote_estoque_ovo" ADD CONSTRAINT "chk_leo_validade" CHECK ("leo_data_validade" >= "leo_data_coleta");

ALTER TABLE "receita_venda" ADD CONSTRAINT "receita_venda_chk_1" CHECK ("rcv_valor_total" > 0);
ALTER TABLE "receita_venda" ADD CONSTRAINT "chk_receita_venda_lote" CHECK (("rcv_categoria" <> 'VENDA_OVOS') OR ("lta_id" IS NULL));
ALTER TABLE "receita_venda" ADD CONSTRAINT "chk_rcv_estorno_coerente" CHECK (
  (("rcv_status_registro" = 'ATIVO') AND ("rcv_estornado_em" IS NULL) AND ("rcv_estornado_por" IS NULL) AND ("rcv_motivo_estorno" IS NULL))
  OR (("rcv_status_registro" = 'ESTORNADO') AND ("rcv_estornado_em" IS NOT NULL) AND ("rcv_estornado_por" IS NOT NULL) AND ("rcv_motivo_estorno" IS NOT NULL))
);

ALTER TABLE "movimento_ovo" ADD CONSTRAINT "movimento_ovo_chk_1" CHECK ("mvo_quantidade" > 0);
ALTER TABLE "movimento_ovo" ADD CONSTRAINT "chk_mvo_receita_coerente" CHECK (
  (("mvo_tipo_movimento" = 'VENDA') AND ("rcv_id" IS NOT NULL))
  OR (("mvo_tipo_movimento" <> 'VENDA') AND ("rcv_id" IS NULL))
);
ALTER TABLE "movimento_ovo" ADD CONSTRAINT "chk_mvo_estorno_coerente" CHECK (
  (("mvo_status_registro" = 'ATIVO') AND ("mvo_estornado_em" IS NULL) AND ("mvo_estornado_por" IS NULL) AND ("mvo_motivo_estorno" IS NULL))
  OR (("mvo_status_registro" = 'ESTORNADO') AND ("mvo_estornado_em" IS NOT NULL) AND ("mvo_estornado_por" IS NOT NULL) AND ("mvo_motivo_estorno" IS NOT NULL))
);

ALTER TABLE "cronograma_padrao_manejo" ADD CONSTRAINT "cronograma_padrao_manejo_chk_1" CHECK ("cpm_dia_execucao" > 0);

ALTER TABLE "tarefa_lote" ADD CONSTRAINT "chk_tarefa_realizacao_coerente" CHECK (
  (("tal_status" = 'CONCLUIDO') AND ("tal_data_realizacao" IS NOT NULL))
  OR (("tal_status" IN ('PENDENTE', 'CANCELADO')) AND ("tal_data_realizacao" IS NULL))
);

ALTER TABLE "lote_estoque_insumo" ADD CONSTRAINT "chk_lei_validade" CHECK (("lei_data_validade" IS NULL) OR ("lei_data_validade" >= "lei_data_entrada"));

ALTER TABLE "monitoramento_ambiencia" ADD CONSTRAINT "monitoramento_ambiencia_chk_1" CHECK (("mna_horas_luz_reais" >= 0) AND ("mna_horas_luz_reais" <= 24));

ALTER TABLE "movimento_insumo" ADD CONSTRAINT "movimento_insumo_chk_1" CHECK ("mvi_quantidade" > 0);
ALTER TABLE "movimento_insumo" ADD CONSTRAINT "movimento_insumo_chk_2" CHECK ("mvi_valor_unitario" >= 0);
ALTER TABLE "movimento_insumo" ADD CONSTRAINT "chk_movimento_insumo_coerente" CHECK (
  (("mvi_tipo_movimentacao" = 'ENTRADA') AND ("mvi_motivo_saida" IS NULL) AND ("lta_id" IS NULL) AND ("tal_id" IS NULL))
  OR (("mvi_tipo_movimentacao" = 'SAIDA') AND ("mvi_motivo_saida" = 'CONSUMO_LOTE') AND ("lta_id" IS NOT NULL))
  OR (("mvi_tipo_movimentacao" = 'SAIDA') AND ("mvi_motivo_saida" IN ('VENDA', 'PERDA', 'DESCARTE', 'OUTROS')) AND ("lta_id" IS NULL) AND ("tal_id" IS NULL))
);
ALTER TABLE "movimento_insumo" ADD CONSTRAINT "chk_mvi_estorno_coerente" CHECK (
  (("mvi_status_registro" = 'ATIVO') AND ("mvi_estornado_em" IS NULL) AND ("mvi_estornado_por" IS NULL) AND ("mvi_motivo_estorno" IS NULL))
  OR (("mvi_status_registro" = 'ESTORNADO') AND ("mvi_estornado_em" IS NOT NULL) AND ("mvi_estornado_por" IS NOT NULL) AND ("mvi_motivo_estorno" IS NOT NULL))
);

ALTER TABLE "monitoramento_semanal" ADD CONSTRAINT "monitoramento_semanal_chk_1" CHECK ("mns_semana" > 0);
ALTER TABLE "monitoramento_semanal" ADD CONSTRAINT "monitoramento_semanal_chk_2" CHECK ("mns_peso_medio_real" > 0);

ALTER TABLE "ocorrencia_saude" ADD CONSTRAINT "ocorrencia_saude_chk_1" CHECK ("oco_num_aves_afetadas" >= 0);

ALTER TABLE "mortalidade_descarte" ADD CONSTRAINT "mortalidade_descarte_chk_1" CHECK ("mor_quantidade" > 0);
ALTER TABLE "mortalidade_descarte" ADD CONSTRAINT "chk_mor_estorno_coerente" CHECK (
  (("mor_status_registro" = 'ATIVO') AND ("mor_estornado_em" IS NULL) AND ("mor_estornado_por" IS NULL) AND ("mor_motivo_estorno" IS NULL))
  OR (("mor_status_registro" = 'ESTORNADO') AND ("mor_estornado_em" IS NOT NULL) AND ("mor_estornado_por" IS NOT NULL) AND ("mor_motivo_estorno" IS NOT NULL))
);

ALTER TABLE "despesa_operacional" ADD CONSTRAINT "despesa_operacional_chk_1" CHECK ("dpo_valor" >= 0);
ALTER TABLE "despesa_operacional" ADD CONSTRAINT "chk_dpo_natureza_lote" CHECK (("dpo_natureza" <> 'COMPRA_INSUMO') OR ("lta_id" IS NULL));
ALTER TABLE "despesa_operacional" ADD CONSTRAINT "chk_dpo_estorno_coerente" CHECK (
  (("dpo_status_registro" = 'ATIVO') AND ("dpo_estornado_em" IS NULL) AND ("dpo_estornado_por" IS NULL) AND ("dpo_motivo_estorno" IS NULL))
  OR (("dpo_status_registro" = 'ESTORNADO') AND ("dpo_estornado_em" IS NOT NULL) AND ("dpo_estornado_por" IS NOT NULL) AND ("dpo_motivo_estorno" IS NOT NULL))
);

ALTER TABLE "meta_linhagem_semanal" ADD CONSTRAINT "meta_linhagem_semanal_chk_1" CHECK ("mls_semana" > 0);
ALTER TABLE "meta_linhagem_semanal" ADD CONSTRAINT "meta_linhagem_semanal_chk_2" CHECK (("mls_peso_meta_gramas" IS NULL) OR ("mls_peso_meta_gramas" >= 0));
ALTER TABLE "meta_linhagem_semanal" ADD CONSTRAINT "meta_linhagem_semanal_chk_3" CHECK (("mls_consumo_meta_gramas" IS NULL) OR ("mls_consumo_meta_gramas" >= 0));
ALTER TABLE "meta_linhagem_semanal" ADD CONSTRAINT "meta_linhagem_semanal_chk_4" CHECK (("mls_produtividade_meta_percentual" IS NULL) OR (("mls_produtividade_meta_percentual" >= 0) AND ("mls_produtividade_meta_percentual" <= 100)));
ALTER TABLE "meta_linhagem_semanal" ADD CONSTRAINT "meta_linhagem_semanal_chk_5" CHECK (("mls_temperatura_ideal" IS NULL) OR ("mls_temperatura_ideal" >= 0));
ALTER TABLE "meta_linhagem_semanal" ADD CONSTRAINT "meta_linhagem_semanal_chk_6" CHECK (("mls_horas_luz_dia" IS NULL) OR (("mls_horas_luz_dia" >= 0) AND ("mls_horas_luz_dia" <= 24)));

ALTER TABLE "auditoria_alteracao" ADD CONSTRAINT "chk_aud_operacao_coerente" CHECK (
  (("aud_operacao" = 'CRIACAO') AND ("aud_valores_anteriores" IS NULL))
  OR (("aud_operacao" = 'ALTERACAO') AND ("aud_valores_anteriores" IS NOT NULL))
);
ALTER TABLE "auditoria_alteracao" ADD CONSTRAINT "chk_aud_usuario_origem" CHECK (("aud_origem" <> 'USUARIO') OR ("usu_id" IS NOT NULL));

-- Views migrated from the legacy MySQL database (not tracked in schema.prisma
-- or referenced by the app yet). MySQL-only functions were rewritten for
-- PostgreSQL: curdate() -> CURRENT_DATE, to_days(a) - to_days(b) -> (a - b)
-- (date subtraction already returns an integer number of days), if(a,b,c) ->
-- CASE WHEN a THEN b ELSE c END. Divisions that mixed integer columns got an
-- explicit ::numeric cast so they keep MySQL's implicit-decimal behavior
-- instead of Postgres's integer truncation.

CREATE VIEW "vw_saldo_aves" AS
SELECT
  l.lta_id,
  l.lta_quant_inicial,
  (l.lta_quant_inicial - COALESCE(SUM(CASE WHEN m.mor_status_registro = 'ATIVO' THEN m.mor_quantidade ELSE 0 END), 0)) AS saldo_atual_aves
FROM lote_aves l
LEFT JOIN mortalidade_descarte m ON m.lta_id = l.lta_id
GROUP BY l.lta_id, l.lta_quant_inicial;

CREATE VIEW "vw_resumo_lotes_ativos" AS
SELECT
  l.lta_id,
  g.gal_nome AS galpao,
  lin.lin_nome AS linhagem,
  l.lta_data_alojamento,
  ((CURRENT_DATE - l.lta_data_alojamento) + l.lta_idade_inicial) AS idade_atual_dias,
  l.lta_fase,
  vsa.saldo_atual_aves
FROM lote_aves l
JOIN galpao g ON g.gal_id = l.gal_id
JOIN linhagem lin ON lin.lin_id = l.lin_id
JOIN vw_saldo_aves vsa ON vsa.lta_id = l.lta_id
WHERE l.lta_status = 'ATIVO';

CREATE VIEW "vw_kpi_lote" AS
SELECT
  l.lta_id,
  vsa.saldo_atual_aves,
  COALESCE((SELECT SUM(m.mor_quantidade) FROM mortalidade_descarte m WHERE m.lta_id = l.lta_id AND m.mor_tipo = 'MORTALIDADE' AND m.mor_status_registro = 'ATIVO'), 0) AS total_mortos,
  COALESCE((SELECT SUM(m.mor_quantidade) FROM mortalidade_descarte m WHERE m.lta_id = l.lta_id AND m.mor_tipo = 'DESCARTE' AND m.mor_status_registro = 'ATIVO'), 0) AS total_descartados,
  ROUND((COALESCE((SELECT SUM(m.mor_quantidade) FROM mortalidade_descarte m WHERE m.lta_id = l.lta_id AND m.mor_tipo = 'MORTALIDADE' AND m.mor_status_registro = 'ATIVO'), 0)::numeric / l.lta_quant_inicial) * 100, 2) AS taxa_mortalidade_percentual,
  ROUND((COALESCE((SELECT SUM(m.mor_quantidade) FROM mortalidade_descarte m WHERE m.lta_id = l.lta_id AND m.mor_tipo = 'DESCARTE' AND m.mor_status_registro = 'ATIVO'), 0)::numeric / l.lta_quant_inicial) * 100, 2) AS taxa_descarte_percentual,
  ROUND(((l.lta_quant_inicial - vsa.saldo_atual_aves)::numeric / l.lta_quant_inicial) * 100, 2) AS taxa_perdas_totais,
  COALESCE((SELECT SUM(mvo.mvo_quantidade) FROM movimento_ovo mvo JOIN lote_estoque_ovo leo ON leo.leo_id = mvo.leo_id WHERE leo.lta_id = l.lta_id AND mvo.mvo_tipo_movimento = 'COLETA' AND mvo.mvo_status_registro = 'ATIVO'), 0) AS total_ovos_produzidos
FROM lote_aves l
JOIN vw_saldo_aves vsa ON vsa.lta_id = l.lta_id;

CREATE VIEW "vw_kpi_financeiro_zootecnico_lote" AS
SELECT
  l.lta_id,
  kl.total_ovos_produzidos,
  COALESCE((SELECT SUM(mvi.mvi_quantidade) FROM movimento_insumo mvi JOIN lote_estoque_insumo lei ON lei.lei_id = mvi.lei_id JOIN insumo i ON i.ins_id = lei.ins_id JOIN categoria_insumo ci ON ci.cti_id = i.cti_id WHERE mvi.lta_id = l.lta_id AND mvi.mvi_tipo_movimentacao = 'SAIDA' AND mvi.mvi_status_registro = 'ATIVO' AND ci.cti_tipo = 'RACAO'), 0) AS total_racao_consumida_kg,
  COALESCE((SELECT SUM(mvi.mvi_quantidade * mvi.mvi_valor_unitario) FROM movimento_insumo mvi WHERE mvi.lta_id = l.lta_id AND mvi.mvi_tipo_movimentacao = 'SAIDA' AND mvi.mvi_status_registro = 'ATIVO'), 0) AS custo_total_insumos,
  COALESCE((SELECT SUM(dpo.dpo_valor) FROM despesa_operacional dpo WHERE dpo.lta_id = l.lta_id AND dpo.dpo_status_registro = 'ATIVO' AND dpo.dpo_natureza = 'OPERACIONAL'), 0) AS total_despesas_operacionais,
  ROUND(CASE WHEN kl.total_ovos_produzidos > 0 THEN
    (COALESCE((SELECT SUM(mvi.mvi_quantidade) FROM movimento_insumo mvi JOIN lote_estoque_insumo lei ON lei.lei_id = mvi.lei_id JOIN insumo i ON i.ins_id = lei.ins_id JOIN categoria_insumo ci ON ci.cti_id = i.cti_id WHERE mvi.lta_id = l.lta_id AND mvi.mvi_tipo_movimentacao = 'SAIDA' AND mvi.mvi_status_registro = 'ATIVO' AND ci.cti_tipo = 'RACAO'), 0) * 12)::numeric / kl.total_ovos_produzidos
  ELSE 0 END, 4) AS conversao_alimentar_por_duzia,
  ROUND(CASE WHEN kl.total_ovos_produzidos > 0 THEN
    (COALESCE((SELECT SUM(mvi.mvi_quantidade * mvi.mvi_valor_unitario) FROM movimento_insumo mvi WHERE mvi.lta_id = l.lta_id AND mvi.mvi_tipo_movimentacao = 'SAIDA' AND mvi.mvi_status_registro = 'ATIVO'), 0) + COALESCE((SELECT SUM(dpo.dpo_valor) FROM despesa_operacional dpo WHERE dpo.lta_id = l.lta_id AND dpo.dpo_status_registro = 'ATIVO' AND dpo.dpo_natureza = 'OPERACIONAL'), 0))::numeric / kl.total_ovos_produzidos
  ELSE 0 END, 2) AS custo_unitario_producao_cu
FROM lote_aves l
JOIN vw_kpi_lote kl ON kl.lta_id = l.lta_id;

CREATE VIEW "vw_fluxo_caixa" AS
SELECT 'RECEITA' AS tipo_movimento, rcv_data AS data_movimento, rcv_categoria::text AS categoria, rcv_descricao AS descricao, rcv_valor_total AS valor_operacao
FROM receita_venda WHERE rcv_status_registro = 'ATIVO'
UNION ALL
SELECT 'DESPESA', dpo_data, dpo_categoria, dpo_descricao, -dpo_valor
FROM despesa_operacional WHERE dpo_status_registro = 'ATIVO';

CREATE VIEW "vw_estoque_ovos" AS
SELECT
  leo.leo_id,
  leo.lta_id,
  t.tov_id,
  t.tov_nome,
  leo.leo_data_coleta,
  leo.leo_data_validade,
  COALESCE(SUM(CASE
    WHEN m.mvo_status_registro = 'ATIVO' AND m.mvo_tipo_movimento = 'COLETA' THEN m.mvo_quantidade
    WHEN m.mvo_status_registro = 'ATIVO' AND m.mvo_tipo_movimento IN ('VENDA', 'PERDA', 'DESCARTE') THEN -m.mvo_quantidade
    ELSE 0 END), 0) AS estoque_real
FROM lote_estoque_ovo leo
JOIN lote_aves l ON l.lta_id = leo.lta_id
JOIN linhagem lin ON lin.lin_id = l.lin_id
JOIN tipo_ovo t ON t.tov_id = lin.tov_id
LEFT JOIN movimento_ovo m ON m.leo_id = leo.leo_id
GROUP BY leo.leo_id, leo.lta_id, t.tov_id, t.tov_nome, leo.leo_data_coleta, leo.leo_data_validade;

CREATE VIEW "vw_estoque_insumos_por_lote" AS
SELECT
  lei.lei_id,
  lei.ins_id,
  i.ins_nome,
  lei.for_id,
  lei.lei_lote_fabricante,
  lei.lei_data_entrada,
  lei.lei_data_validade,
  COALESCE(SUM(CASE
    WHEN m.mvi_status_registro = 'ATIVO' AND m.mvi_tipo_movimentacao = 'ENTRADA' THEN m.mvi_quantidade
    WHEN m.mvi_status_registro = 'ATIVO' AND m.mvi_tipo_movimentacao = 'SAIDA' THEN -m.mvi_quantidade
    ELSE 0 END), 0) AS estoque_real
FROM lote_estoque_insumo lei
JOIN insumo i ON i.ins_id = lei.ins_id
LEFT JOIN movimento_insumo m ON m.lei_id = lei.lei_id
GROUP BY lei.lei_id, lei.ins_id, i.ins_nome, lei.for_id, lei.lei_lote_fabricante, lei.lei_data_entrada, lei.lei_data_validade;

CREATE VIEW "vw_estoque_insumos" AS
SELECT
  i.ins_id,
  i.ins_nome,
  COALESCE(SUM(CASE
    WHEN m.mvi_status_registro = 'ATIVO' AND m.mvi_tipo_movimentacao = 'ENTRADA' THEN m.mvi_quantidade
    WHEN m.mvi_status_registro = 'ATIVO' AND m.mvi_tipo_movimentacao = 'SAIDA' THEN -m.mvi_quantidade
    ELSE 0 END), 0) AS estoque_real
FROM insumo i
LEFT JOIN lote_estoque_insumo lei ON lei.ins_id = i.ins_id
LEFT JOIN movimento_insumo m ON m.lei_id = lei.lei_id
GROUP BY i.ins_id, i.ins_nome;

CREATE VIEW "vw_detalhe_tarefa_insumo" AS
SELECT
  t.tal_id,
  t.tal_tarefa,
  t.tal_status,
  t.tal_data_prevista,
  t.tal_data_realizacao,
  t.tal_observacao,
  l.lta_id,
  l.lta_fase AS fase_lote,
  l.lta_status AS status_lote,
  g.gal_nome,
  lin.lin_nome AS linhagem,
  ca.cta_descricao AS agenda,
  u.usu_nome AS responsavel,
  i.ins_id,
  i.ins_nome,
  ci.cti_tipo AS tipo_insumo,
  i.ins_composicao,
  i.ins_fase_aplicacao,
  i.ins_dias_carencia,
  COALESCE(e.estoque_real, 0) AS estoque_real
FROM tarefa_lote t
JOIN lote_aves l ON l.lta_id = t.lta_id
JOIN galpao g ON g.gal_id = l.gal_id
JOIN linhagem lin ON lin.lin_id = l.lin_id
JOIN categoria_agenda ca ON ca.cta_id = t.cta_id
LEFT JOIN usuario u ON u.usu_id = t.usu_id
LEFT JOIN tarefa_lote_insumo tli ON tli.tal_id = t.tal_id
LEFT JOIN insumo i ON i.ins_id = tli.ins_id
LEFT JOIN categoria_insumo ci ON ci.cti_id = i.cti_id
LEFT JOIN vw_estoque_insumos e ON e.ins_id = i.ins_id;

CREATE VIEW "vw_alertas_estoque" AS
SELECT
  i.ins_id,
  i.ins_nome,
  COALESCE(e.estoque_real, 0) AS estoque_real,
  i.ins_ponto_ressuprimento,
  CASE
    WHEN COALESCE(e.estoque_real, 0) = 0 THEN 'CRÍTICO: ESTOQUE ZERADO'
    WHEN COALESCE(e.estoque_real, 0) <= i.ins_ponto_ressuprimento THEN 'ALERTA: NECESSITA COMPRA'
    ELSE 'NORMAL'
  END AS status_alerta
FROM insumo i
LEFT JOIN vw_estoque_insumos e ON e.ins_id = i.ins_id
WHERE i.ins_status = 'ATIVO' AND COALESCE(e.estoque_real, 0) <= i.ins_ponto_ressuprimento;

CREATE VIEW "vw_agenda_tarefas_pendentes" AS
SELECT
  t.tal_id,
  l.lta_id,
  g.gal_nome AS galpao,
  ca.cta_descricao AS categoria,
  t.tal_tarefa AS tarefa,
  t.tal_data_prevista,
  CASE WHEN t.tal_status = 'PENDENTE' AND t.tal_data_prevista < CURRENT_DATE THEN 'ATRASADO' ELSE 'PENDENTE' END AS status_exibicao,
  (t.tal_data_prevista - CURRENT_DATE) AS dias_para_vencer
FROM tarefa_lote t
JOIN lote_aves l ON l.lta_id = t.lta_id
JOIN galpao g ON g.gal_id = l.gal_id
JOIN categoria_agenda ca ON ca.cta_id = t.cta_id
WHERE t.tal_status = 'PENDENTE'
ORDER BY t.tal_data_prevista;
