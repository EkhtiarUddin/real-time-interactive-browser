/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['localhost'],
    },
    env: {
      NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000',
    }
  };
  
  module.exports = nextConfig;
  