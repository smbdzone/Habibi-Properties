export const priceFormat = (value: string | null | number) => {
    if (value === null) return '';
    const str = String(value);
    const digits = str.replace(/\D/g, '');
    return Number(digits).toLocaleString();
}