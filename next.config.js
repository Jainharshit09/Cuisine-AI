/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Enable standalone output for Docker
    output: 'standalone',
    experimental: {
        serverActions: {},
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, must-revalidate',
                    },
                ],
            },
        ];
    },
}

module.exports = nextConfig 