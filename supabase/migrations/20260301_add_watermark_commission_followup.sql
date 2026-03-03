-- =====================================================
-- Migration: add_watermark_commission_followup
-- Data: 2026-03-01
-- Adiciona colunas de Marca d'água e Comissões ao store_settings
-- e tabelas de Follow-Up & Marketing (E4)
-- =====================================================

-- ===========================
-- 1. COLUNAS: Marca d'água
-- ===========================
ALTER TABLE public.store_settings
    ADD COLUMN IF NOT EXISTS watermark_type TEXT DEFAULT 'none' CHECK (watermark_type IN ('none', 'text', 'image')),
    ADD COLUMN IF NOT EXISTS watermark_text TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS watermark_image_url TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS watermark_size INTEGER DEFAULT 20,
    ADD COLUMN IF NOT EXISTS watermark_opacity INTEGER DEFAULT 50,
    ADD COLUMN IF NOT EXISTS watermark_position TEXT DEFAULT 'bottom-right';

-- ===========================
-- 2. COLUNAS: Comissões
-- ===========================
ALTER TABLE public.store_settings
    ADD COLUMN IF NOT EXISTS commission_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
    ADD COLUMN IF NOT EXISTS commission_value NUMERIC(12,2) DEFAULT 0;

-- ===========================
-- 3. TABELA: followup_cadences
-- ===========================
-- Templates de cadência de follow-up (ex: "Pós-visita", "Lead frio")
CREATE TABLE IF NOT EXISTS public.followup_cadences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    steps           JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- steps: [{ day: 1, channel: 'whatsapp', template: '...' }, ...]
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.followup_cadences IS 'Templates de cadência de follow-up automatizado';
COMMENT ON COLUMN public.followup_cadences.steps IS 'Array JSON com os passos da cadência: dia, canal, template de mensagem';

-- ===========================
-- 4. TABELA: followup_enrollments
-- ===========================
-- Inscrições de clientes em cadências (controle de execução)
CREATE TABLE IF NOT EXISTS public.followup_enrollments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cadence_id      UUID NOT NULL REFERENCES public.followup_cadences(id) ON DELETE CASCADE,
    customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    seller_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
    current_step    INTEGER NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    next_action_at  TIMESTAMPTZ,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.followup_enrollments IS 'Clientes inscritos em cadências de follow-up';

CREATE INDEX IF NOT EXISTS idx_followup_enroll_cadence ON public.followup_enrollments(cadence_id);
CREATE INDEX IF NOT EXISTS idx_followup_enroll_customer ON public.followup_enrollments(customer_id);
CREATE INDEX IF NOT EXISTS idx_followup_enroll_status ON public.followup_enrollments(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_followup_enroll_next ON public.followup_enrollments(next_action_at) WHERE status = 'active';

-- ===========================
-- 5. TABELA: followup_tasks
-- ===========================
-- Fila de follow-ups manuais para vendedores
CREATE TABLE IF NOT EXISTS public.followup_tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    seller_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
    enrollment_id   UUID REFERENCES public.followup_enrollments(id) ON DELETE SET NULL,
    type            TEXT NOT NULL DEFAULT 'manual'
                    CHECK (type IN ('manual', 'auto_cadence', 'reminder')),
    channel         TEXT NOT NULL DEFAULT 'whatsapp'
                    CHECK (channel IN ('whatsapp', 'email', 'phone', 'sms')),
    message         TEXT,
    scheduled_at    TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.followup_tasks IS 'Fila de tarefas de follow-up (automáticas ou manuais)';

CREATE INDEX IF NOT EXISTS idx_followup_tasks_seller ON public.followup_tasks(seller_id);
CREATE INDEX IF NOT EXISTS idx_followup_tasks_status ON public.followup_tasks(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_followup_tasks_scheduled ON public.followup_tasks(scheduled_at) WHERE status = 'pending';

-- ===========================
-- 6. TABELA: campaigns
-- ===========================
-- Campanhas de marketing em massa
CREATE TABLE IF NOT EXISTS public.campaigns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    channel         TEXT NOT NULL DEFAULT 'whatsapp'
                    CHECK (channel IN ('whatsapp', 'email', 'sms')),
    message_template TEXT NOT NULL,
    target_filter   JSONB DEFAULT '{}'::jsonb,
    -- target_filter: { tags: ['Lead Quente'], interests: ['SUV'] }
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
    scheduled_at    TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    total_recipients INTEGER DEFAULT 0,
    total_sent      INTEGER DEFAULT 0,
    total_delivered  INTEGER DEFAULT 0,
    total_read      INTEGER DEFAULT 0,
    total_failed    INTEGER DEFAULT 0,
    created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.campaigns IS 'Campanhas de marketing em massa (WhatsApp/Email/SMS)';

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created ON public.campaigns(created_at DESC);

-- ===========================
-- 7. TABELA: campaign_recipients
-- ===========================
CREATE TABLE IF NOT EXISTS public.campaign_recipients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    sent_at         TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    read_at         TIMESTAMPTZ,
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camp_recip_campaign ON public.campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_camp_recip_customer ON public.campaign_recipients(customer_id);
CREATE INDEX IF NOT EXISTS idx_camp_recip_status ON public.campaign_recipients(status);

-- ===========================
-- 8. TRIGGERS updated_at
-- ===========================
CREATE TRIGGER set_updated_at_followup_cadences BEFORE UPDATE ON public.followup_cadences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_followup_enrollments BEFORE UPDATE ON public.followup_enrollments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_followup_tasks BEFORE UPDATE ON public.followup_tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_campaigns BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===========================
-- 9. RLS POLICIES
-- ===========================
ALTER TABLE public.followup_cadences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

-- cadences: todos autenticados leem, owner/manager gerenciam
CREATE POLICY cadences_select ON public.followup_cadences FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY cadences_manage ON public.followup_cadences FOR ALL TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager'))
    WITH CHECK (public.get_user_role() IN ('owner', 'manager'));

-- enrollments: owner/manager veem todas, seller vê as próprias
CREATE POLICY enrollments_select ON public.followup_enrollments FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager') OR seller_id = auth.uid());
CREATE POLICY enrollments_manage ON public.followup_enrollments FOR ALL TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager'))
    WITH CHECK (public.get_user_role() IN ('owner', 'manager'));

-- tasks: seller vê/gerencia as próprias, owner/manager veem todas
CREATE POLICY tasks_select ON public.followup_tasks FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager') OR seller_id = auth.uid());
CREATE POLICY tasks_insert ON public.followup_tasks FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('owner', 'manager') OR seller_id = auth.uid());
CREATE POLICY tasks_update ON public.followup_tasks FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager') OR seller_id = auth.uid());

-- campaigns: owner/manager gerenciam
CREATE POLICY campaigns_select ON public.campaigns FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY campaigns_manage ON public.campaigns FOR ALL TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager'))
    WITH CHECK (public.get_user_role() IN ('owner', 'manager'));

-- campaign_recipients: owner/manager gerenciam
CREATE POLICY camp_recip_select ON public.campaign_recipients FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY camp_recip_manage ON public.campaign_recipients FOR ALL TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager'))
    WITH CHECK (public.get_user_role() IN ('owner', 'manager'));
