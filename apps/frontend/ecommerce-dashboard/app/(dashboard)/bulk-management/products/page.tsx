// app/products/bulk-management/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImportProducts } from "@/components/bulk-management/products/import-products";
import { ExportProducts } from "@/components/bulk-management/products/export-products";

export default function ProductBulkManagementPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("import");

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Quản lý sản phẩm hàng loạt</h1>
                <Button onClick={() => router.push("/products")}>Quay lại Sản phẩm</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Thao tác hàng loạt</CardTitle>
                    <CardDescription>
                        Nhập, xuất hoặc xóa sản phẩm hàng loạt bằng file Excel hoặc CSV
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="import">Nhập dữ liệu sản phẩm</TabsTrigger>
                            <TabsTrigger value="export">Xuất dữ liệu sản phẩm</TabsTrigger>
                            <TabsTrigger value="delete">Xóa nhiều sản phẩm</TabsTrigger>
                        </TabsList>

                        <TabsContent value="import" className="mt-6">
                            <ImportProducts />
                        </TabsContent>

                        <TabsContent value="export" className="mt-6">
                            <ExportProducts />
                        </TabsContent>

                        {/* <TabsContent value="delete" className="mt-6">
                            <BulkDeleteProducts />
                        </TabsContent> */}
                    </Tabs>
                </CardContent>
                <CardFooter>
                    <Alert variant="default" className="w-full">
                        <AlertTitle>Cần trợ giúp?</AlertTitle>
                        <AlertDescription>
                            Tải mẫu nhập liệu để xem định dạng yêu cầu cho dữ liệu sản phẩm. Đảm bảo tuân thủ mọi yêu cầu để nhập liệu thành công.
                        </AlertDescription>
                    </Alert>
                </CardFooter>
            </Card>
        </div>
    );
}