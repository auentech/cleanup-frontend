/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      "lodash",
      "@tremor/react",
      "@uiball/loaders",
      "@heroicons/react/24/outline",
    ]
  }
}

module.exports = nextConfig
