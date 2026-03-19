// src/components/ui/currency-input.tsx
import { Input, InputProps } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface CurrencyInputProps extends Omit<InputProps, 'value' | 'onChange'> {
    value?: number | null;
    onChange?: (value: number) => void;
}

export function CurrencyInput({ value, onChange, ...props }: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('');

    // Format giá trị khi khởi tạo hoặc value thay đổi từ bên ngoài
    useEffect(() => {
        if (value !== undefined && value !== null && !isNaN(value)) {
            setDisplayValue(formatVietnameseCurrency(value));
        } else {
            setDisplayValue('');
        }
    }, [value]);

    // Hàm định dạng số tiền theo kiểu Việt Nam (1.000.000)
    const formatVietnameseCurrency = (num: number): string => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Hàm chuyển đổi chuỗi đã định dạng về số
    const parseCurrencyToNumber = (formattedValue: string): number => {
        return parseFloat(formattedValue.replace(/\./g, '')) || 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Chỉ cho phép nhập số và xóa các ký tự không phải số
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        const numericValue = parseCurrencyToNumber(rawValue);

        // Cập nhật giá trị hiển thị (chưa định dạng để người dùng nhập liệu dễ dàng)
        setDisplayValue(rawValue);

        // Gọi callback với giá trị số
        onChange?.(numericValue);
    };

    const handleBlur = () => {
        // Khi blur, định dạng lại giá trị hiển thị
        const numericValue = parseCurrencyToNumber(displayValue);
        setDisplayValue(formatVietnameseCurrency(numericValue));
    };

    return (
        <Input
            {...props}
            type="text" // Sử dụng text thay vì number để hiển thị định dạng
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            inputMode="numeric" // Hiển thị bàn phím số trên mobile
        />
    );
}