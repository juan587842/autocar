-- Adiciona coluna image_url à tabela vehicle_categories
ALTER TABLE public.vehicle_categories
    ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
