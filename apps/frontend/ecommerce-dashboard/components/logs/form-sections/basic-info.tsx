// src/components/logs/form-sections/basic-info.tsx
import { Badge } from '@/components/ui/badge';
import { FormSection } from '@/components/ui/form-section';
import { LogEntryDto } from '@/types/log';

interface BasicInfoSectionProps {
    log: LogEntryDto;
}

export function BasicInfoSection({ log }: BasicInfoSectionProps) {
    const formattedTimestamp = new Date(log.timestamp).toLocaleString();

    return (
        <FormSection title="Thông tin cơ bản">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Thời gian</label>
                    <p className="text-sm text-muted-foreground">{formattedTimestamp}</p>
                </div>
                <div>
                    <label className="text-sm font-medium">Mức độ</label>
                    <p>
                        <Badge
                            variant={
                                log.levelText === 'Error'
                                    ? 'destructive'
                                    : log.levelText === 'Warning'
                                        ? 'default'
                                        : 'outline'
                            }
                        >
                            {log.levelText}
                        </Badge>
                    </p>
                </div>
                <div>
                    <label className="text-sm font-medium">Sự kiện</label>
                    <p className="text-sm text-muted-foreground">{log.eventName}</p>
                </div>
                <div>
                    <label className="text-sm font-medium">Người dùng</label>
                    <p className="text-sm text-muted-foreground">{log.userName}</p>
                </div>
                <div>
                    <label className="text-sm font-medium">Địa chỉ IP</label>
                    <p className="text-sm text-muted-foreground">{log.ipAddress}</p>
                </div>
                <div>
                    <label className="text-sm font-medium">User Agent</label>
                    <p className="text-sm text-muted-foreground truncate">{log.userAgent}</p>
                </div>
                <div className="col-span-2">
                    <label className="text-sm font-medium">Thông điệp</label>
                    <p className="text-sm text-muted-foreground">{log.message}</p>
                </div>
                <div className="col-span-2">
                    <label className="text-sm font-medium">Source Context</label>
                    <p className="text-sm text-muted-foreground">{log.sourceContext}</p>
                </div>
            </div>
        </FormSection>
    );
}