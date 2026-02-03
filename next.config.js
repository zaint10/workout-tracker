/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: Remove 'output: export' since we're using Supabase (requires server)
  // For deployment, use Vercel instead of GitHub Pages
};

module.exports = nextConfig;
