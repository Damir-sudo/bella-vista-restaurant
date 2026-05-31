/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
  experimental: {
    // Server Actions are stable in Next 14; keep body size sane for image-ish payloads.
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
