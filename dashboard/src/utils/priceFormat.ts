// src/utils/priceFormat.ts
export const formatPrice = (value: string | number | null | undefined): string => {
    if (value == null) return '';
    const str = String(value);
    const digits = str.replace(/\D/g, '');
    if (!digits) return '';
    return Number(digits).toLocaleString();
};

export const parsePrice = (value: string | number | null | undefined): string => {
    if (value == null) return '';
    const str = String(value);
    return str.replace(/\D/g, '');
};