/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Static export for GitHub Pages
  images: {
    unoptimized: true,  // Required for static export
  },
  // If deploying to https://username.github.io/workout-tracker
  // Uncomment the line below and replace with your repo name:
  // basePath: '/workout-tracker',
};

module.exports = nextConfig;
