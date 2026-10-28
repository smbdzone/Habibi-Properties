/**
 * Generates a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars except hyphens
        .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+/, '') // Trim hyphens from start
        .replace(/-+$/, ''); // Trim hyphens from end
}
/**
 * Generates a unique slug by appending a number if the slug already exists
 * @param baseSlug - The base slug to make unique
 * @param checkExists - Function to check if slug exists
 * @returns A unique slug
 */
export async function generateUniqueSlug(baseSlug, checkExists) {
    let slug = generateSlug(baseSlug);
    let counter = 1;
    const originalSlug = slug;
    while (await checkExists(slug)) {
        slug = `${originalSlug}-${counter}`;
        counter++;
    }
    return slug;
}
