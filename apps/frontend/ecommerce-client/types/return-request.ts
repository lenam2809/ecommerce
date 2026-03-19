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

export interface ReturnEvidence {
    id: string;
    fileUrl: string;
    fileType: number;
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
    createdAt: string;
    resolvedAt?: string;
    evidences: ReturnEvidence[];
    statusHistory: ReturnStatusHistory[];
}

export interface ReturnRequestList {
    id: string;
    code: string;
    orderCode: string;
    type: EReturnType;
    typeDisplay: string;
    status: EReturnStatus;
    statusDisplay: string;
    quantity: number;
    refundAmount: number;
    createdAt: string;
}

export interface CreateReturnRequest {
    orderId: string;
    orderItemId: string;
    type: EReturnType;
    reason: EReturnReason;
    customerNote: string;
    quantity: number;
}

// Helpers
export const getReturnStatusName = (status: EReturnStatus): string => {
    const map: Record<EReturnStatus, string> = {
        [EReturnStatus.Requested]: "Đã gửi yêu cầu",
        [EReturnStatus.UnderReview]: "Đang xem xét",
        [EReturnStatus.Approved]: "Đã duyệt",
        [EReturnStatus.Rejected]: "Đã từ chối",
        [EReturnStatus.ItemReceived]: "Đã nhận hàng",
        [EReturnStatus.QualityCheck]: "Đang kiểm tra",
        [EReturnStatus.RefundProcessing]: "Đang hoàn tiền",
        [EReturnStatus.ExchangeProcessing]: "Đang đổi hàng",
        [EReturnStatus.Completed]: "Hoàn tất",
    };
    return map[status] || "Không xác định";
};

export const getReturnStatusColor = (status: EReturnStatus): string => {
    const map: Record<EReturnStatus, string> = {
        [EReturnStatus.Requested]: "bg-amber-100 text-amber-700",
        [EReturnStatus.UnderReview]: "bg-blue-100 text-blue-700",
        [EReturnStatus.Approved]: "bg-green-100 text-green-700",
        [EReturnStatus.Rejected]: "bg-red-100 text-red-700",
        [EReturnStatus.ItemReceived]: "bg-indigo-100 text-indigo-700",
        [EReturnStatus.QualityCheck]: "bg-cyan-100 text-cyan-700",
        [EReturnStatus.RefundProcessing]: "bg-orange-100 text-orange-700",
        [EReturnStatus.ExchangeProcessing]: "bg-purple-100 text-purple-700",
        [EReturnStatus.Completed]: "bg-emerald-100 text-emerald-700",
    };
    return map[status] || "";
};
