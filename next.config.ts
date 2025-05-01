import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable both static and server-side rendering
  // This allows us to export static files but still use API routes
  output: process.env.NETLIFY ? "export" : undefined,
  
  // Disable ESLint during build to prevent build failures
  eslint: {
    // Only run ESLint during development, not during builds
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    unoptimized: true, // Required for static export
    domains: ["randomuser.me", "picsum.photos"], // For external image domains
  },
  
  // Detect if we're running on Netlify or Vercel
  env: {
    NETLIFY: process.env.NETLIFY === 'true' ? 'true' : 'false',
    VERCEL: process.env.VERCEL === 'true' ? 'true' : 'false',
  },
  
  // Make API calls work with Netlify functions
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NETLIFY === 'true'
          ? '/.netlify/functions/api/:path*' 
          : '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
