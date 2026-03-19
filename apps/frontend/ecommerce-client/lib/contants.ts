// Format price in VND
export const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price)
}

// Format date
export const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date)
}