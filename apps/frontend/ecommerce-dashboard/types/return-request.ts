export enum EReturnType {
    Return = 0,
    Exchange = 1,
}

export enum EReturnReason {
    Defective = 0,
    WrongItem = 1,
    DamagedInShipping = 2,
    NotAsDescribed = 3,
    ChangedMind = 4,
    Other = 5,
}

export enum EReturnStatus {
    Requested = 0,
    UnderReview = 1,
    Approved = 2,
    Rejected = 3,
    ItemReceived = 4,
    QualityCheck = 5,
    RefundProcessing = 6,
    ExchangeProcessing = 7,
    Completed = 8,
}

export enum EEvidenceType {
    Image = 0,
    Video = 1,
}

export interface ReturnEvidence {
    id: string;
    fileUrl: string;
    fileType: EEvidenceType;
    description?: string;
}

export interface ReturnStatusHistory {
    status: EReturnStatus;
    statusDisplay: string;
    note: string;
    changedAt: string;
}

export interface ReturnRequest {
    id: string;
    code: string;
    orderId: string;
    orderCode: string;
    orderItemId: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    type: EReturnType;
    typeDisplay: string;
    reason: EReturnReason;
    reasonDisplay: string;
    status: EReturnStatus;
    statusDisplay: string;
    customerNote: string;
    staffNote?: string;
    rejectionReason?: string;
    quantity: number;
    refundAmount: number;
    processedByStaffId?: string;
    createdAt: string;
    resolvedAt?: string;
    evidences: ReturnEvidence[];
    statusHistory: ReturnStatusHistory[];
}

export interface ReturnRequestList {
    id: string;
    code: string;
    orderCode: string;
    customerName: string;
    type: EReturnType;
    typeDisplay: string;
    status: EReturnStatus;
    statusDisplay: string;
    quantity: number;
    refundAmount: number;
    createdAt: string;
    resolvedAt?: string;
}

// ===== Helpers =====

export const getReturnTypeName = (type: EReturnType): string => {
    switch (type) {
        case EReturnType.Return: return "Trả hàng";
        case EReturnType.Exchange: return "Đổi hàng";
        default: return "Không xác định";
    }
};

export const getReturnReasonName = (reason: EReturnReason): string => {
    switch (reason) {
        case EReturnReason.Defective: return "Sản phẩm lỗi";
        case EReturnReason.WrongItem: return "Giao sai hàng";
        case EReturnReason.DamagedInShipping: return "Hư hỏng trong vận chuyển";
        case EReturnReason.NotAsDescribed: return "Không đúng mô tả";
        case EReturnReason.ChangedMind: return "Đổi ý";
        case EReturnReason.Other: return "Lý do khác";
        default: return "Không xác định";
    }
};

export const getReturnStatusName = (status: EReturnStatus): string => {
    switch (status) {
        case EReturnStatus.Requested: return "Đã gửi yêu cầu";
        case EReturnStatus.UnderReview: return "Đang xem xét";
        case EReturnStatus.Approved: return "Đã duyệt";
        case EReturnStatus.Rejected: return "Đã từ chối";
        case EReturnStatus.ItemReceived: return "Đã nhận hàng";
        case EReturnStatus.QualityCheck: return "Đang kiểm tra";
        case EReturnStatus.RefundProcessing: return "Đang hoàn tiền";
        case EReturnStatus.ExchangeProcessing: return "Đang đổi hàng";
        case EReturnStatus.Completed: return "Hoàn tất";
        default: return "Không xác định";
    }
};

export const getReturnStatusColor = (status: EReturnStatus): string => {
    switch (status) {
        case EReturnStatus.Requested: return "text-amber-600 bg-amber-50 border-amber-200";
        case EReturnStatus.UnderReview: return "text-blue-600 bg-blue-50 border-blue-200";
        case EReturnStatus.Approved: return "text-green-600 bg-green-50 border-green-200";
        case EReturnStatus.Rejected: return "text-red-600 bg-red-50 border-red-200";
        case EReturnStatus.ItemReceived: return "text-indigo-600 bg-indigo-50 border-indigo-200";
        case EReturnStatus.QualityCheck: return "text-cyan-600 bg-cyan-50 border-cyan-200";
        case EReturnStatus.RefundProcessing: return "text-orange-600 bg-orange-50 border-orange-200";
        case EReturnStatus.ExchangeProcessing: return "text-purple-600 bg-purple-50 border-purple-200";
        case EReturnStatus.Completed: return "text-emerald-600 bg-emerald-50 border-emerald-200";
        default: return "";
    }
};

export const getReturnStatusBadgeVariant = (status: EReturnStatus): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
        case EReturnStatus.Requested: return 'outline';
        case EReturnStatus.UnderReview: return 'secondary';
        case EReturnStatus.Approved: return 'default';
        case EReturnStatus.Rejected: return 'destructive';
        case EReturnStatus.Completed: return 'default';
        default: return 'secondary';
    }
};
