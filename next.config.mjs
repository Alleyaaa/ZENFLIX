/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    TMDB_API_KEY: process.env.TMDB_API_KEY,
  },
};

export default nextConfig;
