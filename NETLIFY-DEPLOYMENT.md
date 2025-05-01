# Netlify Deployment Guide for Deliver AI

This document provides instructions for deploying the Deliver AI application to Netlify.

## Prerequisites

- A Netlify account
- Git repository with the Deliver AI codebase

## Deployment Steps

### Option 1: Quick Deploy with Static Build (Recommended)

1. Run the static build command locally:
   ```
   npm run build:static
   ```

2. This will create an `out` directory containing the static site files.

3. Log in to your Netlify account and navigate to the "Sites" section.

4. Drag and drop the entire `out` directory onto the Netlify dashboard.

5. Wait for the upload to complete. Netlify will automatically deploy your site and provide a unique URL.

### Option 2: Setup with Netlify Script

For Windows:
```
.\prepare-for-netlify.bat
```

For macOS/Linux:
```
sh prepare-for-netlify.sh
```

These scripts will install dependencies and build the static site.

### Option 3: Git-Based Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).

2. Log in to your Netlify account.

3. Click "New site from Git" and select your Git provider.

4. Find and select your repository.

5. Configure the following build settings:
   - Build command: `npm run build:static`
   - Publish directory: `out`

6. Click "Deploy site".

7. Netlify will automatically build and deploy your site, and provide a unique URL.

## About the Static Build

The static build creates a simplified version of the site that works well with Netlify. It includes:

1. A landing page
2. Proper redirects for SPA routing
3. 404 page handling
4. All public assets

This approach avoids issues with API routes and server components that can cause problems with static hosting.

## Environment Variables

If your application requires environment variables, add them in the Netlify dashboard:

1. Navigate to your site settings.
2. Go to "Build & deploy" > "Environment variables".
3. Add each required environment variable.

## Custom Domain

To use a custom domain:

1. Navigate to your site settings.
2. Go to "Domain management" > "Domains".
3. Click "Add custom domain" and follow the steps.

## Troubleshooting

### 404 Page Not Found Error

If you're seeing a 404 error after deployment, check these common solutions:

1. **Verify _redirects file**: Make sure the `out/_redirects` file exists with the content:
   ```
   /* /index.html 200
   ```

2. **Check Netlify configuration**: Ensure your `netlify.toml` has the correct publish directory and redirects.

3. **Manual fix in Netlify dashboard**:
   - Go to Site settings > Build & deploy > Post processing > Asset optimization
   - Disable asset optimization
   - Go to Site settings > Build & deploy > Post processing > Redirects
   - Add a rule: from `/*` to `/index.html` with status code `200`

4. **Clear deployment cache**: In the Netlify dashboard, go to Deploys and click "Clear cache and deploy site"

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Troubleshooting Netlify Deployments](https://docs.netlify.com/site-deploys/troubleshooting-tips/) 