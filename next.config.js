/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Static export for GitHub Pages
  images: {
    unoptimized: true,  // Required for static export
  },
  // Deploying to https://zaint10.github.io/workout-tracker
  basePath: '/workout-tracker',
};

module.exports = nextConfig;
