"use client"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TableViewSelectorProps {
    views: {
        id: string
        label: string
        badgeCount?: number
    }[]
    defaultView: string
}

export function TableViewSelector({ views, defaultView }: TableViewSelectorProps) {
    return (
        <>
            <Label htmlFor="view-selector" className="sr-only">
                Chế độ xem
            </Label>
            <Select defaultValue={defaultView}>
                <SelectTrigger
                    className="flex w-fit @4xl/main:hidden"
                    size="sm"
                    id="view-selector"
                >
                    <SelectValue placeholder="Chọn chế độ xem" />
                </SelectTrigger>
                <SelectContent>
                    {views.map((view) => (
                        <SelectItem key={view.id} value={view.id}>
                            {view.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
                {views.map((view) => (
                    <TabsTrigger key={view.id} value={view.id}>
                        {view.label}
                        {view.badgeCount && <Badge variant="secondary">{view.badgeCount}</Badge>}
                    </TabsTrigger>
                ))}
            </TabsList>
        </>
    )
}