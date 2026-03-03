-- =====================================================
-- Sprint 3 — Etapa 9: Auth & Clientes
-- Migration: create_users_customers_tags
-- Data: 2026-03-01
-- Autor: Dara (Data Engineer)
-- =====================================================

-- =========================
-- 1. TABELA: users (perfis)
-- =========================
-- Vinculada 1:1 ao auth.users do Supabase Auth.
-- Armazena perfil público e papel (role) do usuário.

CREATE TABLE IF NOT EXISTS public.users (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    avatar_url      TEXT,
    role            TEXT NOT NULL DEFAULT 'seller'
                    CHECK (role IN ('owner', 'manager', 'seller')),
    phone           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.users IS 'Perfis de usuários do painel interno (1:1 com auth.users)';
COMMENT ON COLUMN public.users.role IS 'Papel: owner (acesso total), manager (tudo exceto config), seller (operacional)';

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active) WHERE is_active = TRUE;

-- ================================
-- 2. TABELA: customer_tags (tags)
-- ================================
CREATE TABLE IF NOT EXISTS public.customer_tags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    color           TEXT NOT NULL DEFAULT '#ff4d00',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT customer_tags_name_unique UNIQUE (name)
);

COMMENT ON TABLE public.customer_tags IS 'Tags customizáveis para segmentação de clientes';

-- ================================
-- 3. TABELA: customers (clientes)
-- ================================
CREATE TABLE IF NOT EXISTS public.customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       TEXT NOT NULL,
    phone           TEXT,
    email           TEXT,
    cpf             TEXT,
    notes           TEXT,
    source          TEXT DEFAULT 'manual'
                    CHECK (source IN ('manual', 'whatsapp', 'website', 'referral')),
    assigned_to     UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE  public.customers IS 'Clientes da loja de veículos';
COMMENT ON COLUMN public.customers.source IS 'Origem: manual, whatsapp, website ou referral';
COMMENT ON COLUMN public.customers.assigned_to IS 'Vendedor responsável pelo cliente';

CREATE INDEX IF NOT EXISTS idx_customers_assigned_to ON public.customers(assigned_to);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_source ON public.customers(source);
CREATE INDEX IF NOT EXISTS idx_customers_not_deleted ON public.customers(id) WHERE deleted_at IS NULL;

-- ==========================================
-- 4. TABELA: customer_tag_links (N:N)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customer_tag_links (
    customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES public.customer_tags(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (customer_id, tag_id)
);

COMMENT ON TABLE public.customer_tag_links IS 'Relacionamento N:N entre clientes e tags';
CREATE INDEX IF NOT EXISTS idx_tag_links_tag_id ON public.customer_tag_links(tag_id);

-- ==========================================
-- 5. TABELA: customer_interests
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customer_interests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    vehicle_id      UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT customer_interests_unique UNIQUE (customer_id, vehicle_id)
);

COMMENT ON TABLE public.customer_interests IS 'Veículos que o cliente demonstrou interesse';
CREATE INDEX IF NOT EXISTS idx_interests_customer ON public.customer_interests(customer_id);
CREATE INDEX IF NOT EXISTS idx_interests_vehicle ON public.customer_interests(vehicle_id);

-- ==========================================
-- 6. TRIGGER: updated_at automático
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_users ON public.users;
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_customer_tags ON public.customer_tags;
CREATE TRIGGER set_updated_at_customer_tags BEFORE UPDATE ON public.customer_tags FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_customers ON public.customers;
CREATE TRIGGER set_updated_at_customers BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- 7. RLS POLICIES
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tag_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interests ENABLE ROW LEVEL SECURITY;

-- Helper: busca o papel do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- users
CREATE POLICY users_select ON public.users FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY users_update_self ON public.users FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY users_insert_owner ON public.users FOR INSERT TO authenticated WITH CHECK (public.get_user_role() = 'owner');
CREATE POLICY users_delete_owner ON public.users FOR DELETE TO authenticated USING (public.get_user_role() = 'owner');

-- customer_tags
CREATE POLICY tags_select ON public.customer_tags FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY tags_manage ON public.customer_tags FOR ALL TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager'))
    WITH CHECK (public.get_user_role() IN ('owner', 'manager'));

-- customers
CREATE POLICY customers_select ON public.customers FOR SELECT TO authenticated
    USING (deleted_at IS NULL AND (public.get_user_role() IN ('owner', 'manager') OR assigned_to = auth.uid()));
CREATE POLICY customers_manage ON public.customers FOR ALL TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager') OR assigned_to = auth.uid())
    WITH CHECK (public.get_user_role() IN ('owner', 'manager') OR assigned_to = auth.uid());

-- customer_tag_links
CREATE POLICY tag_links_select ON public.customer_tag_links FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY tag_links_manage ON public.customer_tag_links FOR ALL TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager'))
    WITH CHECK (public.get_user_role() IN ('owner', 'manager'));

-- customer_interests
CREATE POLICY interests_select ON public.customer_interests FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY interests_manage ON public.customer_interests FOR ALL TO authenticated
    USING (public.get_user_role() IN ('owner', 'manager') OR EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.assigned_to = auth.uid()))
    WITH CHECK (public.get_user_role() IN ('owner', 'manager') OR EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.assigned_to = auth.uid()));

-- ==========================================
-- 8. TRIGGER: Criar perfil ao signup
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        NEW.raw_user_meta_data ->> 'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 9. SEED: Tags padrão
-- ==========================================
INSERT INTO public.customer_tags (name, color) VALUES
    ('Lead Quente', '#ef4444'),
    ('Lead Frio', '#3b82f6'),
    ('Quer SUV', '#22c55e'),
    ('Quer Sedan', '#a855f7'),
    ('Troca', '#f59e0b'),
    ('Financiamento', '#06b6d4'),
    ('À Vista', '#10b981'),
    ('Retorno', '#6366f1')
ON CONFLICT (name) DO NOTHING;
