import { format } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Định dạng số thành tiền Việt Nam đồng
 * @param value - Giá trị số cần định dạng
 * @returns Chuỗi đã định dạng theo tiền Việt Nam
 */
export const formatVND = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
};

/**
 * Định dạng số thành tiền Việt Nam đồng không có ký hiệu
 * @param value - Giá trị số cần định dạng
 * @returns Chuỗi đã định dạng theo tiền Việt Nam không có ký hiệu
 */
export const formatVNDWithoutSymbol = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value);
};

/**
 * Định dạng ngày thành chuỗi theo dạng dd/mm/yyyy
 * @param date - Ngày cần định dạng (có thể là chuỗi ngày, timestamp hoặc đối tượng Date)
 * @returns Chuỗi ngày đã định dạng theo dạng dd/mm/yyyy
 */
export const formatDateDDMMYYYY = (date: Date | string | number): string => {
    // Tạo đối tượng Date từ các kiểu đầu vào khác nhau
    const d = new Date(date);

    // Kiểm tra nếu ngày không hợp lệ
    if (isNaN(d.getTime())) {
        throw new Error('Invalid date');
    }

    // Lấy các thành phần ngày, tháng, năm
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = d.getFullYear();

    // Trả về chuỗi định dạng dd/mm/yyyy
    return `${day}/${month}/${year}`;
};

export const formatDateTime = (dateString: string) => {
    try {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: vi });
    } catch {
        return dateString;
    }
};

// Format date
export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "numeric",
    })
}

// Format number with compact notation
export const formatCompactNumber = (number: number) => {
    return new Intl.NumberFormat("vi-VN", {
        notation: "compact",
        compactDisplay: "short",
    }).format(number)
}
