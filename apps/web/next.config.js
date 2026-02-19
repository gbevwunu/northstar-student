/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@northstar/shared', '@northstar/ui'],
  output: 'standalone',
};

module.exports = nextConfig;
