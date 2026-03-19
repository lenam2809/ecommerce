"use client"

import { AddressesTab } from "@/components/account/addresses-tab"
import { useAddresses } from "@/hooks/use-user"

export default function AddressPage() {
    const { addresses, isLoading: isLoadingAddresses, setDefaultAddress, deleteAddress } = useAddresses();

    const handleSetDefaultAddress = (id: string) => {
        setDefaultAddress(id)
    }

    const handleDeleteAddress = (id: string) => {
        deleteAddress(id)
    }

    return (
        <>
            <AddressesTab
                addresses={addresses}
                isLoadingAddresses={isLoadingAddresses}
                handleSetDefaultAddress={handleSetDefaultAddress}
                handleDeleteAddress={handleDeleteAddress}
            />
        </>
    )
}