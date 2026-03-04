import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface StoreSettings {
    id?: string;
    name?: string;
    slug?: string;
    cnpj?: string;
    phone?: string;
    email?: string;
    description?: string;
    address_street?: string;
    address_number?: string;
    address_neighborhood?: string;
    address_city?: string;
    address_state?: string;
    address_zip?: string;
    address_lat?: number;
    address_lng?: number;
    logo_url?: string;
    favicon_url?: string;
    primary_color?: string;
    business_hours?: any;
    watermark_type?: string;
    watermark_text?: string;
    watermark_image_url?: string;
    watermark_size?: number;
    watermark_opacity?: number;
    watermark_position?: string;
    ai_default_model?: string;
    ai_system_prompt?: string;
    ai_enable_stock_check?: boolean;
    ai_enable_scheduling?: boolean;
    commission_enabled?: boolean;
    commission_type?: string;
    commission_value?: number;
    whatsapp_instance_name?: string;
    whatsapp_status?: string;
}

interface SettingsState {
    settings: StoreSettings;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    fetchSettings: () => Promise<void>;
    updateSetting: (key: keyof StoreSettings, value: any) => void;
    saveSettings: () => Promise<{ success: boolean; error?: string }>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: {},
    isLoading: true,
    isSaving: false,
    error: null,

    fetchSettings: async () => {
        set({ isLoading: true, error: null })
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('store_settings')
                .select('*')
                .limit(1)
                .single()

            if (error) throw error
            if (data) {
                set({ settings: data })
            }
        } catch (error: any) {
            console.error('Error fetching settings:', error)
            set({ error: error.message })
        } finally {
            set({ isLoading: false })
        }
    },

    updateSetting: (key, value) => {
        set((state) => ({
            settings: {
                ...state.settings,
                [key]: value
            }
        }))
    },

    saveSettings: async () => {
        const { settings } = get()
        if (!settings.id) return { success: false, error: 'As configurações não puderam ser carregadas. Tente recarregar a página.' }

        set({ isSaving: true, error: null })
        try {
            const supabase = createClient()
            // We only send the fields, removing the id from the payload just in case, though it's fine
            const payload = { ...settings }
            delete payload.id

            const { error } = await supabase
                .from('store_settings')
                .update(payload)
                .eq('id', settings.id)

            if (error) throw error
            return { success: true }
        } catch (error: any) {
            console.error('Error saving settings:', error)
            set({ error: error.message })
            return { success: false, error: error.message }
        } finally {
            set({ isSaving: false })
        }
    }
}))
