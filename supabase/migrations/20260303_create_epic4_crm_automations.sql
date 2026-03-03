-- =====================================================
-- Epic 4 — CRM, Gatilhos e Área do Cliente
-- Migration: create_epic4_crm_automations
-- Data: 2026-03-03
-- =====================================================

-- ==========================================
-- 1. TABELA: deal_stages (Estágios do Kanban)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.deal_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#cbd5e1',
    "order" INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.deal_stages IS 'Colunas do funil de vendas (Kanban)';

-- ==========================================
-- 2. TABELA: deals (Oportunidades de Venda)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    stage_id UUID NOT NULL REFERENCES public.deal_stages(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    amount NUMERIC,
    expected_close_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.deals IS 'Oportunidades de negócio no funil';
CREATE INDEX IF NOT EXISTS idx_deals_customer ON public.deals(customer_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_user ON public.deals(user_id);

-- ==========================================
-- 3. TABELA: customer_preferences (Match Perfeito)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    brand TEXT,
    model TEXT,
    max_price NUMERIC,
    color TEXT,
    body_type TEXT,
    transmission TEXT,
    min_year INTEGER,
    max_year INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.customer_preferences IS 'Preferências genéricas do cliente para automação de Match Perfeito';
CREATE INDEX IF NOT EXISTS idx_cust_pref_customer ON public.customer_preferences(customer_id);
CREATE INDEX IF NOT EXISTS idx_cust_pref_active ON public.customer_preferences(is_active) WHERE is_active = TRUE;

-- ==========================================
-- 4. TABELA: activities (Follow-ups/Tarefas)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('call', 'meeting', 'email', 'whatsapp', 'task')),
    title TEXT NOT NULL,
    notes TEXT,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.activities IS 'Log de tarefas e reuniões agendadas pelos vendedores';
CREATE INDEX IF NOT EXISTS idx_activities_deal ON public.activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_customer ON public.activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.activities(user_id);

-- ==========================================
-- 5. TRIGGERS: updated_at
-- ==========================================
DROP TRIGGER IF EXISTS set_updated_at_deals ON public.deals;
CREATE TRIGGER set_updated_at_deals BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_customer_preferences ON public.customer_preferences;
CREATE TRIGGER set_updated_at_customer_preferences BEFORE UPDATE ON public.customer_preferences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 6. RLS POLICIES
-- ==========================================
ALTER TABLE public.deal_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- deal_stages
CREATE POLICY deal_stages_select ON public.deal_stages FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY deal_stages_manage ON public.deal_stages FOR ALL TO authenticated USING (public.get_user_role() IN ('owner', 'manager'));

-- deals
CREATE POLICY deals_select ON public.deals FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'manager') OR user_id = auth.uid());
CREATE POLICY deals_manage ON public.deals FOR ALL TO authenticated USING (public.get_user_role() IN ('owner', 'manager') OR user_id = auth.uid());

-- customer_preferences
CREATE POLICY preferences_select ON public.customer_preferences FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY preferences_manage ON public.customer_preferences FOR ALL TO authenticated USING (public.get_user_role() IN ('owner', 'manager') OR EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.assigned_to = auth.uid()));

-- activities
CREATE POLICY activities_select ON public.activities FOR SELECT TO authenticated USING (public.get_user_role() IN ('owner', 'manager') OR user_id = auth.uid());
CREATE POLICY activities_manage ON public.activities FOR ALL TO authenticated USING (public.get_user_role() IN ('owner', 'manager') OR user_id = auth.uid());

-- ==========================================
-- 7. SEED: Estágios Padrão
-- ==========================================
INSERT INTO public.deal_stages (name, color, "order") VALUES 
('Lead Novo', '#3b82f6', 1), -- blue
('Em Atendimento', '#eab308', 2), -- yellow
('Negociação', '#f97316', 3), -- orange
('Aguardando Financiamento', '#a855f7', 4), -- purple
('Ganha', '#22c55e', 5), -- green
('Perdida', '#ef4444', 6); -- red
