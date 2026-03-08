import { upsertVehicle } from '../actions'
import { VehicleForm } from '../_components/vehicle-form'

export default function NewVehiclePage() {
    return (
        <VehicleForm
            submitAction={upsertVehicle}
            uploadAction={null}
        />
    )
}
