// utils/cloudinaryImage.ts

export const optimizeCloudinaryImage = (
    url: string,
    options?: {
        width?: number;
        height?: number;
        quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | "auto:low";
        format?: "auto" | "webp";
    }
) => {
    if (!url || !url.includes("res.cloudinary.com")) {
        return url;
    }

    const {
        width,
        height,
        quality = "auto:best",
        format = "auto",
    } = options || {};

    const transformations = [
        format === "webp" ? "f_webp" : "f_auto",
        `q_${quality}`,
        width ? `w_${width}` : "",
        height ? `h_${height}` : "",
        "c_limit",
        `ar_4:3`
    ]
        .filter(Boolean)
        .join(",");

    return url.replace(
        "/upload/",
        `/upload/${transformations}/`
    );
};