import { upsertVehicle } from '../actions'
import { uploadVehiclePhoto, deleteVehiclePhoto } from '../upload-actions'
import { VehicleForm } from '../_components/vehicle-form'

export default function NewVehiclePage() {
    return (
        <VehicleForm
            submitAction={upsertVehicle}
            uploadAction={uploadVehiclePhoto}
            deleteAction={deleteVehiclePhoto}
        />
    )
}
