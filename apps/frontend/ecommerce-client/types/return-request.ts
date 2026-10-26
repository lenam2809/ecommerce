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

export interface ReturnRequestLog {
    id: string;
    step: number;
    action: string;
    title: string;
    actorName?: string;
    author?: string;
    location?: string;
    note?: string;
    technicianNote?: string;
    processingMethod?: string;
    loggedAt: string;
}

export interface ReturnTimelineStep {
    step: number;
    title: string;
    description: string;
    status: string; // "Completed" | "Active" | "Pending"
    completedAt?: string;
    actor?: string;
    location?: string;
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
    serialNumber?: string;
    showroomId?: string;
    showroomName?: string;
    showroomAddress?: string;
    assignedTechnicianName?: string;
    processingMethod?: string;
    evidences: ReturnEvidence[];
    statusHistory: ReturnStatusHistory[];
    logs?: ReturnRequestLog[];
    timelineSteps?: ReturnTimelineStep[];
}

export interface ReturnRequestDetail extends ReturnRequest {
    logs: ReturnRequestLog[];
    timelineSteps: ReturnTimelineStep[];
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
