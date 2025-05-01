#!/bin/bash

# Exit on error
set -e

echo "Preparing Deliver AI for Netlify deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build

# Ensure netlify/functions directory exists
mkdir -p netlify/functions

# Copy the production build to the out directory
echo "Setting up for Netlify deployment..."
if [ -d ".next" ]; then
  # Copy the Next.js build output
  mkdir -p out
  cp -r .next/static out/
  cp -r public/* out/

  # Copy API routes to functions directory 
  mkdir -p netlify/functions/api
  cp netlify/functions/api.js netlify/functions/
fi

# Create redirects file for Netlify
echo "Creating routing configuration..."
echo "# Netlify redirects" > out/_redirects
echo "/api/*  /.netlify/functions/api/:splat  200" >> out/_redirects
echo "/*      /index.html                      200" >> out/_redirects

echo "Project has been prepared for Netlify deployment."
echo "You can now deploy the 'out' directory to Netlify." 