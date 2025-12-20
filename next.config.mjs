/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',

  // برای پشتیبانی از مسیرهای پویا با کاراکترهای فارسی
  trailingSlash: true,


};

export default nextConfig;