import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
    columns: number
    rows: number
}

export function TableSkeleton({ columns = 5, rows = 5 }: TableSkeletonProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {Array(columns)
                            .fill(0)
                            .map((_, i) => (
                                <TableHead key={i}>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                            ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array(rows)
                        .fill(0)
                        .map((_, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {Array(columns)
                                    .fill(0)
                                    .map((_, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
}
