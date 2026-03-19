
// Định nghĩa kiểu dữ liệu cho thông tin liên hệ
export interface ContactInfo {
    phone: {
        numberOrAddress: string
        hoursOrDescription: string
    }
    email: {
        numberOrAddress: string
        hoursOrDescription: string
    }
    office: {
        numberOrAddress: string
        hoursOrDescription: string
    }
    social: {
        name: string
        url: string
    }[]
    faqs: {
        question: string
        answer: string
    }[]
}
