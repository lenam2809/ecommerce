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

export interface ReturnRequestLog {
    id: string;
    step: number; // 1..5
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
    step: number; // 1..5
    title: string;
    description: string;
    status: string; // "Completed" | "Active" | "Pending"
    completedAt?: string;
    actor?: string;
    location?: string;
}

export interface AddReturnLogRequest {
    step: number; // 1..5
    action?: string;
    title: string;
    actorName?: string;
    location?: string;
    note?: string;
    processingMethod?: string;
    serialNumber?: string;
    showroomId?: string;
    assignedTechnicianName?: string;
    advanceStatus?: EReturnStatus;
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

export interface RMAStandardStep {
    step: number;
    key: string;
    title: string;
    subtitle: string;
    description: string;
    expectedAction: string;
}

export const RMA_5_STEPS: RMAStandardStep[] = [
    {
        step: 1,
        key: "RequestReceived",
        title: "Bước 1: Tiếp nhận yêu cầu",
        subtitle: "Kiểm tra Serial / IMEI",
        description: "Tiếp nhận yêu cầu trực tuyến và đối chiếu Serial/IMEI thiết bị với đơn hàng",
        expectedAction: "Khách gửi đơn đổi trả",
    },
    {
        step: 2,
        key: "ReceivedAtShowroom",
        title: "Bước 2: Nhận máy tại Showroom",
        subtitle: "Quầy VIP 45 cơ sở toàn quốc",
        description: "Tiếp nhận thiết bị tại quầy dịch vụ Showroom hoặc qua bưu cục vận chuyển",
        expectedAction: "Nhận máy tại quầy VIP",
    },
    {
        step: 3,
        key: "TechnicianInspection",
        title: "Bước 3: Thẩm định phần cứng",
        subtitle: "KTV đo kiểm lỗi NSX",
        description: "Kỹ thuật viên chuyên nghiệp thẩm định ngoại quan, đo kiểm phần cứng và xác nhận lỗi NSX",
        expectedAction: "Kỹ thuật viên đo kiểm",
    },
    {
        step: 4,
        key: "ResolutionProcessing",
        title: "Bước 4: Xử lý Đổi máy / Hoàn tiền",
        subtitle: "Đổi 15p tại Showroom",
        description: "Đổi máy mới nguyên seal trong 15 phút tại 45 Showroom hoặc lên lệnh hoàn tiền",
        expectedAction: "Đổi máy O2O lấy ngay 15 phút",
    },
    {
        step: 5,
        key: "Completed",
        title: "Bước 5: Hoàn tất RMA",
        subtitle: "Đóng hồ sơ bảo hành",
        description: "Bàn giao thiết bị mới cho khách hàng, kích hoạt e-Warranty 24T và đóng hồ sơ RMA",
        expectedAction: "Bàn giao & đóng hồ sơ",
    },
];

// ===== Helpers =====

export const getReturnTypeName = (type: EReturnType): string => {
    switch (type) {
        case EReturnType.Return: return "Trả hàng hoàn tiền";
        case EReturnType.Exchange: return "Đổi mới 1 đổi 1 (30 ngày)";
        default: return "Không xác định";
    }
};

export const getReturnReasonName = (reason: EReturnReason): string => {
    switch (reason) {
        case EReturnReason.Defective: return "Lỗi phần cứng NSX (KTV thẩm định)";
        case EReturnReason.WrongItem: return "Giao sai sản phẩm / sai màu sắc";
        case EReturnReason.DamagedInShipping: return "Hư hỏng / móp méo trong vận chuyển";
        case EReturnReason.NotAsDescribed: return "Không đúng mô tả thông số";
        case EReturnReason.ChangedMind: return "Khách hàng đổi ý trong thời hạn chính sách";
        case EReturnReason.Other: return "Lý do khác";
        default: return "Không xác định";
    }
};

export const getReturnStatusName = (status: EReturnStatus): string => {
    switch (status) {
        case EReturnStatus.Requested: return "Bước 1: Đã gửi yêu cầu";
        case EReturnStatus.UnderReview: return "Bước 2: Đang xem xét";
        case EReturnStatus.Approved: return "Bước 2: Đã duyệt tiếp nhận";
        case EReturnStatus.Rejected: return "Đã từ chối RMA";
        case EReturnStatus.ItemReceived: return "Bước 2: Đã nhận máy tại Showroom";
        case EReturnStatus.QualityCheck: return "Bước 3: KTV thẩm định phần cứng";
        case EReturnStatus.RefundProcessing: return "Bước 4: Đang hoàn tiền";
        case EReturnStatus.ExchangeProcessing: return "Bước 4: Đang xuất máy đổi mới 15p";
        case EReturnStatus.Completed: return "Bước 5: Hoàn tất RMA & Đóng hồ sơ";
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
