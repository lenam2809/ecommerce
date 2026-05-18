import { logger } from '@/lib/logger'
import { FormSection } from '@/components/ui/form-section';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Category } from '@/types/category';

interface ChildrenInfoSectionProps {
    form: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function ChildrenInfoSection({ form }: ChildrenInfoSectionProps) {
    // Get the children from the form's watch values
    const children = form.watch('children') || [];

    logger.debug('Children:', children);
    if (!children || children.length === 0) {
        return null;
    }

    return (
        <FormSection title="Danh mục con">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã danh mục</TableHead>
                            <TableHead>Tên danh mục</TableHead>
                            <TableHead>Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {children.map((child: Category) => (
                            <TableRow key={child.id}>
                                <TableCell>{child.code}</TableCell>
                                <TableCell>{child.name}</TableCell>
                                <TableCell>
                                    <Badge variant={child.isActive ? 'default' : 'secondary'}>
                                        {child.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </FormSection>
    );
}