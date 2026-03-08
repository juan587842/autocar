import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { upsertVehicle } from "../../actions"
import { uploadVehiclePhoto, deleteVehiclePhoto } from "../../upload-actions"
import { VehicleForm } from "../../_components/vehicle-form"

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient()

    const { data: vehicle, error } = await supabase
        .from('vehicles')
        .select('*, vehicle_photos(id, url, is_cover, display_order)')
        .eq('id', id)
        .single()

    if (error || !vehicle) {
        redirect('/estoque')
    }

    return (
        <VehicleForm
            initialData={vehicle}
            submitAction={upsertVehicle}
            uploadAction={uploadVehiclePhoto}
            deleteAction={deleteVehiclePhoto}
        />
    )
}
