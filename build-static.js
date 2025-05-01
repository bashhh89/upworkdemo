const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { mkdir } = require('fs/promises');

// Directories
const publicDir = path.join(__dirname, 'public');
const outDir = path.join(__dirname, 'out');

// Helper function to copy directories recursively
function copyDir(src, dest) {
  // Create the destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  // Read the source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy directories
      copyDir(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Ensure directories exist
async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(`Error creating directory ${dir}:`, error);
    }
  }
}

async function buildStatic() {
  try {
    console.log('Building static version of Deliver AI...');
    
    // Ensure output directory exists
    await ensureDir(outDir);
    
    // Create static landing page
    console.log('Creating static landing page...');
    
    fs.writeFileSync(
      path.join(outDir, 'index.html'),
      fs.readFileSync(path.join(publicDir, 'netlify-landing.html'), 'utf8')
    );
    
    // Create redirects file
    console.log('Creating redirects file...');
    fs.writeFileSync(
      path.join(outDir, '_redirects'),
      '/* /index.html 200'
    );
    
    // Copy 404 page if it exists
    try {
      fs.copyFileSync(
        path.join(publicDir, '404.html'),
        path.join(outDir, '404.html')
      );
      console.log('Copied 404 page');
    } catch (error) {
      console.warn('Warning: Could not copy 404.html, creating a basic one');
      fs.writeFileSync(
        path.join(outDir, '404.html'),
        `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Page Not Found</title>
    <script>
      window.location.href = "/";
    </script>
  </head>
  <body>
    <h1>Page Not Found</h1>
    <p>Redirecting to homepage...</p>
  </body>
</html>`
      );
    }
    
    // Copy any other assets from public dir
    console.log('Copying assets from public directory...');
    fs.readdirSync(publicDir).forEach(file => {
      if (file !== 'netlify-landing.html' && file !== '404.html' && file !== 'index.html') {
        try {
          const srcPath = path.join(publicDir, file);
          const destPath = path.join(outDir, file);
          
          if (fs.lstatSync(srcPath).isDirectory()) {
            // It's a directory, use our cross-platform copy function
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
          console.log(`Copied: ${file}`);
        } catch (error) {
          console.error(`Error copying ${file}:`, error);
        }
      }
    });
    
    console.log('\nStatic build completed successfully!');
    console.log(`Files are available in the '${outDir}' directory.`);
    console.log('You can now deploy this directory to Netlify.');
    
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildStatic(); 