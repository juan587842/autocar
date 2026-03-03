'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const offerSchema = z.object({
    name: z.string().min(2, 'O nome é obrigatório'),
    phone: z.string().min(10, 'Telefone inválido'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    brand: z.string().min(1, 'A marca é obrigatória'),
    model: z.string().min(1, 'O modelo é obrigatório'),
    year: z.string().min(4, 'Ano inválido'),
    mileage: z.number().min(0, 'Quilometragem inválida'),
    expected_price: z.number().min(0, 'Preço inválido'),
    notes: z.string().optional(),
    lgpd_consent: z.literal('on', { message: 'Você precisa aceitar os termos' })
})

export async function submitVehicleOffer(prevState: any, formData: FormData) {
    try {
        const supabase = await createClient()

        // Parse form data
        const rawData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email') || '',
            brand: formData.get('brand'),
            model: formData.get('model'),
            year: formData.get('year'),
            mileage: parseInt(formData.get('mileage') as string || '0', 10),
            expected_price: parseFloat(formData.get('expected_price') as string || '0'),
            notes: formData.get('notes') || '',
            lgpd_consent: formData.get('lgpd_consent')
        }

        // Validate with Zod
        const validatedData = offerSchema.safeParse(rawData)

        if (!validatedData.success) {
            return {
                success: false,
                errors: validatedData.error.flatten().fieldErrors,
                message: 'Por favor, corrija os erros no formulário.'
            }
        }

        // Formatar o telefone
        // Limpar tudo que não é número
        let cleanPhone = validatedData.data.phone.replace(/\D/g, '')

        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            return {
                success: false,
                errors: { phone: ['O telefone deve ter DDD + Número'] },
                message: 'Número de telefone inválido.'
            }
        }

        // Adicionar o prefixo 55 se não existir (no frontend a máscara coleta apenas 11 dígitos, DDD+N)
        if (!cleanPhone.startsWith('55')) {
            cleanPhone = `55${cleanPhone}`
        }

        // Handle Photos Upload (up to 5)
        // Files come as 'photos' from the input multiple
        const photos = formData.getAll('photos') as File[]
        const uploadedUrls: string[] = []

        for (const photo of photos) {
            if (photo && photo.size > 0 && uploadedUrls.length < 5) {
                const fileExt = photo.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
                const filePath = `offers/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('vehicle-photos')
                    .upload(filePath, photo, {
                        upsert: false
                    })

                if (!uploadError) {
                    const { data } = supabase.storage.from('vehicle-photos').getPublicUrl(filePath)
                    uploadedUrls.push(data.publicUrl)
                } else {
                    console.error('Photo upload error:', uploadError)
                }
            }
        }

        // Insert into database
        const { error: insertError } = await supabase
            .from('vehicle_offers')
            .insert({
                name: validatedData.data.name,
                phone: cleanPhone,
                email: validatedData.data.email || null,
                brand: validatedData.data.brand,
                model: validatedData.data.model,
                year: validatedData.data.year,
                mileage: validatedData.data.mileage,
                expected_price: validatedData.data.expected_price,
                notes: validatedData.data.notes || null,
                photos: uploadedUrls,
                status: 'nova',
                lgpd_consent: true
            })

        if (insertError) {
            console.error('Database insert error:', insertError)
            return { success: false, message: 'Ocorreu um erro ao enviar sua proposta. Tente novamente.' }
        }

        return {
            success: true,
            message: 'Proposta enviada com sucesso! Nossa equipe entrará em contato em breve.'
        }
    } catch (error) {
        console.error('Action error:', error)
        return { success: false, message: 'Ocorreu um erro inesperado.' }
    }
}
