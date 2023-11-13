/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: true,
      serverComponentsExternalPackages: ['mongoose']
    },
    images: {
      domains: ['m.media-amazon.com', 'pisces.bbystatic.com']
    }
  }
  
  module.exports = nextConfig