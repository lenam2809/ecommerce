// src/components/logs/log-detail-form.tsx
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogEntryDto } from '@/types/log';
import { BasicInfoSection } from './form-sections/basic-info';
import { PropertiesSection } from './form-sections/properties';

interface LogDetailFormProps {
    log: LogEntryDto;
}

export function LogDetailForm({ log }: LogDetailFormProps) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <BasicInfoSection log={log} />
            <PropertiesSection log={log} />
            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Quay lại
                </Button>
            </div>
        </div>
    );
}