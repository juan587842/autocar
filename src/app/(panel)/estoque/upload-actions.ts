'use server'

import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'

export async function uploadVehiclePhoto(formData: FormData) {
    const file = formData.get('file') as File
    const vehicleId = formData.get('vehicleId') as string
    const isCover = formData.get('isCover') === 'true'

    if (!file || !vehicleId) {
        return { success: false, error: 'Faltam parâmetros obrigatórios' }
    }

    try {
        const supabase = await createClient()

        const { data: storeSettings } = await supabase
            .from('store_settings')
            .select('watermark_type, watermark_text, watermark_image_url, watermark_size, watermark_opacity, watermark_position')
            .limit(1)
            .single()

        let imageBuffer: Buffer<ArrayBuffer> = Buffer.from(await file.arrayBuffer()) as Buffer<ArrayBuffer>

        // Aplica a marca d'água usando Sharp
        if (storeSettings && storeSettings.watermark_type !== 'none') {
            const image = sharp(imageBuffer)
            const metadata = await image.metadata()
            const width = metadata.width || 800
            const height = metadata.height || 600

            const wmWidth = Math.max(100, Math.floor((width * storeSettings.watermark_size) / 100))
            const opacity = storeSettings.watermark_opacity / 100

            let overlayBuffer = null;

            if (storeSettings.watermark_type === 'text' && storeSettings.watermark_text) {
                // Desenha svg de texto
                const svgText = `
                <svg width="${wmWidth}" height="${wmWidth * 0.3}">
                  <style>
                    .title { fill: rgba(255, 255, 255, ${opacity}); font-size: ${wmWidth * 0.15}px; font-weight: bold; font-family: sans-serif; text-shadow: 2px 2px 4px rgba(0,0,0,${opacity}); }
                  </style>
                  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="title">${storeSettings.watermark_text}</text>
                </svg>
                `
                overlayBuffer = Buffer.from(svgText)
            } else if (storeSettings.watermark_type === 'image' && storeSettings.watermark_image_url) {
                // Fetch external logic might fail visually if the image requires authentication, but since it's an external url usually public:
                try {
                    const response = await fetch(storeSettings.watermark_image_url)
                    if (response.ok) {
                        const wmBuf = await response.arrayBuffer()
                        overlayBuffer = await sharp(Buffer.from(wmBuf))
                            .resize(wmWidth)
                            // Remove opacity using multiply blend mode or composite
                            .composite([{ input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]), raw: { width: 1, height: 1, channels: 4 }, tile: true, blend: 'dest-in' }])
                            .png()
                            .toBuffer()
                    }
                } catch (e) {
                    console.error("Erro ao puxar watermark image URL", e)
                }
            }

            if (overlayBuffer) {
                // Gravidade (posição)
                let gravity = 'southeast'
                switch (storeSettings.watermark_position) {
                    case 'top-left': gravity = 'northwest'; break;
                    case 'top-right': gravity = 'northeast'; break;
                    case 'center': gravity = 'center'; break;
                    case 'bottom-left': gravity = 'southwest'; break;
                    case 'bottom-right': gravity = 'southeast'; break;
                }

                imageBuffer = await sharp(imageBuffer)
                    .composite([
                        {
                            input: overlayBuffer,
                            gravity: gravity,
                            blend: 'over'
                        }
                    ])
                    .toBuffer() as Buffer<ArrayBuffer>
            }
        }

        const fileName = `${vehicleId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

        // Uplod to bucket "vehicle-photos"
        const { data: uploadData, error: uploadError } = await (await createClient()).storage
            .from('vehicle-photos')
            .upload(fileName, imageBuffer, {
                contentType: file.type,
                upsert: false
            })

        if (uploadError) {
            throw new Error(`Erro no upload Storage: ${uploadError.message}`)
        }

        const { data: publicUrlData } = (await createClient()).storage
            .from('vehicle-photos')
            .getPublicUrl(fileName)

        const publicUrl = publicUrlData.publicUrl

        // Insert into vehicle_photos table
        const { error: dbError } = await (await createClient()).from('vehicle_photos').insert({
            vehicle_id: vehicleId,
            url: publicUrl,
            is_cover: isCover
        })

        if (dbError) {
            throw new Error(`Erro na inserção do BD: ${dbError.message}`)
        }

        return { success: true, url: publicUrl }
    } catch (e: any) {
        return { success: false, error: e.message || 'Erro interno.' }
    }
}
