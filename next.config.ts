import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 'lastfm.freetls.fastly.net',
        pathname: '/i/u/**',
      },
      {
        protocol: 'https',
        hostname: 'coverartarchive.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
