"use client";

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ImagePreviewProps {
    file: File | string;
    onRemove: () => void;
    disabled?: boolean;
}

export function ImagePreview({ file, onRemove, disabled }: ImagePreviewProps) {
    const imageUrl = typeof file === 'string' ? file : URL.createObjectURL(file);

    return (
        <div className="relative w-full max-w-xs aspect-square">
            <Image
                src={imageUrl}
                alt="Preview"
                fill
                className="object-cover rounded-md"
            />
            {!disabled && (
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={onRemove}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}