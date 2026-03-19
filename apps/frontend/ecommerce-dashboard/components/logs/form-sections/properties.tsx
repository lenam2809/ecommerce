// src/components/logs/form-sections/properties.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FormSection } from '@/components/ui/form-section';
import { LogEntryDto } from '@/types/log';

interface PropertiesSectionProps {
    log: LogEntryDto;
}

export function PropertiesSection({ log }: PropertiesSectionProps) {
    return (
        <FormSection title="Properties">
            {log.properties && log.properties.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Key</TableHead>
                            <TableHead>Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {log.properties.map((prop, index) => (
                            <TableRow key={index}>
                                <TableCell>{prop.key}</TableCell>
                                <TableCell>{prop.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-sm text-muted-foreground">Không có properties nào.</p>
            )}
        </FormSection>
    );
}