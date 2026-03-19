"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import {
    useGetPermissions,
    useGetUserPermissions,
    useAssignPermissionsToUser,
} from "@/hooks/use-permissions";
import { useRouter } from 'next/navigation';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface UserPermissionAssignmentProps {
    userId: string;
    userName?: string;
}

interface Permission {
    id: string;
    name: string;
    description?: string;
    category?: string;
}

export function UserPermissionAssignment({ userId, userName }: UserPermissionAssignmentProps) {
    const router = useRouter();
    const { data: permissionsData, isLoading: isLoadingPermissions } = useGetPermissions();
    const { data: userPermissionsData, isLoading: isLoadingUserPermissions } = useGetUserPermissions(userId);
    const { mutate: assignPermissions, isPending: isAssigning } = useAssignPermissionsToUser();

    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (userPermissionsData?.data) {
            const selectedPermissionIds = userPermissionsData.data
                .filter(p => p.isSelected)
                .map(p => p.id);
            setSelectedPermissions(selectedPermissionIds);
        }
    }, [userPermissionsData]);

    const handlePermissionToggle = (permissionId: string) => {
        setSelectedPermissions(prevSelected => {
            if (prevSelected.includes(permissionId)) {
                return prevSelected.filter(id => id !== permissionId);
            } else {
                return [...prevSelected, permissionId];
            }
        });
    };

    const handleSavePermissions = () => {
        assignPermissions({ userId, permissionIds: selectedPermissions });
    };

    // Group permissions by category (assuming permissions have a category field, or we'll use a default)
    const groupedPermissions = useMemo(() => {
        const groups: { [key: string]: Permission[] } = {};
        permissionsData?.data?.forEach(permission => {
            const category = permission.category || 'General';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(permission);
        });
        return groups;
    }, [permissionsData]);

    // Filter permissions based on search query
    const filteredPermissions = useMemo(() => {
        if (!searchQuery) return groupedPermissions;
        const filtered: { [key: string]: Permission[] } = {};
        Object.entries(groupedPermissions).forEach(([category, permissions]) => {
            const matchingPermissions = permissions.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (matchingPermissions.length > 0) {
                filtered[category] = matchingPermissions;
            }
        });
        return filtered;
    }, [groupedPermissions, searchQuery]);

    const isLoading = isLoadingPermissions || isLoadingUserPermissions;

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">
                    Phân quyền cho người dùng {userName ? `"${userName}"` : ""}
                </CardTitle>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm quyền..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <ScrollArea className="h-[60vh] pr-4">
                            {Object.entries(filteredPermissions).map(([category, permissions]) => (
                                <div key={category} className="mb-6">
                                    <h3 className="text-lg font-semibold mb-3">{category}</h3>
                                    <Separator className="mb-4" />
                                    <div className="space-y-3">
                                        {permissions.map(permission => (
                                            <div
                                                key={permission.id}
                                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <Checkbox
                                                    id={`permission-${permission.id}`}
                                                    checked={selectedPermissions.includes(permission.id)}
                                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                                    className="h-5 w-5"
                                                />
                                                <label
                                                    htmlFor={`permission-${permission.id}`}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <span className="text-sm font-medium">{permission.name}</span>
                                                    {permission.description && (
                                                        <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                                                    )}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(filteredPermissions).length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    Không tìm thấy quyền phù hợp với tìm kiếm
                                </div>
                            )}
                        </ScrollArea>

                        <div className="flex gap-4 justify-end mt-8">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isAssigning}
                                className="min-w-[120px]"
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSavePermissions}
                                disabled={isAssigning}
                                className="min-w-[120px]"
                            >
                                {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Lưu phân quyền
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}