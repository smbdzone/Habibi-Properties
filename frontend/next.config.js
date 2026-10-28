/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",

  // ✅ Inlines critical CSS to eliminate render-blocking requests (est. 910ms savings)
  // This directly improves FCP and LCP scores
  experimental: {
    inlineCss: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
      {
        protocol: "https",
        hostname: "*.flaticon.com",
      },
    ],
    // Allow unoptimized images for external domains not in the list
    unoptimized: false,

    // ✅ Serve modern formats (WebP/AVIF) automatically for optimized images
    formats: ["image/avif", "image/webp"],

    // ✅ Reasonable device/image sizes for responsive srcset generation
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // ✅ Cache optimized images for 60 days on the server
    minimumCacheTTL: 60 * 60 * 24 * 60,
  },

  // ✅ Enable gzip/brotli compression on the server
  compress: true,

  // ✅ Remove the X-Powered-By header (tiny security/perf win)
  poweredByHeader: false,

  // ✅ Long-lived immutable caching for static images in /public/images
  // (Next.js already does this for /_next/static, but not for /public files)
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.webp",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;