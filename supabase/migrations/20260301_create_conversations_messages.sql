-- =====================================================
-- Sprint 5 — Módulo de Conversas (WhatsApp/Chat)
-- Migration: create_conversations_messages
-- Data: 2026-03-01
-- Autor: Dara (Data Engineer)
-- =====================================================

-- =================================================
-- 1. TABELA: conversations (Conversas / Sessões)
-- =================================================
-- Cada conversa representa uma sessão de chat com um
-- cliente, podendo ter origem em WhatsApp, site ou
-- chat interno do painel.

CREATE TABLE IF NOT EXISTS public.conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    assigned_to     UUID REFERENCES public.users(id) ON DELETE SET NULL,
    channel         TEXT NOT NULL DEFAULT 'whatsapp'
                    CHECK (channel IN ('whatsapp', 'website', 'internal', 'instagram', 'facebook')),
    status          TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'closed', 'archived', 'waiting_customer', 'waiting_agent')),
    subject         TEXT,
    phone           TEXT,
    is_ai_active    BOOLEAN NOT NULL DEFAULT TRUE,
    unread_count    INTEGER NOT NULL DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at       TIMESTAMPTZ
);

COMMENT ON TABLE  public.conversations IS 'Sessões de conversa com clientes (WhatsApp, site, chat interno)';
COMMENT ON COLUMN public.conversations.channel IS 'Canal de origem: whatsapp, website, internal, instagram, facebook';
COMMENT ON COLUMN public.conversations.status IS 'Estado da conversa: open, closed, archived, waiting_customer, waiting_agent';
COMMENT ON COLUMN public.conversations.is_ai_active IS 'Indica se o agente IA está respondendo automaticamente nesta conversa';
COMMENT ON COLUMN public.conversations.metadata IS 'Dados extras livres (ex: remote_jid do WhatsApp, session_id, etc.)';

CREATE INDEX IF NOT EXISTS idx_conversations_customer ON public.conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned ON public.conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status) WHERE status != 'archived';
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON public.conversations(channel);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON public.conversations(phone);

-- =================================================
-- 2. TABELA: messages (Mensagens individuais)
-- =================================================
-- Cada registro é uma mensagem trocada dentro de
-- uma conversa. Suporta texto, imagem, áudio,
-- documento, localização e sticker.

CREATE TABLE IF NOT EXISTS public.messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type     TEXT NOT NULL DEFAULT 'customer'
                    CHECK (sender_type IN ('customer', 'agent', 'ai', 'system')),
    sender_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content         TEXT,
    content_type    TEXT NOT NULL DEFAULT 'text'
                    CHECK (content_type IN ('text', 'image', 'audio', 'video', 'document', 'location', 'sticker', 'contact', 'template')),
    media_url       TEXT,
    media_mime_type TEXT,
    media_filename  TEXT,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    reply_to        UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    external_id     TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.messages IS 'Mensagens individuais em conversas (texto, mídia, templates)';
COMMENT ON COLUMN public.messages.sender_type IS 'Tipo do remetente: customer (cliente), agent (vendedor), ai, system';
COMMENT ON COLUMN public.messages.content_type IS 'Tipo do conteúdo: text, image, audio, video, document, location, sticker, contact, template';
COMMENT ON COLUMN public.messages.external_id IS 'ID externo da mensagem na API do canal (ex: wamid do WhatsApp)';
COMMENT ON COLUMN public.messages.reply_to IS 'Referência a outra mensagem (reply/quote)';

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages(content_type);
CREATE INDEX IF NOT EXISTS idx_messages_external ON public.messages(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(conversation_id, is_read) WHERE is_read = FALSE;

-- =================================================
-- 3. TRIGGERS: updated_at automático
-- =================================================
-- Reutiliza a função handle_updated_at() já criada
-- na migration anterior (users_customers_tags).

DROP TRIGGER IF EXISTS set_updated_at_conversations ON public.conversations;
CREATE TRIGGER set_updated_at_conversations
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_messages ON public.messages;
CREATE TRIGGER set_updated_at_messages
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =================================================
-- 4. TRIGGER: Atualizar last_message_at e unread_count
-- =================================================
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET
        last_message_at = NEW.created_at,
        unread_count = CASE
            WHEN NEW.sender_type = 'customer' THEN unread_count + 1
            ELSE unread_count
        END,
        status = CASE
            WHEN NEW.sender_type = 'customer' AND status = 'waiting_customer' THEN 'open'
            WHEN NEW.sender_type IN ('agent', 'ai') AND status = 'open' THEN 'waiting_customer'
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- =================================================
-- 5. RLS POLICIES
-- =================================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- conversations: Todos autenticados vêem conversas ativas;
-- Owners/Managers vêem tudo, Sellers só as que lhes estão atribuídas.
CREATE POLICY conversations_select ON public.conversations
    FOR SELECT TO authenticated
    USING (
        public.get_user_role() IN ('owner', 'manager')
        OR assigned_to = auth.uid()
    );

CREATE POLICY conversations_insert ON public.conversations
    FOR INSERT TO authenticated
    WITH CHECK (TRUE);

CREATE POLICY conversations_update ON public.conversations
    FOR UPDATE TO authenticated
    USING (
        public.get_user_role() IN ('owner', 'manager')
        OR assigned_to = auth.uid()
    )
    WITH CHECK (
        public.get_user_role() IN ('owner', 'manager')
        OR assigned_to = auth.uid()
    );

CREATE POLICY conversations_delete ON public.conversations
    FOR DELETE TO authenticated
    USING (public.get_user_role() = 'owner');

-- messages: Visível se o usuário tem acesso à conversation
CREATE POLICY messages_select ON public.messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (
                public.get_user_role() IN ('owner', 'manager')
                OR c.assigned_to = auth.uid()
            )
        )
    );

CREATE POLICY messages_insert ON public.messages
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (
                public.get_user_role() IN ('owner', 'manager')
                OR c.assigned_to = auth.uid()
            )
        )
    );

CREATE POLICY messages_update ON public.messages
    FOR UPDATE TO authenticated
    USING (
        sender_id = auth.uid()
        OR public.get_user_role() IN ('owner', 'manager')
    )
    WITH CHECK (
        sender_id = auth.uid()
        OR public.get_user_role() IN ('owner', 'manager')
    );

-- =================================================
-- 6. ENABLE REALTIME (para chat ao vivo)
-- =================================================
-- Habilita publicação de mudanças via Supabase Realtime
-- para que o frontend receba mensagens em tempo real.

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
