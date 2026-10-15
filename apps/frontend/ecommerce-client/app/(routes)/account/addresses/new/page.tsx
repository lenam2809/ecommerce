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
        <div className="container-app py-6 md:py-10">
            <div className="mb-6">
                <Button asChild variant="ghost" className="rounded-full text-ink-soft hover:text-brand">
                    <Link href="/account/addresses" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại danh sách địa chỉ
                    </Link>
                </Button>
            </div>

            <div className="section-heading">
                <p className="section-label">Địa chỉ</p>
                <h1 className="section-title">Thêm địa chỉ mới</h1>
            </div>

            <AddressForm
                onSubmit={handleSubmit}
                isSubmitting={isPending}
            />
        </div>
    );
}
