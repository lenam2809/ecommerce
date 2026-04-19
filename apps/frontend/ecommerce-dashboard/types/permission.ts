export interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
    isSelected: boolean;
}


// src/constants/permissions.ts

/**
 * Enum chứa các quyền trong hệ thống
 */
export const EPermissions = {
    // User permissions
    ViewUsers: "ViewUsers",
    CreateUser: "CreateUser",
    EditUser: "EditUser",
    DeleteUser: "DeleteUser",

    // Role permissions
    ViewRoles: "ViewRoles",
    CreateRole: "CreateRole",
    EditRole: "EditRole",
    DeleteRole: "DeleteRole",

    // Permission management
    ViewPermissions: "ViewPermissions",
    CreatePermission: "CreatePermission",
    EditPermission: "EditPermission",
    DeletePermission: "DeletePermission",
    AssignPermission: "AssignPermission",

    // Product permissions
    ViewProducts: "ViewProducts",
    CreateProduct: "CreateProduct",
    EditProduct: "EditProduct",
    DeleteProduct: "DeleteProduct",

    // Category permissions
    ViewCategories: "ViewCategories",
    CreateCategory: "CreateCategory",
    EditCategory: "EditCategory",
    DeleteCategory: "DeleteCategory",

    ViewBrands: "ViewBrands",
    CreateBrand: "CreateBrand",
    EditBrand: "EditBrand",
    DeleteBrand: "DeleteBrand",

    // Order permissions
    ViewOrders: "ViewOrders",
    CreateOrder: "CreateOrder",
    EditOrder: "EditOrder",
    DeleteOrder: "DeleteOrder",
} as const;

/**
 * Nhóm các quyền theo chức năng
 */
const UserManagement = [
    EPermissions.ViewUsers,
    EPermissions.CreateUser,
    EPermissions.EditUser,
    EPermissions.DeleteUser,
] as const;

const RoleManagement = [
    EPermissions.ViewRoles,
    EPermissions.CreateRole,
    EPermissions.EditRole,
    EPermissions.DeleteRole,
] as const;

const PermissionManagement = [
    EPermissions.ViewPermissions,
    EPermissions.CreatePermission,
    EPermissions.EditPermission,
    EPermissions.DeletePermission,
    EPermissions.AssignPermission,
] as const;

const ProductManagement = [
    EPermissions.ViewProducts,
    EPermissions.CreateProduct,
    EPermissions.EditProduct,
    EPermissions.DeleteProduct,
] as const;

const CategoryManagement = [
    EPermissions.ViewCategories,
    EPermissions.CreateCategory,
    EPermissions.EditCategory,
    EPermissions.DeleteCategory,
] as const;

const BrandManagement = [
    EPermissions.ViewBrands,
    EPermissions.CreateBrand,
    EPermissions.EditBrand,
    EPermissions.DeleteBrand,
] as const;

const OrderManagement = [
    EPermissions.ViewOrders,
    EPermissions.CreateOrder,
    EPermissions.EditOrder,
    EPermissions.DeleteOrder,
] as const;

const AdminPermissions = [
    ...UserManagement,
    ...RoleManagement,
    ...PermissionManagement,
    ...ProductManagement,
    ...CategoryManagement,
    ...BrandManagement,
    ...OrderManagement,
] as const;

const StaffPermissions = [
    ...ProductManagement,
    ...CategoryManagement,
    ...BrandManagement,
    ...OrderManagement,
    EPermissions.ViewUsers,
    EPermissions.EditUser,
] as const;

const CustomerPermissions = [
    EPermissions.ViewProducts,
    EPermissions.ViewCategories,
    EPermissions.CreateOrder,
    EPermissions.ViewOrders,
] as const;

export const PermissionGroups: {
    UserManagement: readonly EPermission[];
    RoleManagement: readonly EPermission[];
    PermissionManagement: readonly EPermission[];
    ProductManagement: readonly EPermission[];
    CategoryManagement: readonly EPermission[];
    BrandManagement: readonly EPermission[];
    OrderManagement: readonly EPermission[];
    AdminPermissions: readonly EPermission[];
    StaffPermissions: readonly EPermission[];
    CustomerPermissions: readonly EPermission[];
} = {
    UserManagement,
    RoleManagement,
    PermissionManagement,
    ProductManagement,
    CategoryManagement,
    BrandManagement,
    OrderManagement,
    AdminPermissions,
    StaffPermissions,
    CustomerPermissions,
} as const;

// Kiểu cho EPermissions
export type EPermission = typeof EPermissions[keyof typeof EPermissions];

// Kiểm tra quyền
export const hasPermission = (
    userPermissions: EPermission[] | string[] | undefined,
    requiredPermissions: EPermission[] | EPermission | string | undefined,
    userRoles?: string[]
): boolean => {
    // Tài khoản có role là admin thì được truy cập toàn bộ
    if (userRoles && userRoles.includes("Admin")) {
        return true;
    }

    if (!requiredPermissions || (Array.isArray(requiredPermissions) && requiredPermissions.length === 0)) {
        return true;
    }

    if (!userPermissions || userPermissions.length === 0) {
        return false;
    }

    const required = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

    return required.some(permission =>
        (userPermissions as EPermission[]).includes(permission as EPermission)
    );
};