/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests to the json-server running on 4000
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
