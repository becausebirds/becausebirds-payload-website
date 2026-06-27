/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/media/.*',
        search: '',
      },
    ],
  },
}

module.exports = nextConfig
