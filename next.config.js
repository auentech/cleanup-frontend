/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '127.0.0.1',
            },
            {
                protocol: 'https',
                hostname: 'api.cleanuplaundry.in',
            },
        ],
    },
}

module.exports = nextConfig
