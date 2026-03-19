// Định nghĩa kiểu dữ liệu cho thông tin giới thiệu
export interface AboutInfo {
    hero: {
        title: string
        description: string
    }
    values: {
        title: string
        description: string
    }[]
    history: {
        title: string
        paragraphs: string[]
    }
    team: {
        name: string
        role: string
        image: string
        bio: string
    }[]
    cta: {
        title: string
        description: string
    }
}
