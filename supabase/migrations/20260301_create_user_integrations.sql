-- =====================================================
-- Sprint 3 — Etapa Google Calendar
-- Migration: create_user_integrations
-- Data: 2026-03-01
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_integrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider        TEXT NOT NULL CHECK (provider IN ('google_calendar')),
    access_token    TEXT,
    refresh_token   TEXT,
    expires_at      TIMESTAMPTZ,
    config          JSONB DEFAULT '{}'::jsonb,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_integrations_unique UNIQUE (user_id, provider)
);

COMMENT ON TABLE  public.user_integrations IS 'Integrações externas vinculadas ao usuário (ex: Google Calendar)';

-- Trigger
CREATE TRIGGER set_updated_at_user_integrations BEFORE UPDATE ON public.user_integrations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_integrations_select ON public.user_integrations FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY user_integrations_insert ON public.user_integrations FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY user_integrations_update ON public.user_integrations FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY user_integrations_delete ON public.user_integrations FOR DELETE TO authenticated
    USING (user_id = auth.uid());
