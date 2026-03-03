import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ComparatorState {
    selectedVehicleIds: string[]
    isOpen: boolean
    addVehicle: (id: string) => void
    removeVehicle: (id: string) => void
    clearVehicles: () => void
    setIsOpen: (isOpen: boolean) => void
    toggleVehicle: (id: string) => void
}

export const useComparatorStore = create<ComparatorState>()(
    persist(
        (set, get) => ({
            selectedVehicleIds: [],
            isOpen: false,

            addVehicle: (id) => {
                const { selectedVehicleIds } = get()
                if (selectedVehicleIds.length < 3 && !selectedVehicleIds.includes(id)) {
                    set({ selectedVehicleIds: [...selectedVehicleIds, id], isOpen: true })
                }
            },

            removeVehicle: (id) => {
                set((state) => ({
                    selectedVehicleIds: state.selectedVehicleIds.filter((vId) => vId !== id),
                }))
            },

            clearVehicles: () => {
                set({ selectedVehicleIds: [], isOpen: false })
            },

            setIsOpen: (isOpen) => {
                set({ isOpen })
            },

            toggleVehicle: (id) => {
                const { selectedVehicleIds } = get()
                if (selectedVehicleIds.includes(id)) {
                    get().removeVehicle(id)
                } else {
                    get().addVehicle(id)
                }
            }
        }),
        {
            name: 'autocar-comparator-storage',
        }
    )
)
