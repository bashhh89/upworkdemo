import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable both static and server-side rendering
  // This allows us to export static files but still use API routes
  output: process.env.NETLIFY ? "export" : undefined,
  
  images: {
    unoptimized: true, // Required for static export
    domains: ["randomuser.me", "picsum.photos"], // For external image domains
  },
  
  // Detect if we're running on Netlify
  env: {
    NETLIFY: process.env.NETLIFY === 'true',
  },
  
  // Make API calls work with Netlify functions
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NETLIFY 
          ? '/.netlify/functions/api/:path*' 
          : '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
