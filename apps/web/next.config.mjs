/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@rudrax/shared"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
