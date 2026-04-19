const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack(config) {
    config.resolve.alias["react-router-dom"] = path.resolve(__dirname, "src/lib/router.tsx");
    return config;
  },
};

module.exports = nextConfig;
