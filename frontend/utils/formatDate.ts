export const formatDate = (date: string | number) => {
    return Intl.DateTimeFormat("en-US", {
        year: 'numeric',
        day: 'numeric',
        month: 'short',
    }).format(new Date(date))
}