-- =====================================================
-- Sprint 3 — Etapa 13: Tabelas Complementares
-- Migration: create_appointments_holidays_offers_push
-- Data: 2026-03-01
-- Autor: Dara (Data Engineer)
-- =====================================================

-- =========================
-- 1. TABELA: holidays
-- =========================
-- Feriados e dias de fechamento configuráveis pelo dono.
-- Usados para bloquear agendamentos automáticos.

CREATE TABLE IF NOT EXISTS public.holidays (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    date            DATE NOT NULL,
    recurring       BOOLEAN NOT NULL DEFAULT FALSE,
    created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT holidays_date_unique UNIQUE (date)
);

COMMENT ON TABLE  public.holidays IS 'Feriados e dias de fechamento da loja';
COMMENT ON COLUMN public.holidays.recurring IS 'Se TRUE, repete todo ano (ex: Natal)';

CREATE INDEX IF NOT EXISTS idx_holidays_date ON public.holidays(date);

-- =========================
-- 2. TABELA: appointments
-- =========================
-- Agendamentos de visitas de clientes à loja.

CREATE TABLE IF NOT EXISTS public.appointments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    vehicle_id      UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    seller_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    scheduled_at    TIMESTAMPTZ NOT NULL,
    duration_min    INTEGER NOT NULL DEFAULT 30
                    CHECK (duration_min > 0 AND duration_min <= 480),
    status          TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.appointments IS 'Agendamentos de visitas à loja';
COMMENT ON COLUMN public.appointments.status IS 'scheduled, confirmed, completed, cancelled, no_show';
COMMENT ON COLUMN public.appointments.duration_min IS 'Duração em minutos (1-480)';

CREATE INDEX IF NOT EXISTS idx_appointments_customer ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vehicle ON public.appointments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_appointments_seller ON public.appointments(seller_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status) WHERE status IN ('scheduled', 'confirmed');

-- =========================
-- 3. TABELA: vehicle_offers
-- =========================
-- Propostas de venda de veículos enviadas pelo site público
-- ("/venda-seu-veiculo"). Gerenciadas internamente pelo painel.
-- DROP + CREATE para garantir schema correto (tabela nova, sem dados).

DROP TABLE IF EXISTS public.vehicle_offers CASCADE;

CREATE TABLE public.vehicle_offers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    phone           TEXT NOT NULL,
    email           TEXT,
    brand           TEXT NOT NULL,
    model           TEXT NOT NULL,
    year            INTEGER NOT NULL,
    mileage         INTEGER,
    desired_price   NUMERIC(12,2),
    notes           TEXT,
    photo_urls      TEXT[] DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'reviewing', 'accepted', 'rejected', 'contacted')),
    reviewed_by     UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at     TIMESTAMPTZ,
    lgpd_consent    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.vehicle_offers IS 'Propostas de venda recebidas do formulário público';
COMMENT ON COLUMN public.vehicle_offers.status IS 'new, reviewing, accepted, rejected, contacted';
COMMENT ON COLUMN public.vehicle_offers.lgpd_consent IS 'Consentimento LGPD obrigatório';

CREATE INDEX IF NOT EXISTS idx_offers_status ON public.vehicle_offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_phone ON public.vehicle_offers(phone);
CREATE INDEX IF NOT EXISTS idx_offers_created ON public.vehicle_offers(created_at DESC);

-- ================================
-- 4. TABELA: push_subscriptions
-- ================================
-- Inscrições para notificações push (PWA Service Worker).
-- Vinculado ao usuário do painel.

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    endpoint        TEXT NOT NULL,
    p256dh          TEXT NOT NULL,
    auth_key        TEXT NOT NULL,
    device_info     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT push_sub_endpoint_unique UNIQUE (endpoint)
);

COMMENT ON TABLE  public.push_subscriptions IS 'Inscrições push (PWA) por dispositivo';
COMMENT ON COLUMN public.push_subscriptions.p256dh IS 'Chave pública VAPID p256dh';
COMMENT ON COLUMN public.push_subscriptions.auth_key IS 'Chave de autenticação push';

CREATE INDEX IF NOT EXISTS idx_push_user ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_active ON public.push_subscriptions(is_active) WHERE is_active = TRUE;

-- ==========================================
-- 5. TRIGGERS: updated_at automático
-- ==========================================
-- Reutiliza a function handle_updated_at() já criada na migração anterior.

DROP TRIGGER IF EXISTS set_updated_at_holidays ON public.holidays;
CREATE TRIGGER set_updated_at_holidays BEFORE UPDATE ON public.holidays FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_appointments ON public.appointments;
CREATE TRIGGER set_updated_at_appointments BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_vehicle_offers ON public.vehicle_offers;
CREATE TRIGGER set_updated_at_vehicle_offers BEFORE UPDATE ON public.vehicle_offers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_push_subscriptions ON public.push_subscriptions;
CREATE TRIGGER set_updated_at_push_subscriptions BEFORE UPDATE ON public.push_subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 6. RLS POLICIES
-- ==========================================

ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ---- holidays ----
DROP POLICY IF EXISTS holidays_select ON public.holidays;
CREATE POLICY holidays_select ON public.holidays FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS holidays_manage ON public.holidays;
CREATE POLICY holidays_manage ON public.holidays FOR ALL TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager'))
    WITH CHECK (public.get_user_role() IN ('owner', 'manager'));

-- ---- appointments ----
DROP POLICY IF EXISTS appointments_select ON public.appointments;
CREATE POLICY appointments_select ON public.appointments FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager') OR seller_id = auth.uid());

DROP POLICY IF EXISTS appointments_insert ON public.appointments;
CREATE POLICY appointments_insert ON public.appointments FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('owner', 'manager') OR seller_id = auth.uid());

DROP POLICY IF EXISTS appointments_update ON public.appointments;
CREATE POLICY appointments_update ON public.appointments FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager') OR seller_id = auth.uid())
    WITH CHECK (public.get_user_role() IN ('owner', 'manager') OR seller_id = auth.uid());

DROP POLICY IF EXISTS appointments_delete ON public.appointments;
CREATE POLICY appointments_delete ON public.appointments FOR DELETE TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager'));

-- ---- vehicle_offers ----
-- Qualquer autenticado pode ler; anônimos podem inserir (formulário público).
-- Gerenciamento (update/delete) restrito a owner/manager.
DROP POLICY IF EXISTS offers_select ON public.vehicle_offers;
CREATE POLICY offers_select ON public.vehicle_offers FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS offers_insert_anon ON public.vehicle_offers;
CREATE POLICY offers_insert_anon ON public.vehicle_offers FOR INSERT TO anon
    WITH CHECK (lgpd_consent = TRUE);

DROP POLICY IF EXISTS offers_insert_auth ON public.vehicle_offers;
CREATE POLICY offers_insert_auth ON public.vehicle_offers FOR INSERT TO authenticated
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS offers_manage ON public.vehicle_offers;
CREATE POLICY offers_manage ON public.vehicle_offers FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager'))
    WITH CHECK (public.get_user_role() IN ('owner', 'manager'));

DROP POLICY IF EXISTS offers_delete ON public.vehicle_offers;
CREATE POLICY offers_delete ON public.vehicle_offers FOR DELETE TO authenticated
    USING (public.get_user_role() = 'owner');

-- ---- push_subscriptions ----
-- Cada usuário gerencia apenas as próprias inscrições.
DROP POLICY IF EXISTS push_select_own ON public.push_subscriptions;
CREATE POLICY push_select_own ON public.push_subscriptions FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS push_insert_own ON public.push_subscriptions;
CREATE POLICY push_insert_own ON public.push_subscriptions FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS push_update_own ON public.push_subscriptions;
CREATE POLICY push_update_own ON public.push_subscriptions FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS push_delete_own ON public.push_subscriptions;
CREATE POLICY push_delete_own ON public.push_subscriptions FOR DELETE TO authenticated
    USING (user_id = auth.uid());
