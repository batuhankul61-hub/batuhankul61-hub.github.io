/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // The TR and EN trees each have their own root layout, so the 404 page needs its own document.
  experimental: { globalNotFound: true },
};

export default nextConfig;
