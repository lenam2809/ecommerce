"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCreateAddress } from "@/hooks/use-addresses";
import { CreateAddressDto } from "@/types/address";
import { AddressForm } from "@/components/account/address-form";

export default function NewAddressPage() {
    const { mutate: createAddress, isPending } = useCreateAddress();

    const handleSubmit = (data: CreateAddressDto) => {
        createAddress(data);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button asChild variant="ghost">
                    <Link href="/account/addresses" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại danh sách địa chỉ
                    </Link>
                </Button>
            </div>

            <h1 className="text-2xl font-bold mb-6">Thêm địa chỉ mới</h1>

            <AddressForm
                onSubmit={handleSubmit}
                isSubmitting={isPending}
            />
        </div>
    );
}