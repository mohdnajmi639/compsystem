/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['cloudinary'],
  },
};

export default nextConfig;
