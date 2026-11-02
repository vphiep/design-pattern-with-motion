/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  transpilePackages: ['framer-motion', 'lucide-react', 'gsap', 'animejs']
};

module.exports = nextConfig;
