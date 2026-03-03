-- Create sales table (Pipeline Kanban)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'novos_leads' CHECK (status IN ('novos_leads', 'em_negociacao', 'aprovacao_credito', 'vendido', 'perdido')),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    value NUMERIC(10, 2),
    seller_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view sales" 
    ON public.sales FOR SELECT 
    USING (true); -- simplify for testing, usually check seller_id or role

CREATE POLICY "Users can insert sales" 
    ON public.sales FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update sales" 
    ON public.sales FOR UPDATE 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete sales" 
    ON public.sales FOR DELETE 
    USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
