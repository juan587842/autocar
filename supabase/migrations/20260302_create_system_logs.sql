-- =====================================================
-- Migration: create_system_logs
-- Data: 2026-03-02
-- Epic 5: Criação nativa de tracking / Log de atividades
-- =====================================================

CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.system_logs IS 'Trilha de auditoria das ações críticas no estoque e negócio';

-- Índices para facilitar busca no painel
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_target ON public.system_logs(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user ON public.system_logs(user_id);

-- RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Somente leitura, baseada em papel. Owner e Manager podem ver tudo. Seller vê suas ações (ou nem vê, mas se tiver a view vamos deixar todos verem ou os managers verem tudo)
CREATE POLICY logs_select ON public.system_logs 
    FOR SELECT TO authenticated 
    USING (public.get_user_role() IN ('owner', 'manager') OR user_id = auth.uid());

-- Inserção é feita pelas triggers primariamente, mas vamos liberar insert authenticated caso o backend Next.js precise logar algo manual
CREATE POLICY logs_insert ON public.system_logs 
    FOR INSERT TO authenticated 
    WITH CHECK (TRUE);

-- Trigger Function Genérica para Logs
CREATE OR REPLACE FUNCTION public.log_table_changes()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    action_type TEXT;
    details_json JSONB;
BEGIN
    current_user_id := auth.uid();
    
    IF TG_OP = 'INSERT' THEN
        action_type := 'CREATED';
        details_json := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'UPDATED';
        details_json := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'DELETED';
        details_json := to_jsonb(OLD);
    END IF;

    INSERT INTO public.system_logs (user_id, action, target_table, target_id, details)
    VALUES (
        current_user_id, 
        action_type, 
        TG_TABLE_NAME, 
        COALESCE(NEW.id, OLD.id), 
        details_json
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atachando Triggers
DROP TRIGGER IF EXISTS log_vehicles_changes ON public.vehicles;
CREATE TRIGGER log_vehicles_changes
AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

DROP TRIGGER IF EXISTS log_conversations_changes ON public.conversations;
CREATE TRIGGER log_conversations_changes
AFTER INSERT OR UPDATE OR DELETE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();

DROP TRIGGER IF EXISTS log_offers_changes ON public.vehicle_offers;
CREATE TRIGGER log_offers_changes
AFTER INSERT OR UPDATE OR DELETE ON public.vehicle_offers
FOR EACH ROW EXECUTE FUNCTION public.log_table_changes();
