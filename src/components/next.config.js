/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/media/.*',
      },
    ],
  },
}

module.exports = nextConfig
